from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Path
from pydantic import BaseModel
from backend.app.memory.repository import repo
from backend.app.services.simulation_service import simulation_service
from backend.app.core.exceptions import RunNotFoundError, SimulationAlreadyRunningError

router = APIRouter(prefix="/runs", tags=["runs"])

class CreateRunRequest(BaseModel):
    seed: Optional[int] = 42

class StartRunRequest(BaseModel):
    seed: Optional[int] = None
    speed_multiplier: Optional[float] = 1.0

class ReplayRunRequest(BaseModel):
    speed_multiplier: Optional[float] = 1.0

@router.post("", response_model=Dict[str, Any])
async def create_run(body: CreateRunRequest = CreateRunRequest()):
    try:
        return await simulation_service.create_run(body.seed)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=List[Dict[str, Any]])
async def list_runs(limit: int = Query(50, ge=1, le=100)):
    return await repo.list_runs(limit)

@router.get("/{run_id}", response_model=Dict[str, Any])
async def get_run(run_id: str = Path(...)):
    try:
        return await simulation_service.get_run_details(run_id)
    except RunNotFoundError:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")

@router.post("/{run_id}/start", response_model=Dict[str, Any])
async def start_run(run_id: str, body: StartRunRequest = StartRunRequest()):
    try:
        return await simulation_service.start_run(run_id, body.seed, body.speed_multiplier or 1.0)
    except RunNotFoundError:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")
    except SimulationAlreadyRunningError:
        raise HTTPException(status_code=409, detail=f"Run '{run_id}' is already active")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{run_id}/stop", response_model=Dict[str, Any])
async def stop_run(run_id: str):
    return await simulation_service.stop_run(run_id)

@router.post("/{run_id}/replay", response_model=Dict[str, Any])
async def replay_run(run_id: str, body: ReplayRunRequest = ReplayRunRequest()):
    try:
        return await simulation_service.replay_run(run_id, body.speed_multiplier or 1.0)
    except RunNotFoundError:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")

@router.get("/{run_id}/events", response_model=List[Dict[str, Any]])
async def get_run_events(run_id: str):
    return await repo.get_events_for_run(run_id)

@router.get("/{run_id}/metrics", response_model=Dict[str, Any])
async def get_run_metrics(run_id: str):
    return await repo.get_metrics_for_run(run_id)

@router.get("/{run_id}/report", response_model=Dict[str, Any])
async def get_run_report(run_id: str):
    report = await repo.get_director_report(run_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Director report for run '{run_id}' not found")
    return report

@router.get("/{run_id}/patch", response_model=Dict[str, Any])
async def get_run_patch(run_id: str):
    patch = await repo.get_balance_patch(run_id)
    if not patch:
        raise HTTPException(status_code=404, detail=f"Balance patch for run '{run_id}' not found")
    return patch
