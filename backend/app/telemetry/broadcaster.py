import asyncio
import json
from typing import Dict, Set, List, Any
from fastapi import WebSocket
from backend.app.telemetry.events import TelemetryEvent
from backend.app.core.logging import logger

class EventBroadcaster:
    """
    Manages active WebSocket connections per run_id, handles broadcast
    broadcasting with queueing, connection resilience, and historical event buffers.
    """
    def __init__(self):
        self._connections: Dict[str, Set[WebSocket]] = {}
        self._event_history: Dict[str, List[Dict[str, Any]]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, run_id: str, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            if run_id not in self._connections:
                self._connections[run_id] = set()
            self._connections[run_id].add(websocket)
            logger.info(f"WebSocket connected for run {run_id}. Total active: {len(self._connections[run_id])}")

    async def disconnect(self, run_id: str, websocket: WebSocket):
        async with self._lock:
            if run_id in self._connections:
                self._connections[run_id].discard(websocket)
                if not self._connections[run_id]:
                    del self._connections[run_id]
            logger.info(f"WebSocket disconnected for run {run_id}")

    async def broadcast(self, run_id: str, event: TelemetryEvent):
        event_dict = event.to_broadcast_dict()
        
        # Buffer in memory for instant replay / connect
        async with self._lock:
            if run_id not in self._event_history:
                self._event_history[run_id] = []
            self._event_history[run_id].append(event_dict)
            
            subscribers = list(self._connections.get(run_id, set()))

        # Broadcast concurrently to active connections
        if subscribers:
            message_json = json.dumps(event_dict)
            dead_sockets = []
            for ws in subscribers:
                try:
                    await ws.send_text(message_json)
                except Exception as ex:
                    logger.warning(f"Failed to send to websocket: {ex}")
                    dead_sockets.append(ws)

            if dead_sockets:
                async with self._lock:
                    for ws in dead_sockets:
                        self._connections.get(run_id, set()).discard(ws)

    def get_events(self, run_id: str) -> List[Dict[str, Any]]:
        return self._event_history.get(run_id, [])

    def clear(self, run_id: str):
        if run_id in self._event_history:
            del self._event_history[run_id]

broadcaster = EventBroadcaster()
