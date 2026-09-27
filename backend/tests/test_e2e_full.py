import pytest
import asyncio
from backend.app.memory.repository import repo
from backend.app.services.simulation_service import simulation_service
from backend.app.telemetry.broadcaster import broadcaster

@pytest.mark.asyncio
async def test_full_swarm_simulation_pipeline():
    # 1. Initialize SQLite repository
    await repo.initialize()

    # 2. Create simulation run
    run_data = await simulation_service.create_run(seed=42)
    run_id = run_data["id"]
    assert run_id.startswith("RUN-")
    assert run_data["status"] == "created"

    # 3. Start Swarm simulation with accelerated speed
    start_res = await simulation_service.start_run(run_id, seed=42, speed_multiplier=20.0)
    assert start_res["status"] == "running"

    # 4. Wait for simulation swarm to complete (3 personas + Director)
    max_wait = 30
    elapsed = 0
    completed = False
    while elapsed < max_wait:
        await asyncio.sleep(1)
        elapsed += 1
        details = await simulation_service.get_run_details(run_id)
        status = details["run"]["status"]
        if status in ["completed", "stopped"]:
            completed = True
            break

    assert completed is True, f"Simulation did not complete within {max_wait}s. Current status: {details['run']['status']}"

    # 5. Verify all 3 agents recorded metrics
    details = await simulation_service.get_run_details(run_id)
    metrics = details["metrics"]
    assert "casual" in metrics
    assert "speedrunner" in metrics
    assert "explorer" in metrics

    casual_m = metrics["casual"]
    speed_m = metrics["speedrunner"]
    exp_m = metrics["explorer"]

    # Assert persona differentiated behavior
    assert casual_m["actions_taken"] > 0
    assert speed_m["bypasses_used"] >= 1, "Speedrunner should utilize bypass routes"
    assert exp_m["items_collected"] >= 1, "Explorer should gather dungeon loot"

    # 6. Verify Telemetry Events
    events = await repo.get_events_for_run(run_id)
    assert len(events) >= 15
    event_types = set(e["event_type"] for e in events)
    assert "SIMULATION_STARTED" in event_types
    assert "AGENT_OBSERVATION" in event_types
    assert "AGENT_DECISION" in event_types
    assert "TOOL_CALL" in event_types
    assert "ACTION_RESULT" in event_types
    assert "DIRECTOR_STARTED" in event_types
    assert "DIRECTOR_FINISHED" in event_types
    assert "PATCH_GENERATED" in event_types
    assert "SIMULATION_FINISHED" in event_types

    # 7. Verify Director Report
    report = details["report"]
    assert report is not None
    assert "health_score" in report
    assert 0 <= report["health_score"] <= 100
    assert len(report["executive_summary"]) > 20
    assert len(report["recommendations"]) >= 1

    # 8. Verify balance_patch.json
    patch = details["patch"]
    assert patch is not None
    assert patch["version"] == "1.0"
    assert patch["simulation_id"] == run_id
    assert len(patch["changes"]) >= 1
    
    first_change = patch["changes"][0]
    assert "room" in first_change
    assert "recommendation" in first_change
    assert "confidence" in first_change
    assert first_change["confidence"] >= 0.5
