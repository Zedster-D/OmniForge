import abc
import os
import json
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
from backend.app.engine.models import GameState, ActionResult, ActionType
from backend.app.engine.game_engine import SimulatedGameEngine
from backend.app.telemetry.events import TelemetryEvent, EventType
from backend.app.telemetry.broadcaster import broadcaster
from backend.app.memory.repository import repo
from backend.app.core.config import settings
from backend.app.core.logging import logger

class AgentDecisionResult:
    def __init__(self, action: str, reasoning: str, confidence: float = 1.0, metadata: Optional[Dict[str, Any]] = None):
        self.action = action
        self.reasoning = reasoning
        self.confidence = confidence
        self.metadata = metadata or {}

class AgentDecisionProvider(abc.ABC):
    @abc.abstractmethod
    async def decide_action(
        self,
        agent_id: str,
        persona_name: str,
        persona_description: str,
        game_state: GameState,
        recent_history: List[Dict[str, Any]],
        frustration: int = 0
    ) -> AgentDecisionResult:
        pass

class OpenAIProvider(AgentDecisionProvider):
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model = model
        try:
            from openai import AsyncOpenAI
            self.client = AsyncOpenAI(api_key=api_key)
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
            self.client = None

    async def decide_action(
        self,
        agent_id: str,
        persona_name: str,
        persona_description: str,
        game_state: GameState,
        recent_history: List[Dict[str, Any]],
        frustration: int = 0
    ) -> AgentDecisionResult:
        if not self.client:
            raise RuntimeError("OpenAI client not initialized.")
            
        system_prompt = f"""You are the autonomous AI player agent '{persona_name}' playing a 10-room dungeon crawler.
Persona constraints:
{persona_description}

Current Frustration: {frustration}/100.

You must choose EXACTLY ONE action from the available actions list.
Respond ONLY with a valid JSON object matching this schema:
{{
  "action": "action_name_from_available_actions",
  "reasoning": "1-2 sentence explanation of your tactical decision from your persona's perspective",
  "confidence": 0.95
}}
"""
        user_prompt = f"""Current Game State:
{json.dumps(game_state.to_summary_dict(), indent=2)}

Available actions: {game_state.available_actions}
Recent history: {json.dumps(recent_history[-3:], default=str)}

Choose your action:"""

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.4,
                max_tokens=200
            )
            data = json.loads(response.choices[0].message.content)
            action = data.get("action", ActionType.INSPECT.value)
            if action not in game_state.available_actions and game_state.available_actions:
                action = game_state.available_actions[0]
            return AgentDecisionResult(
                action=action,
                reasoning=data.get("reasoning", "Executing tactical decision."),
                confidence=float(data.get("confidence", 0.9))
            )
        except Exception as e:
            logger.warning(f"OpenAI decision failed: {e}. Falling back to deterministic provider.")
            fallback = LocalDeterministicProvider()
            return await fallback.decide_action(agent_id, persona_name, persona_description, game_state, recent_history, frustration)

class LocalDeterministicProvider(AgentDecisionProvider):
    """
    Deterministic rule engine that accurately mirrors player personas with deep behavioral heuristics.
    """
    async def decide_action(
        self,
        agent_id: str,
        persona_name: str,
        persona_description: str,
        game_state: GameState,
        recent_history: List[Dict[str, Any]],
        frustration: int = 0
    ) -> AgentDecisionResult:
        avail = game_state.available_actions
        if not avail:
            return AgentDecisionResult("none", "No available actions.", 1.0)

        # Delegate to persona-specific logic
        if agent_id == "casual":
            return self._decide_casual(game_state, avail, recent_history, frustration)
        elif agent_id == "speedrunner":
            return self._decide_speedrunner(game_state, avail, recent_history)
        elif agent_id == "explorer":
            return self._decide_explorer(game_state, avail, recent_history)
        else:
            return AgentDecisionResult(avail[0], f"Standard tactical selection: {avail[0]}", 0.8)

    def _decide_casual(self, state: GameState, avail: List[str], history: List[Dict[str, Any]], frustration: int) -> AgentDecisionResult:
        # Priority 1: Heal if HP is low or critical
        if state.player_hp <= 45 and ActionType.HEAL.value in avail:
            return AgentDecisionResult(
                ActionType.HEAL.value,
                f"Health is low ({state.player_hp}%). Survival is top priority, using potion.",
                0.95
            )
        
        # Priority 2: Dodge if frustrated or enemy has high damage
        if frustration > 60 and ActionType.DODGE.value in avail and random_flip(0.4):
            return AgentDecisionResult(
                ActionType.DODGE.value,
                "Overwhelmed by enemy attacks; attempting evasive maneuver to recover balance.",
                0.85
            )
            
        # Priority 3: Bypass if available and HP is below 60
        if state.player_hp < 60 and ActionType.BYPASS.value in avail:
            return AgentDecisionResult(
                ActionType.BYPASS.value,
                "Intimidated by room hazard/enemy; taking the safer detour bypass.",
                0.90
            )

        # Priority 4: Collect obvious items
        if ActionType.COLLECT.value in avail and state.player_hp > 50:
            return AgentDecisionResult(
                ActionType.COLLECT.value,
                "Grabbing nearby supply drop to bolster inventory.",
                0.80
            )

        # Priority 5: Safe Standard Attack (avoid heavy attacks if HP low)
        if ActionType.ATTACK.value in avail:
            return AgentDecisionResult(
                ActionType.ATTACK.value,
                "Executing controlled basic attack to stay safe.",
                0.85
            )
            
        if ActionType.REST.value in avail:
            return AgentDecisionResult(
                ActionType.REST.value,
                "Resting in safe room to recover stamina and hit points.",
                0.90
            )

        return AgentDecisionResult(avail[0], f"Performing {avail[0]} to progress.", 0.75)

    def _decide_speedrunner(self, state: GameState, avail: List[str], history: List[Dict[str, Any]]) -> AgentDecisionResult:
        # Rule 1: Always take bypass immediately
        if ActionType.BYPASS.value in avail:
            return AgentDecisionResult(
                ActionType.BYPASS.value,
                "Bypass detected! Skipping room combat to optimize completion split.",
                0.99,
                {"route_optimized": True}
            )

        # Rule 2: Maximize DPS with Heavy Attack
        if ActionType.HEAVY_ATTACK.value in avail:
            return AgentDecisionResult(
                ActionType.HEAVY_ATTACK.value,
                "Unleashing maximum burst damage to eliminate target in minimum frames.",
                0.92
            )
            
        # Rule 3: Regular attack if heavy unavailable
        if ActionType.ATTACK.value in avail:
            return AgentDecisionResult(
                ActionType.ATTACK.value,
                "Executing quick attack sequence.",
                0.90
            )

        # Rule 4: Quick heal only if strictly lethal danger (<20 HP)
        if state.player_hp <= 20 and ActionType.HEAL.value in avail:
            return AgentDecisionResult(
                ActionType.HEAL.value,
                "HP in one-shot lethal threshold; buffering rapid heal.",
                0.85
            )

        return AgentDecisionResult(avail[0], f"Fast sequence: {avail[0]}.", 0.80)

    def _decide_explorer(self, state: GameState, avail: List[str], history: List[Dict[str, Any]]) -> AgentDecisionResult:
        # Rule 1: Always inspect the room first
        if not state.inspected_current_room and ActionType.INSPECT.value in avail:
            return AgentDecisionResult(
                ActionType.INSPECT.value,
                f"Analyzing Room {state.room} architecture, lore markings, and environmental details.",
                0.98
            )

        # Rule 2: Explore side paths & secret alcoves
        if ActionType.EXPLORE.value in avail:
            return AgentDecisionResult(
                ActionType.EXPLORE.value,
                "Investigating branching side tunnel to discover hidden relics.",
                0.95
            )

        # Rule 3: Interact with mechanisms / hazards
        if ActionType.INTERACT.value in avail:
            return AgentDecisionResult(
                ActionType.INTERACT.value,
                "Examining and disarming dungeon mechanism.",
                0.90
            )

        # Rule 4: Collect all items
        if ActionType.COLLECT.value in avail:
            return AgentDecisionResult(
                ActionType.COLLECT.value,
                "Collecting discovered relics, consumables, and lore scrolls.",
                0.92
            )

        # Rule 5: Combat engagement with careful tactical attacks
        if ActionType.ATTACK.value in avail:
            return AgentDecisionResult(
                ActionType.ATTACK.value,
                "Engaging enemy after full environmental assessment.",
                0.85
            )

        if ActionType.HEAL.value in avail and state.player_hp < 60:
            return AgentDecisionResult(
                ActionType.HEAL.value,
                "Replenishing vitality before next discovery.",
                0.85
            )

        return AgentDecisionResult(avail[0], f"Exploring via {avail[0]}.", 0.80)

def random_flip(p: float) -> bool:
    import random
    return random.random() < p

class BasePlaytestingAgent(abc.ABC):
    def __init__(
        self,
        agent_id: str,
        name: str,
        persona_description: str,
        engine: SimulatedGameEngine,
        decision_provider: AgentDecisionProvider,
        speed_multiplier: float = 1.0
    ):
        self.agent_id = agent_id
        self.name = name
        self.persona_description = persona_description
        self.engine = engine
        self.decision_provider = decision_provider
        self.speed_multiplier = max(0.2, speed_multiplier)
        
        # State & metrics
        self.frustration: int = 0
        self.frustration_history: List[Dict[str, Any]] = []
        self.recent_history: List[Dict[str, Any]] = []
        
        self.rooms_completed: int = 0
        self.actions_taken: int = 0
        self.failed_actions: int = 0
        self.damage_taken: int = 0
        self.damage_dealt: int = 0
        self.heals_used: int = 0
        self.bypasses_used: int = 0
        self.items_collected: int = 0
        self.is_finished: bool = False

    async def observe(self) -> GameState:
        return self.engine.get_state()

    async def decide(self, state: GameState) -> AgentDecisionResult:
        return await self.decision_provider.decide_action(
            agent_id=self.agent_id,
            persona_name=self.name,
            persona_description=self.persona_description,
            game_state=state,
            recent_history=self.recent_history,
            frustration=self.frustration
        )

    async def tool_call(self, action: str) -> ActionResult:
        return self.engine.execute_action(action)

    @abc.abstractmethod
    def update_metrics(self, result: ActionResult, state_before: GameState, decision: AgentDecisionResult):
        pass

    async def step(self) -> Dict[str, Any]:
        """Performs a single complete agent cycle."""
        if self.is_finished or self.engine.is_dead or self.engine.is_victory:
            self.is_finished = True
            return {"finished": True}

        current_room_num = self.engine.current_room.room_number
        state_before = await self.observe()

        # Emit Observation Event
        obs_event = TelemetryEvent(
            id=f"{self.agent_id}_obs_{self.actions_taken}_{current_room_num}",
            run_id=self.engine.run_id,
            agent_id=self.agent_id,
            event_type=EventType.AGENT_OBSERVATION,
            room=current_room_num,
            observation=f"Room {current_room_num} ({self.engine.current_room.title}). Player HP: {state_before.player_hp}%. Enemy: {state_before.enemy_type or 'None'}.",
            player_hp=state_before.player_hp,
            enemy_hp=state_before.enemy_hp,
            frustration=self.frustration
        )
        await self._broadcast_and_save(obs_event)

        # Decision
        decision = await self.decide(state_before)
        
        # Emit Decision Event
        dec_event = TelemetryEvent(
            id=f"{self.agent_id}_dec_{self.actions_taken}_{current_room_num}",
            run_id=self.engine.run_id,
            agent_id=self.agent_id,
            event_type=EventType.AGENT_DECISION,
            room=current_room_num,
            decision_summary=decision.reasoning,
            tool=decision.action,
            player_hp=state_before.player_hp,
            frustration=self.frustration
        )
        await self._broadcast_and_save(dec_event)

        # Tool Call Execution
        tool_event = TelemetryEvent(
            id=f"{self.agent_id}_tool_{self.actions_taken}_{current_room_num}",
            run_id=self.engine.run_id,
            agent_id=self.agent_id,
            event_type=EventType.TOOL_CALL,
            room=current_room_num,
            tool=decision.action,
            tool_args={"room": current_room_num}
        )
        await self._broadcast_and_save(tool_event)

        # Sleep simulated action delay
        delay_s = (0.25 / self.speed_multiplier)
        await asyncio.sleep(delay_s)

        # Execute
        result = await self.tool_call(decision.action)
        self.actions_taken += 1

        # Metrics update
        prev_frustration = self.frustration
        self.update_metrics(result, state_before, decision)
        frust_delta = self.frustration - prev_frustration

        # Emit Action Result Event
        res_event = TelemetryEvent(
            id=f"{self.agent_id}_res_{self.actions_taken}_{current_room_num}",
            run_id=self.engine.run_id,
            agent_id=self.agent_id,
            event_type=EventType.ACTION_RESULT,
            room=current_room_num,
            tool=decision.action,
            tool_result={"success": result.success, "message": result.message, "room_advanced": result.room_advanced},
            damage_taken=result.damage_taken,
            damage_dealt=result.damage_dealt,
            player_hp=result.game_state.player_hp,
            enemy_hp=result.game_state.enemy_hp,
            frustration=self.frustration,
            frustration_delta=frust_delta
        )
        await self._broadcast_and_save(res_event)

        # Frustration Event if changed
        if frust_delta != 0:
            frust_event = TelemetryEvent(
                id=f"{self.agent_id}_frust_{self.actions_taken}_{current_room_num}",
                run_id=self.engine.run_id,
                agent_id=self.agent_id,
                event_type=EventType.FRUSTRATION_UPDATE,
                room=current_room_num,
                frustration=self.frustration,
                frustration_delta=frust_delta,
                payload={"reason": decision.reasoning}
            )
            await self._broadcast_and_save(frust_event)

        # Record History
        step_summary = {
            "room": current_room_num,
            "action": decision.action,
            "success": result.success,
            "message": result.message,
            "damage_taken": result.damage_taken,
            "frustration": self.frustration
        }
        self.recent_history.append(step_summary)

        # Check Room Advance
        if result.room_advanced or (result.game_state.room != current_room_num):
            self.rooms_completed = max(self.rooms_completed, current_room_num)
            room_comp_event = TelemetryEvent(
                id=f"{self.agent_id}_rmcomp_{current_room_num}",
                run_id=self.engine.run_id,
                agent_id=self.agent_id,
                event_type=EventType.ROOM_COMPLETED,
                room=current_room_num,
                payload={"next_room": result.game_state.room, "total_ms": self.engine.total_elapsed_ms}
            )
            await self._broadcast_and_save(room_comp_event)

        # Check Finish
        if result.game_state.is_victory or result.game_state.is_dead:
            self.is_finished = True
            if result.game_state.is_victory:
                self.rooms_completed = 10
            fin_event = TelemetryEvent(
                id=f"{self.agent_id}_finished",
                run_id=self.engine.run_id,
                agent_id=self.agent_id,
                event_type=EventType.AGENT_FINISHED,
                room=result.game_state.room,
                payload={
                    "victory": result.game_state.is_victory,
                    "death": result.game_state.is_dead,
                    "rooms_completed": self.rooms_completed,
                    "total_ms": self.engine.total_elapsed_ms,
                    "actions_taken": self.actions_taken,
                    "damage_taken": self.damage_taken,
                    "avg_frustration": self.get_avg_frustration()
                }
            )
            await self._broadcast_and_save(fin_event)

        return {"finished": self.is_finished, "result": result}

    async def _broadcast_and_save(self, event: TelemetryEvent):
        await broadcaster.broadcast(self.engine.run_id, event)
        await repo.save_event(
            event_id=event.id or f"evt_{datetime.utcnow().timestamp()}",
            run_id=event.run_id,
            agent_id=event.agent_id,
            event_type=event.event_type.value,
            room=event.room,
            timestamp=event.timestamp,
            payload=event.to_broadcast_dict()
        )

    def get_avg_frustration(self) -> float:
        if not self.frustration_history:
            return float(self.frustration)
        return round(sum(f["frustration"] for f in self.frustration_history) / len(self.frustration_history), 1)

    def get_peak_frustration(self) -> int:
        if not self.frustration_history:
            return self.frustration
        return max(f["frustration"] for f in self.frustration_history)

    def get_metrics_summary(self) -> Dict[str, Any]:
        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "rooms_completed": self.rooms_completed,
            "completion_time_ms": self.engine.total_elapsed_ms,
            "actions_taken": self.actions_taken,
            "failed_actions": self.failed_actions,
            "damage_taken": self.damage_taken,
            "damage_dealt": self.damage_dealt,
            "heals_used": self.heals_used,
            "bypasses_used": self.bypasses_used,
            "items_collected": self.items_collected,
            "avg_frustration": self.get_avg_frustration(),
            "peak_frustration": self.get_peak_frustration(),
            "frustration_history": self.frustration_history,
            "is_victory": self.engine.is_victory,
            "is_dead": self.engine.is_dead,
        }
