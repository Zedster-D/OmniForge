import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.app.telemetry.broadcaster import broadcaster
from backend.app.memory.repository import repo
from backend.app.core.logging import logger

router = APIRouter(tags=["websocket"])

@router.websocket("/ws/runs/{run_id}")
async def websocket_endpoint(websocket: WebSocket, run_id: str):
    await broadcaster.connect(run_id, websocket)
    try:
        # Send historical events if any exist to catch up the client
        history = await repo.get_events_for_run(run_id)
        if not history:
            history = broadcaster.get_events(run_id)
            
        for ev in history:
            await websocket.send_text(json.dumps(ev))

        # Keep connection open and listen for optional client pings
        while True:
            data = await websocket.receive_text()
            # Optional client ping/keepalive or commands
            try:
                msg = json.loads(data)
                if msg.get("action") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong", "run_id": run_id}))
            except Exception:
                pass

    except WebSocketDisconnect:
        await broadcaster.disconnect(run_id, websocket)
    except Exception as e:
        logger.warning(f"WebSocket error for run {run_id}: {e}")
        await broadcaster.disconnect(run_id, websocket)
