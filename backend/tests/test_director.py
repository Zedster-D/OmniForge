import pytest
from backend.app.services.patch_generator import patch_generator
from backend.app.memory.repository import repo

def test_balance_patch_generator_schema():
    analytics = {
        "game_health_score": 78,
        "most_problematic_room": 6,
        "room_heatmaps": {
            6: {
                "room": 6,
                "friction_score": 72.0,
                "casual_frustration": 85,
                "speedrunner_friction": 40,
                "explorer_friction": 30,
                "failures": 3,
                "damage_taken": 80,
                "anomalies_count": 2
            }
        }
    }
    anomalies = [
        {"id": "anom_1", "run_id": "TEST-RUN", "agent_id": "casual", "room": 6, "type": "EXCESSIVE_DAMAGE", "severity": "high", "description": "Damage spike", "evidence": {}}
    ]
    agent_metrics = {"casual": {}, "speedrunner": {}, "explorer": {"exploration_score": 85.0}}

    patch_doc = patch_generator.generate_patch("TEST-RUN", analytics, anomalies, agent_metrics, "2026-09-27T12:00:00Z")
    assert patch_doc.version == "1.0"
    assert patch_doc.simulation_id == "TEST-RUN"
    assert len(patch_doc.changes) >= 1
    
    first_change = patch_doc.changes[0]
    assert first_change.room == 6
    assert first_change.category in ["difficulty", "pacing", "rewards", "tuning"]
    assert first_change.confidence > 0.5
    assert len(first_change.affected_agents) > 0
