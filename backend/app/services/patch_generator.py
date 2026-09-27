from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class PatchEvidence(BaseModel):
    casual_frustration_peak: Optional[int] = None
    explorer_frustration_peak: Optional[int] = None
    speedrunner_frustration_peak: Optional[int] = None
    failed_actions: Optional[int] = None
    damage_spike: Optional[int] = None
    critical_hp_events: Optional[int] = None
    time_spent_ms: Optional[int] = None
    extra_details: Dict[str, Any] = Field(default_factory=dict)

class PatchChange(BaseModel):
    id: str
    room: int
    category: str # difficulty, pacing, layout, rewards, mechanics
    severity: str # low, medium, high, critical
    affected_agents: List[str]
    issue: str
    evidence: Dict[str, Any]
    recommendation: str
    confidence: float

class BalancePatchDocument(BaseModel):
    version: str = "1.0"
    simulation_id: str
    summary: str
    health_score: int
    changes: List[PatchChange]
    generated_at: str

class PatchGeneratorService:
    """
    Synthesizes telemetry evidence, per-room anomalies, and friction analysis
    to create a machine-readable, schema-valid balance_patch.json.
    """
    def generate_patch(
        self,
        run_id: str,
        analytics: Dict[str, Any],
        anomalies: List[Dict[str, Any]],
        agent_metrics: Dict[str, Any],
        generated_at: str
    ) -> BalancePatchDocument:
        changes: List[PatchChange] = []
        patch_counter = 1
        
        room_heatmaps = analytics.get("room_heatmaps", {})
        
        # 1. Analyze high friction rooms
        for r_num, data in room_heatmaps.items():
            friction = data.get("friction_score", 0.0)
            casual_frust = data.get("casual_frustration", 0)
            failures = data.get("failures", 0)
            damage = data.get("damage_taken", 0)
            anom_count = data.get("anomalies_count", 0)
            
            # Difficulty Spike Patch
            if casual_frust >= 60 or damage >= 50 or friction >= 50.0:
                sev = "critical" if friction >= 75.0 else ("high" if friction >= 50.0 else "medium")
                changes.append(PatchChange(
                    id=f"PATCH-{patch_counter:03d}",
                    room=int(r_num),
                    category="difficulty",
                    severity=sev,
                    affected_agents=["casual", "explorer"] if casual_frust >= 50 else ["casual"],
                    issue=f"Room {r_num} exhibits severe combat lethality and friction spike.",
                    evidence={
                        "casual_frustration_peak": casual_frust,
                        "total_damage_received": damage,
                        "failed_actions": failures,
                        "anomalies_triggered": anom_count,
                        "friction_score": friction
                    },
                    recommendation=f"Reduce enemy base attack by 18% in Room {r_num} and add 1 guaranteed healing drop.",
                    confidence=0.92 if friction >= 60.0 else 0.84
                ))
                patch_counter += 1

            # Pacing / Slog Patch (for speedrunner friction)
            if data.get("speedrunner_friction", 0) >= 30 and failures > 0:
                changes.append(PatchChange(
                    id=f"PATCH-{patch_counter:03d}",
                    room=int(r_num),
                    category="pacing",
                    severity="medium",
                    affected_agents=["speedrunner"],
                    issue=f"Room {r_num} creates unwanted route bottleneck for high-tempo playstyles.",
                    evidence={
                        "speedrunner_friction": data.get("speedrunner_friction", 0),
                        "room_failures": failures
                    },
                    recommendation=f"Introduce an alternate upper duct or stealth rafter bypass in Room {r_num}.",
                    confidence=0.88
                ))
                patch_counter += 1

        # 2. Check for missing Explorer rewards / unrewarding exploration
        exp_score = agent_metrics.get("explorer", {}).get("exploration_score", 100.0)
        if exp_score < 70.0:
            changes.append(PatchChange(
                id=f"PATCH-{patch_counter:03d}",
                room=analytics.get("most_problematic_room", 6),
                category="rewards",
                severity="low",
                affected_agents=["explorer"],
                issue="Exploration rewards are insufficiently telegraphed or inaccessible.",
                evidence={"explorer_overall_score": exp_score},
                recommendation="Improve visual contrast on secret alcove runes and increase lore relic value.",
                confidence=0.79
            ))
            patch_counter += 1

        # Fallback guarantee: at least 1 comprehensive patch if game is relatively balanced
        if not changes:
            worst_room = analytics.get("most_problematic_room", 1)
            changes.append(PatchChange(
                id="PATCH-001",
                room=worst_room,
                category="tuning",
                severity="low",
                affected_agents=["casual", "speedrunner", "explorer"],
                issue=f"Room {worst_room} was identified as the highest comparative friction point.",
                evidence={"friction_score": room_heatmaps.get(worst_room, {}).get("friction_score", 15.0)},
                recommendation="Fine-tune enemy hitbox recovery frames by 100ms for smoother action cadence.",
                confidence=0.85
            ))

        summary_text = f"Identified {len(changes)} gameplay balance adjustments across {len(set(c.room for c in changes))} rooms. Highest friction observed in Room {analytics.get('most_problematic_room', 1)}."

        return BalancePatchDocument(
            version="1.0",
            simulation_id=run_id,
            summary=summary_text,
            health_score=analytics.get("game_health_score", 85),
            changes=changes,
            generated_at=generated_at
        )

patch_generator = PatchGeneratorService()
