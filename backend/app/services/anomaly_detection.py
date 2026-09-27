import uuid
from typing import List, Dict, Any
from backend.app.telemetry.events import AnomalyEvent, AnomalyType, AnomalySeverity

class AnomalyDetector:
    """
    Analyzes live event streams and agent telemetry to detect gameplay anomalies,
    difficulty spikes, combat balance issues, and navigation blocks.
    """
    def check_step_anomaly(
        self,
        run_id: str,
        agent_id: str,
        room: int,
        action: str,
        success: bool,
        damage_taken: int,
        player_hp: int,
        history: List[Dict[str, Any]]
    ) -> List[AnomalyEvent]:
        anomalies: List[AnomalyEvent] = []
        
        # 1. Repeated Action Failure
        if not success:
            recent_failures = [h for h in history[-3:] if not h.get("success", True)]
            if len(recent_failures) >= 2:
                anomalies.append(AnomalyEvent(
                    id=f"anom_fail_{uuid.uuid4().hex[:8]}",
                    type=AnomalyType.REPEATED_ACTION_FAILURE,
                    run_id=run_id,
                    agent_id=agent_id,
                    room=room,
                    severity=AnomalySeverity.MEDIUM,
                    description=f"Agent '{agent_id}' encountered multiple action failures ({action}) in Room {room}.",
                    evidence={"consecutive_failures": len(recent_failures) + 1, "action": action, "room": room}
                ))

        # 2. Critical HP Spiral
        if player_hp <= 20 and player_hp > 0:
            anomalies.append(AnomalyEvent(
                id=f"anom_hp_{uuid.uuid4().hex[:8]}",
                type=AnomalyType.CRITICAL_HP_SPIRAL,
                run_id=run_id,
                agent_id=agent_id,
                room=room,
                severity=AnomalySeverity.HIGH,
                description=f"Agent '{agent_id}' entered critical HP danger zone ({player_hp}% HP) in Room {room}.",
                evidence={"player_hp": player_hp, "room": room}
            ))

        # 3. Excessive Damage
        if damage_taken >= 30:
            anomalies.append(AnomalyEvent(
                id=f"anom_dmg_{uuid.uuid4().hex[:8]}",
                type=AnomalyType.EXCESSIVE_DAMAGE,
                run_id=run_id,
                agent_id=agent_id,
                room=room,
                severity=AnomalySeverity.HIGH if damage_taken < 45 else AnomalySeverity.CRITICAL,
                description=f"Excessive burst damage of {damage_taken} HP received in Room {room}.",
                evidence={"damage_taken": damage_taken, "room": room}
            ))

        # 4. Repeated Same Action Loop
        if len(history) >= 4:
            same_action_streak = all(h.get("action") == action for h in history[-4:])
            if same_action_streak:
                anomalies.append(AnomalyEvent(
                    id=f"anom_loop_{uuid.uuid4().hex[:8]}",
                    type=AnomalyType.REPEATED_SAME_ACTION,
                    run_id=run_id,
                    agent_id=agent_id,
                    room=room,
                    severity=AnomalySeverity.LOW,
                    description=f"Repetitive action loop detected: '{action}' executed 4+ consecutive times in Room {room}.",
                    evidence={"action": action, "streak": 4, "room": room}
                ))

        return anomalies

    def analyze_run_anomalies(
        self,
        run_id: str,
        agent_metrics: Dict[str, Any],
        room_events: List[Dict[str, Any]]
    ) -> List[AnomalyEvent]:
        """Post-run systemic anomaly pass."""
        systemic: List[AnomalyEvent] = []
        
        # Check room duration anomalies (>8 actions in one room)
        room_turn_counts: Dict[int, int] = {}
        for ev in room_events:
            r = ev.get("room", 1)
            room_turn_counts[r] = room_turn_counts.get(r, 0) + 1
            
        for r, turns in room_turn_counts.items():
            if turns >= 18:
                systemic.append(AnomalyEvent(
                    id=f"anom_dur_{uuid.uuid4().hex[:8]}",
                    type=AnomalyType.LONG_ROOM_DURATION,
                    run_id=run_id,
                    agent_id="all",
                    room=r,
                    severity=AnomalySeverity.MEDIUM,
                    description=f"Room {r} demonstrated excessive turn duration ({turns} total agent actions across swarm).",
                    evidence={"total_swarm_turns": turns, "room": r}
                ))
                
        return systemic

anomaly_detector = AnomalyDetector()
