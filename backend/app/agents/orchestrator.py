import asyncio
import os
from typing import Dict, Any, List, Optional
from datetime import datetime
from backend.app.engine.game_engine import SimulatedGameEngine
from backend.app.agents.base import OpenAIProvider, LocalDeterministicProvider, AgentDecisionProvider
from backend.app.agents.casual import CasualAgent
from backend.app.agents.speedrunner import SpeedrunnerAgent
from backend.app.agents.explorer import ExplorerAgent
from backend.app.agents.director import DirectorAgent
from backend.app.telemetry.events import TelemetryEvent, EventType
from backend.app.telemetry.broadcaster import broadcaster
from backend.app.memory.repository import repo
from backend.app.services.anomaly_detection import anomaly_detector
from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.core.exceptions import SimulationAlreadyRunningError, RunNotFoundError

class SimulationOrchestrator:
    """
    Coordinates simultaneous execution of player agent personas against a 10-room scenario,
    handles real-time anomaly surveillance, drives the Director analysis, and manages run state.
    """
    def __init__(self):
        self._active_tasks: Dict[str, asyncio.Task] = {}
        self._stop_signals: Dict[str, bool] = {}

    def get_ai_mode(self) -> str:
        if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY.strip()) > 5:
            return "OPENAI"
        return "LOCAL DEMO"

    def get_decision_provider(self) -> AgentDecisionProvider:
        ai_mode = self.get_ai_mode()
        if ai_mode == "OPENAI":
            try:
                return OpenAIProvider(api_key=settings.OPENAI_API_KEY, model=settings.OPENAI_MODEL)
            except Exception as e:
                logger.warning(f"Failed to use OpenAIProvider: {e}. Falling back to LocalDeterministicProvider.")
        return LocalDeterministicProvider()

    async def start_simulation(self, run_id: str, seed: int = 42, speed_multiplier: float = 1.0) -> Dict[str, Any]:
        if run_id in self._active_tasks and not self._active_tasks[run_id].done():
            raise SimulationAlreadyRunningError(run_id)

        ai_mode = self.get_ai_mode()
        self._stop_signals[run_id] = False

        # Update run in DB
        await repo.update_run_status(run_id, "running")

        # Launch background execution task
        task = asyncio.create_task(self._run_simulation_swarm(run_id, seed, speed_multiplier, ai_mode))
        self._active_tasks[run_id] = task

        return {
            "run_id": run_id,
            "seed": seed,
            "ai_mode": ai_mode,
            "speed_multiplier": speed_multiplier,
            "status": "running"
        }

    async def stop_simulation(self, run_id: str) -> Dict[str, Any]:
        self._stop_signals[run_id] = True
        if run_id in self._active_tasks:
            self._active_tasks[run_id].cancel()
            del self._active_tasks[run_id]
            
        await repo.update_run_status(run_id, "stopped")
        logger.info(f"Simulation run {run_id} stopped.")
        return {"run_id": run_id, "status": "stopped"}

    async def _run_simulation_swarm(self, run_id: str, seed: int, speed_multiplier: float, ai_mode: str):
        try:
            logger.info(f"Starting simulation swarm for run {run_id} (Seed: {seed}, Mode: {ai_mode}).")
            
            # Emit SIMULATION_STARTED event
            start_event = TelemetryEvent(
                id=f"sim_start_{run_id}",
                run_id=run_id,
                agent_id=None,
                event_type=EventType.SIMULATION_STARTED,
                room=1,
                decision_summary=f"Swarm simulation started with seed {seed} ({ai_mode} mode).",
                payload={"seed": seed, "ai_mode": ai_mode, "speed": speed_multiplier}
            )
            await broadcaster.broadcast(run_id, start_event)
            await repo.save_event(start_event.id, run_id, None, start_event.event_type.value, 1, start_event.timestamp, start_event.to_broadcast_dict())

            # 1. Initialize Engines & Decision Provider
            provider = self.get_decision_provider()
            
            casual_engine = SimulatedGameEngine(run_id, "casual", seed)
            speed_engine = SimulatedGameEngine(run_id, "speedrunner", seed)
            exp_engine = SimulatedGameEngine(run_id, "explorer", seed)

            casual_agent = CasualAgent(casual_engine, provider, speed_multiplier)
            speed_agent = SpeedrunnerAgent(speed_engine, provider, speed_multiplier)
            exp_agent = ExplorerAgent(exp_engine, provider, speed_multiplier)

            agents = [casual_agent, speed_agent, exp_agent]
            detected_anomalies: List[Dict[str, Any]] = []

            # 2. Stepped concurrent agent loop
            while not all(a.is_finished for a in agents):
                if self._stop_signals.get(run_id, False):
                    logger.info(f"Stop signal received for run {run_id}.")
                    break

                for agent in agents:
                    if agent.is_finished:
                        continue

                    # Execute one step
                    step_res = await agent.step()
                    
                    if "result" in step_res:
                        action_res = step_res["result"]
                        # Run Anomaly Check
                        anoms = anomaly_detector.check_step_anomaly(
                            run_id=run_id,
                            agent_id=agent.agent_id,
                            room=action_res.game_state.room,
                            action=action_res.action,
                            success=action_res.success,
                            damage_taken=action_res.damage_taken,
                            player_hp=action_res.game_state.player_hp,
                            history=agent.recent_history
                        )
                        for an in anoms:
                            an_dict = an.model_dump()
                            detected_anomalies.append(an_dict)
                            await repo.save_anomaly(an_dict)
                            
                            # Broadcast ANOMALY_DETECTED
                            anom_event = TelemetryEvent(
                                id=f"anom_evt_{an.id}",
                                run_id=run_id,
                                agent_id=agent.agent_id,
                                event_type=EventType.ANOMALY_DETECTED,
                                room=an.room,
                                decision_summary=f"ANOMALY [{an.type.value}]: {an.description}",
                                anomaly=an
                            )
                            await broadcaster.broadcast(run_id, anom_event)
                            await repo.save_event(anom_event.id, run_id, agent.agent_id, anom_event.event_type.value, an.room, anom_event.timestamp, anom_event.to_broadcast_dict())

                # Yield to event loop
                await asyncio.sleep(0.05)

            # 3. Collect Agent Metrics & Save
            agent_metrics = {}
            for agent in agents:
                m = agent.get_metrics_summary()
                agent_metrics[agent.agent_id] = m
                await repo.save_agent_metrics(run_id, agent.agent_id, m)

            # 4. Fetch all events for run to pass to Director
            all_events = await repo.get_events_for_run(run_id)

            # 5. Execute Director Agent
            director = DirectorAgent(run_id, ai_mode)
            await director.analyze_and_patch(agent_metrics, all_events, detected_anomalies)

            logger.info(f"Swarm simulation run {run_id} completed successfully.")

        except asyncio.CancelledError:
            logger.info(f"Simulation {run_id} task was cancelled.")
        except Exception as e:
            logger.error(f"Error in simulation run {run_id}: {e}", exc_info=True)
            await repo.update_run_status(run_id, "error", 0, str(e))
        finally:
            if run_id in self._active_tasks:
                del self._active_tasks[run_id]

    async def replay_simulation(self, run_id: str, speed_multiplier: float = 1.0):
        """
        Replays recorded events from database over WebSockets at the selected speed.
        """
        events = await repo.get_events_for_run(run_id)
        if not events:
            raise RunNotFoundError(run_id)

        logger.info(f"Starting replay for run {run_id} with {len(events)} events (Speed: {speed_multiplier}x).")
        delay_s = max(0.05, 0.3 / max(0.2, speed_multiplier))

        for ev in events:
            # Rebroadcast event
            tel_event = TelemetryEvent(**ev)
            await broadcaster.broadcast(run_id, tel_event)
            await asyncio.sleep(delay_s)

orchestrator = SimulationOrchestrator()
