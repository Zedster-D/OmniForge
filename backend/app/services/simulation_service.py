import uuid
from typing import Dict, Any, List, Optional
from backend.app.memory.repository import repo
from backend.app.agents.orchestrator import orchestrator
from backend.app.core.exceptions import RunNotFoundError
from backend.app.services.analytics import analytics_engine

class SimulationService:
    async def create_run(self, seed: Optional[int] = None) -> Dict[str, Any]:
        run_id = f"RUN-{uuid.uuid4().hex[:6].upper()}"
        actual_seed = seed if seed is not None else 42
        ai_mode = orchestrator.get_ai_mode()
        
        run_data = await repo.create_run(run_id, actual_seed, ai_mode)
        return run_data

    async def start_run(self, run_id: str, seed: Optional[int] = None, speed_multiplier: float = 1.0) -> Dict[str, Any]:
        run = await repo.get_run(run_id)
        if not run:
            raise RunNotFoundError(run_id)
        
        actual_seed = seed if seed is not None else run.get("seed", 42)
        return await orchestrator.start_simulation(run_id, actual_seed, speed_multiplier)

    async def stop_run(self, run_id: str) -> Dict[str, Any]:
        return await orchestrator.stop_simulation(run_id)

    async def replay_run(self, run_id: str, speed_multiplier: float = 1.0) -> Dict[str, Any]:
        run = await repo.get_run(run_id)
        if not run:
            raise RunNotFoundError(run_id)
        import asyncio
        asyncio.create_task(orchestrator.replay_simulation(run_id, speed_multiplier))
        return {"run_id": run_id, "status": "replaying", "speed": speed_multiplier}

    async def get_run_details(self, run_id: str) -> Dict[str, Any]:
        run = await repo.get_run(run_id)
        if not run:
            raise RunNotFoundError(run_id)
        
        metrics = await repo.get_metrics_for_run(run_id)
        anomalies = await repo.get_anomalies_for_run(run_id)
        report = await repo.get_director_report(run_id)
        patch = await repo.get_balance_patch(run_id)
        events = await repo.get_events_for_run(run_id)

        analytics = None
        if metrics and events:
            analytics = analytics_engine.compute_run_analytics(metrics, events, anomalies)

        return {
            "run": run,
            "metrics": metrics,
            "anomalies": anomalies,
            "report": report,
            "patch": patch,
            "analytics": analytics,
            "event_count": len(events)
        }

simulation_service = SimulationService()
