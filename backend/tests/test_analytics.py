import pytest
from backend.app.services.analytics import analytics_engine
from backend.app.services.anomaly_detection import anomaly_detector

def test_analytics_engine_computation():
    agent_metrics = {
        "casual": {
            "agent_id": "casual",
            "rooms_completed": 8,
            "completion_time_ms": 18000,
            "actions_taken": 25,
            "failed_actions": 3,
            "damage_taken": 95,
            "damage_dealt": 140,
            "heals_used": 3,
            "bypasses_used": 1,
            "items_collected": 2,
            "avg_frustration": 42.5,
            "peak_frustration": 85
        },
        "speedrunner": {
            "agent_id": "speedrunner",
            "rooms_completed": 10,
            "completion_time_ms": 9500,
            "actions_taken": 14,
            "failed_actions": 1,
            "damage_taken": 35,
            "damage_dealt": 110,
            "heals_used": 0,
            "bypasses_used": 5,
            "items_collected": 0,
            "avg_frustration": 15.0,
            "peak_frustration": 30
        },
        "explorer": {
            "agent_id": "explorer",
            "rooms_completed": 10,
            "completion_time_ms": 28000,
            "actions_taken": 38,
            "failed_actions": 0,
            "damage_taken": 50,
            "damage_dealt": 180,
            "heals_used": 2,
            "bypasses_used": 0,
            "items_collected": 8,
            "avg_frustration": 18.0,
            "peak_frustration": 40
        }
    }
    
    events = [
        {"room": 6, "agent_id": "casual", "frustration": 85, "damage_taken": 45, "event_type": "ACTION_RESULT", "tool_result": {"success": False}},
        {"room": 6, "agent_id": "speedrunner", "frustration": 20, "damage_taken": 15, "event_type": "ACTION_RESULT", "tool_result": {"success": True}},
        {"room": 6, "agent_id": "explorer", "frustration": 35, "damage_taken": 20, "event_type": "ACTION_RESULT", "tool_result": {"success": True}},
    ]
    anomalies = [
        {"id": "anom_1", "run_id": "TEST", "agent_id": "casual", "room": 6, "type": "EXCESSIVE_DAMAGE", "severity": "high", "description": "High damage in room 6", "evidence": {}}
    ]

    res = analytics_engine.compute_run_analytics(agent_metrics, events, anomalies)
    assert "game_health_score" in res
    assert 0 <= res["game_health_score"] <= 100
    assert res["most_problematic_room"] == 6
    assert len(res["room_heatmaps"]) == 10
