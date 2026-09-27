from enum import Enum
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class EventType(str, Enum):
    SIMULATION_STARTED = "SIMULATION_STARTED"
    ROOM_STARTED = "ROOM_STARTED"
    AGENT_OBSERVATION = "AGENT_OBSERVATION"
    AGENT_DECISION = "AGENT_DECISION"
    TOOL_CALL = "TOOL_CALL"
    ACTION_RESULT = "ACTION_RESULT"
    FRUSTRATION_UPDATE = "FRUSTRATION_UPDATE"
    ROOM_COMPLETED = "ROOM_COMPLETED"
    ANOMALY_DETECTED = "ANOMALY_DETECTED"
    AGENT_FINISHED = "AGENT_FINISHED"
    DIRECTOR_STARTED = "DIRECTOR_STARTED"
    DIRECTOR_FINISHED = "DIRECTOR_FINISHED"
    PATCH_GENERATED = "PATCH_GENERATED"
    SIMULATION_FINISHED = "SIMULATION_FINISHED"

class AnomalySeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AnomalyType(str, Enum):
    REPEATED_ACTION_FAILURE = "REPEATED_ACTION_FAILURE"
    CRITICAL_HP_SPIRAL = "CRITICAL_HP_SPIRAL"
    EXCESSIVE_DAMAGE = "EXCESSIVE_DAMAGE"
    REPEATED_SAME_ACTION = "REPEATED_SAME_ACTION"
    LONG_ROOM_DURATION = "LONG_ROOM_DURATION"
    NO_PROGRESS = "NO_PROGRESS"
    CONTENT_NEVER_DISCOVERED = "CONTENT_NEVER_DISCOVERED"
    IMPOSSIBLE_STATE_TRANSITION = "IMPOSSIBLE_STATE_TRANSITION"

class AnomalyEvent(BaseModel):
    id: str
    type: AnomalyType
    run_id: str
    agent_id: str
    room: int
    description: str
    evidence: Dict[str, Any] = Field(default_factory=dict)
    severity: AnomalySeverity
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")

class TelemetryEvent(BaseModel):
    id: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    run_id: str
    agent_id: Optional[str] = None
    event_type: EventType
    room: int = 1
    
    # Contextual data
    observation: Optional[str] = None
    decision_summary: Optional[str] = None
    tool: Optional[str] = None
    tool_args: Optional[Dict[str, Any]] = None
    tool_result: Optional[Dict[str, Any]] = None
    
    # Metrics snapshots
    player_hp: Optional[int] = None
    enemy_hp: Optional[int] = None
    frustration: Optional[int] = None
    frustration_delta: Optional[int] = None
    damage_taken: Optional[int] = None
    damage_dealt: Optional[int] = None
    
    # Anomaly or Director payload
    anomaly: Optional[AnomalyEvent] = None
    payload: Dict[str, Any] = Field(default_factory=dict)

    def to_broadcast_dict(self) -> Dict[str, Any]:
        return self.model_dump(exclude_none=True)
