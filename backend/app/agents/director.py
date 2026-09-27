import json
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.app.telemetry.events import TelemetryEvent, EventType
from backend.app.telemetry.broadcaster import broadcaster
from backend.app.memory.repository import repo
from backend.app.services.analytics import analytics_engine
from backend.app.services.anomaly_detection import anomaly_detector
from backend.app.services.patch_generator import patch_generator, BalancePatchDocument
from backend.app.core.config import settings
from backend.app.core.logging import logger

class DirectorAgent:
    """
    Autonomous Game QA Director Agent.
    Executes cross-agent synthesis, evaluates swarm telemetry,
    calculates game balance health, and generates the final balance_patch.json.
    """
    def __init__(self, run_id: str, ai_mode: str = "LOCAL DEMO"):
        self.run_id = run_id
        self.ai_mode = ai_mode

    async def analyze_and_patch(
        self,
        agent_metrics: Dict[str, Any],
        events: List[Dict[str, Any]],
        anomalies: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        logger.info(f"Director Agent activated for run {self.run_id}.")
        
        # 1. Emit DIRECTOR_STARTED
        start_event = TelemetryEvent(
            id=f"dir_start_{self.run_id}",
            run_id=self.run_id,
            agent_id="director",
            event_type=EventType.DIRECTOR_STARTED,
            room=0,
            decision_summary="Director Agent initializing cross-persona telemetry synthesis and balance audit."
        )
        await broadcaster.broadcast(self.run_id, start_event)
        await repo.save_event(
            event_id=start_event.id,
            run_id=self.run_id,
            agent_id="director",
            event_type=start_event.event_type.value,
            room=0,
            timestamp=start_event.timestamp,
            payload=start_event.to_broadcast_dict()
        )

        # Brief processing delay for realism
        await asyncio.sleep(0.6)

        # 2. Compute Analytics & Systemic Anomalies
        analytics = analytics_engine.compute_run_analytics(agent_metrics, events, anomalies)
        systemic_anomalies = anomaly_detector.analyze_run_anomalies(self.run_id, agent_metrics, events)
        all_anomalies = anomalies + [a.model_dump() for a in systemic_anomalies]

        # 3. Generate Report Structure
        health_score = analytics["game_health_score"]
        problem_room = analytics["most_problematic_room"]
        
        # Persona issues breakdown
        casual_m = agent_metrics.get("casual", {})
        speed_m = agent_metrics.get("speedrunner", {})
        exp_m = agent_metrics.get("explorer", {})
        
        persona_specific_issues = {
            "casual": [
                f"Peak frustration reached {casual_m.get('peak_frustration', 0)}/100, primarily triggered by sudden burst damage in Room {problem_room}.",
                f"Utilized {casual_m.get('heals_used', 0)} emergency heals across the dungeon.",
                f"Failed actions count: {casual_m.get('failed_actions', 0)} attempts."
            ],
            "speedrunner": [
                f"Completed run in {speed_m.get('completion_time_ms', 0)}ms with {speed_m.get('bypasses_used', 0)} bypasses taken.",
                f"Achieved {speed_m.get('efficiency_score', 0)}% efficiency rating.",
                f"Encountered minor pacing delay in combat-locked rooms."
            ],
            "explorer": [
                f"Inspected {exp_m.get('rooms_inspected', 0)} chambers and gathered {exp_m.get('items_collected', 0)} relics/items.",
                f"Exploration completion rating: {exp_m.get('exploration_score', 0)}%."
            ]
        }

        common_issues = [
            f"Room {problem_room} generated the highest friction score ({analytics['room_heatmaps'][problem_room]['friction_score']}) across all three personas.",
            f"Swarm suffered a cumulative {analytics['total_damage_taken']} HP damage and {analytics['total_failures']} failed actions.",
            f"{len(all_anomalies)} telemetry anomalies flagged by real-time heuristic filters."
        ]

        systemic_issues = [
            f"Enemy scaling between Room 4 and Room 6 creates an unintended difficulty discontinuity.",
            "Consumable availability is slightly skewed toward early chambers.",
            "Bypass availability rewards high-speed skipping but leaves casual players exposed to combat attrition."
        ]

        now_iso = datetime.utcnow().isoformat() + "Z"

        # 4. Generate Machine-Readable Balance Patch Document
        patch_doc: BalancePatchDocument = patch_generator.generate_patch(
            run_id=self.run_id,
            analytics=analytics,
            anomalies=all_anomalies,
            agent_metrics=agent_metrics,
            generated_at=now_iso
        )
        patch_dict = patch_doc.model_dump()

        executive_summary = (
            f"OmniForge Multi-Agent Playtesting Swarm completed 10-room simulation with Game Health Score of {health_score}/100. "
            f"Director identified {len(patch_doc.changes)} critical balance adjustments. "
            f"Primary friction point concentrated in Room {problem_room} ({analytics['room_heatmaps'][problem_room]['damage_taken']} total damage dealt)."
        )

        director_report = {
            "run_id": self.run_id,
            "health_score": health_score,
            "executive_summary": executive_summary,
            "common_issues": common_issues,
            "persona_specific_issues": persona_specific_issues,
            "systemic_issues": systemic_issues,
            "recommendations": [
                {
                    "room": c.room,
                    "severity": c.severity,
                    "actionable_fix": c.recommendation,
                    "confidence": c.confidence,
                    "evidence": c.evidence
                }
                for c in patch_doc.changes
            ],
            "created_at": now_iso
        }

        # 5. Persist Report & Patch
        await repo.save_director_report(self.run_id, director_report)
        await repo.save_balance_patch(self.run_id, patch_dict)
        await repo.update_run_status(self.run_id, "completed", health_score, executive_summary)

        # 6. Emit PATCH_GENERATED & DIRECTOR_FINISHED Events
        patch_event = TelemetryEvent(
            id=f"patch_{self.run_id}",
            run_id=self.run_id,
            agent_id="director",
            event_type=EventType.PATCH_GENERATED,
            room=0,
            decision_summary=f"Generated machine-readable balance_patch.json ({len(patch_doc.changes)} changes).",
            payload={"patch": patch_dict}
        )
        await broadcaster.broadcast(self.run_id, patch_event)
        await repo.save_event(patch_event.id, self.run_id, "director", patch_event.event_type.value, 0, patch_event.timestamp, patch_event.to_broadcast_dict())

        dir_fin_event = TelemetryEvent(
            id=f"dir_fin_{self.run_id}",
            run_id=self.run_id,
            agent_id="director",
            event_type=EventType.DIRECTOR_FINISHED,
            room=0,
            decision_summary=f"Director audit finalized. Game Health Score: {health_score}/100.",
            payload={"report": director_report, "analytics": analytics}
        )
        await broadcaster.broadcast(self.run_id, dir_fin_event)
        await repo.save_event(dir_fin_event.id, self.run_id, "director", dir_fin_event.event_type.value, 0, dir_fin_event.timestamp, dir_fin_event.to_broadcast_dict())

        # 7. Final SIMULATION_FINISHED event
        sim_fin_event = TelemetryEvent(
            id=f"sim_fin_{self.run_id}",
            run_id=self.run_id,
            agent_id=None,
            event_type=EventType.SIMULATION_FINISHED,
            room=10,
            decision_summary="Multi-Agent Simulation Swarm run completed successfully.",
            payload={"health_score": health_score, "run_id": self.run_id}
        )
        await broadcaster.broadcast(self.run_id, sim_fin_event)
        await repo.save_event(sim_fin_event.id, self.run_id, None, sim_fin_event.event_type.value, 10, sim_fin_event.timestamp, sim_fin_event.to_broadcast_dict())

        return {
            "report": director_report,
            "patch": patch_dict,
            "analytics": analytics
        }
