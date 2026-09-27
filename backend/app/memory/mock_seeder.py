import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List
from backend.app.memory.repository import DatabaseRepository
from backend.app.core.logging import logger

async def seed_mock_datasets(repo: DatabaseRepository, force: bool = False):
    """
    Seeds comprehensive mock benchmark simulation runs into the SQLite database.
    Ensures judges and visitors immediately have rich telemetry, heatmaps,
    director audits, and balance patches on web launch.
    """
    existing_runs = await repo.list_runs(limit=10)
    if existing_runs and not force:
        logger.info(f"Database already has {len(existing_runs)} runs. Ensuring demo runs are present...")
        # Check if demo-01 exists
        demo1 = await repo.get_run("run-demo-benchmark-01")
        if demo1:
            logger.info("Demo runs already seeded.")
            return

    logger.info("Seeding benchmark demo datasets into database...")

    # -------------------------------------------------------------
    # RUN 1: Benchmark Run (Seed 42) - High Friction in Room 6
    # -------------------------------------------------------------
    run_id_1 = "run-demo-benchmark-01"
    now = datetime.utcnow()
    created_at_1 = (now - timedelta(minutes=15)).isoformat() + "Z"
    completed_at_1 = (now - timedelta(minutes=10)).isoformat() + "Z"

    await repo.create_run(run_id_1, seed=42, ai_mode="HYBRID_DETERMINISTIC")
    await repo.update_run_status(
        run_id_1,
        status="completed",
        health_score=68,
        summary="High friction identified in Room 6 (The Crucible). Casual player reached 85% frustration due to spike traps. Speedrunner bypassed Room 4 lock."
    )

    # Agent Metrics for Run 1
    casual_metrics_1 = {
        "rooms_completed": 10,
        "completion_time_ms": 14200,
        "actions_taken": 38,
        "failed_actions": 6,
        "damage_taken": 115,
        "damage_dealt": 180,
        "heals_used": 5,
        "bypasses_used": 0,
        "items_collected": 7,
        "avg_frustration": 48.5,
        "peak_frustration": 85,
        "efficiency_score": 62.0,
        "exploration_score": 70.0
    }
    await repo.save_agent_metrics(run_id_1, "casual", casual_metrics_1)

    speedrunner_metrics_1 = {
        "rooms_completed": 10,
        "completion_time_ms": 5800,
        "actions_taken": 16,
        "failed_actions": 1,
        "damage_taken": 35,
        "damage_dealt": 210,
        "heals_used": 0,
        "bypasses_used": 4,
        "items_collected": 1,
        "avg_frustration": 12.0,
        "peak_frustration": 25,
        "efficiency_score": 94.5,
        "exploration_score": 15.0
    }
    await repo.save_agent_metrics(run_id_1, "speedrunner", speedrunner_metrics_1)

    explorer_metrics_1 = {
        "rooms_completed": 10,
        "completion_time_ms": 18500,
        "actions_taken": 52,
        "failed_actions": 2,
        "damage_taken": 60,
        "damage_dealt": 195,
        "heals_used": 2,
        "bypasses_used": 0,
        "items_collected": 15,
        "avg_frustration": 22.0,
        "peak_frustration": 40,
        "efficiency_score": 58.0,
        "exploration_score": 100.0
    }
    await repo.save_agent_metrics(run_id_1, "explorer", explorer_metrics_1)

    # Anomalies for Run 1
    anomalies_1 = [
        {
            "id": f"anom-{uuid.uuid4().hex[:8]}",
            "run_id": run_id_1,
            "agent_id": "casual",
            "room": 6,
            "type": "HIGH_FRUSTRATION_SPIKE",
            "severity": "HIGH",
            "description": "Casual player frustration peaked at 85% after consecutive trap damage and heavy attack counter-strikes.",
            "evidence": {"room": 6, "damage_taken": 45, "failed_heals": 1},
            "timestamp": (now - timedelta(minutes=12)).isoformat() + "Z"
        },
        {
            "id": f"anom-{uuid.uuid4().hex[:8]}",
            "run_id": run_id_1,
            "agent_id": "speedrunner",
            "room": 4,
            "type": "MECHANIC_BYPASS_EXPLOIT",
            "severity": "MEDIUM",
            "description": "Speedrunner bypassed the locking puzzle mechanism in 1 action, skipping intended combat encounter.",
            "evidence": {"room": 4, "bypass_used": True, "actions_taken": 1},
            "timestamp": (now - timedelta(minutes=14)).isoformat() + "Z"
        }
    ]
    for anom in anomalies_1:
        await repo.save_anomaly(anom)

    # Director Report for Run 1
    director_report_1 = {
        "run_id": run_id_1,
        "health_score": 68,
        "executive_summary": "OmniForge swarm analysis reveals significant difficulty disparity between player personas. Room 6 (The Crucible) exhibits severe friction for casual players with an 85% frustration spike, while Speedrunners effortlessly exploit puzzle bypasses in Room 4.",
        "common_issues": [
            "Room 6 boss encounter attacks deal untelegraphed damage exceeding casual player reaction windows.",
            "Bypass mechanics in Room 4 allow complete circumvention of puzzle gating."
        ],
        "persona_specific_issues": {
            "casual": [
                "Low health triggers panic healing lock when enemy attacks interrupt potion use.",
                "Room 6 damage intake of 45 HP over 3 turns causes critical frustration."
            ],
            "speedrunner": [
                "Speedrunner clears 10 rooms in 16 actions, ignoring 93% of designed game items.",
                "Heavy attack burst DPS trivializes mini-boss encounters without resource penalty."
            ],
            "explorer": [
                "Explorer discovers 100% of lore objects but encounters minor pacing stagnation in Room 7."
            ]
        },
        "systemic_issues": [
            "Potion drop frequency in early rooms (1-3) is insufficient for low-skill survival buffers.",
            "Enemy stagger duration is too short for casual recovery."
        ],
        "recommendations": [
            "Increase telegraph wind-up on Room 6 Boss Heavy Cleave by 300ms.",
            "Reduce Room 6 spike trap base damage from 25 to 15.",
            "Add a 1.5s channel requirement to the Room 4 bypass lever to prevent instant skips.",
            "Increase potion drop probability in Room 3 from 20% to 50%."
        ],
        "created_at": completed_at_1
    }
    await repo.save_director_report(run_id_1, director_report_1)

    # Balance Patch for Run 1
    balance_patch_1 = {
        "version": "1.1.0-auto-patch",
        "run_id": run_id_1,
        "summary": "Tuning Room 6 hazard damage, extending stagger windows, and patching speedrunner bypass in Room 4.",
        "changes": [
            {
                "target": "room_6.boss.heavy_attack.damage",
                "old_value": 35,
                "new_value": 24,
                "reason": "Mitigate casual player 85% peak frustration spike."
            },
            {
                "target": "room_6.spike_trap.damage",
                "old_value": 25,
                "new_value": 15,
                "reason": "Reduce unavoidable environmental damage."
            },
            {
                "target": "room_4.bypass.channel_time_ms",
                "old_value": 0,
                "new_value": 1500,
                "reason": "Prevent exploit bypass of puzzle lock."
            },
            {
                "target": "room_3.loot.potion_drop_rate",
                "old_value": 0.20,
                "new_value": 0.50,
                "reason": "Provide casual player health recovery buffer before Room 4."
            }
        ],
        "created_at": completed_at_1
    }
    await repo.save_balance_patch(run_id_1, balance_patch_1)

    # Save initial simulated events for Run 1
    for room in range(1, 11):
        # Casual event
        await repo.save_event(
            event_id=f"ev-cas-{room}",
            run_id=run_id_1,
            agent_id="casual",
            event_type="ACTION_RESULT",
            room=room,
            timestamp=(now - timedelta(minutes=15 - room)).isoformat() + "Z",
            payload={
                "event_type": "ACTION_RESULT",
                "agent_id": "casual",
                "room": room,
                "tool": "attack" if room % 2 == 0 else "inspect",
                "tool_result": {"success": True, "message": f"Casual successfully navigated Room {room}"},
                "frustration": 20 + (room * 6) if room <= 6 else max(30, 85 - (room - 6) * 10),
                "frustration_delta": 6 if room <= 6 else -10,
                "damage_taken": 15 if room == 6 else (5 if room % 3 == 0 else 0),
                "damage_dealt": 20,
                "timestamp": (now - timedelta(minutes=15 - room)).isoformat() + "Z"
            }
        )

        # Speedrunner event
        await repo.save_event(
            event_id=f"ev-spd-{room}",
            run_id=run_id_1,
            agent_id="speedrunner",
            event_type="ACTION_RESULT",
            room=room,
            timestamp=(now - timedelta(minutes=15 - room)).isoformat() + "Z",
            payload={
                "event_type": "ACTION_RESULT",
                "agent_id": "speedrunner",
                "room": room,
                "tool": "bypass" if room in [2, 4, 7, 9] else "burst_attack",
                "tool_result": {"success": True, "message": f"Speedrunner blitzed Room {room}"},
                "frustration": 10 + (room % 3),
                "frustration_delta": 0,
                "damage_taken": 3 if room % 4 == 0 else 0,
                "damage_dealt": 25,
                "timestamp": (now - timedelta(minutes=15 - room)).isoformat() + "Z"
            }
        )

        # Explorer event
        await repo.save_event(
            event_id=f"ev-exp-{room}",
            run_id=run_id_1,
            agent_id="explorer",
            event_type="ACTION_RESULT",
            room=room,
            timestamp=(now - timedelta(minutes=15 - room)).isoformat() + "Z",
            payload={
                "event_type": "ACTION_RESULT",
                "agent_id": "explorer",
                "room": room,
                "tool": "inspect_secrets",
                "tool_result": {"success": True, "message": f"Explorer mapped 100% of Room {room} artifacts"},
                "frustration": 15,
                "frustration_delta": -2,
                "damage_taken": 0,
                "damage_dealt": 15,
                "timestamp": (now - timedelta(minutes=15 - room)).isoformat() + "Z"
            }
        )

    # -------------------------------------------------------------
    # RUN 2: Post-Patch Validation (Seed 999) - Health Score 88/100
    # -------------------------------------------------------------
    run_id_2 = "run-demo-postpatch-02"
    created_at_2 = (now - timedelta(minutes=8)).isoformat() + "Z"
    completed_at_2 = (now - timedelta(minutes=3)).isoformat() + "Z"

    await repo.create_run(run_id_2, seed=999, ai_mode="HYBRID_DETERMINISTIC")
    await repo.update_run_status(
        run_id_2,
        status="completed",
        health_score=88,
        summary="Validation run after Balance Patch v1.1.0: Casual frustration in Room 6 dropped from 85% to 38%. Speedrunner forced into combat in Room 4."
    )

    await repo.save_agent_metrics(run_id_2, "casual", {
        "rooms_completed": 10,
        "completion_time_ms": 12800,
        "actions_taken": 34,
        "failed_actions": 2,
        "damage_taken": 65,
        "damage_dealt": 190,
        "heals_used": 4,
        "bypasses_used": 0,
        "items_collected": 8,
        "avg_frustration": 24.0,
        "peak_frustration": 38,
        "efficiency_score": 75.0,
        "exploration_score": 72.0
    })

    await repo.save_agent_metrics(run_id_2, "speedrunner", {
        "rooms_completed": 10,
        "completion_time_ms": 7200,
        "actions_taken": 22,
        "failed_actions": 0,
        "damage_taken": 40,
        "damage_dealt": 230,
        "heals_used": 1,
        "bypasses_used": 2,
        "items_collected": 3,
        "avg_frustration": 15.0,
        "peak_frustration": 20,
        "efficiency_score": 88.0,
        "exploration_score": 25.0
    })

    await repo.save_agent_metrics(run_id_2, "explorer", {
        "rooms_completed": 10,
        "completion_time_ms": 17900,
        "actions_taken": 50,
        "failed_actions": 1,
        "damage_taken": 45,
        "damage_dealt": 200,
        "heals_used": 2,
        "bypasses_used": 0,
        "items_collected": 16,
        "avg_frustration": 18.0,
        "peak_frustration": 30,
        "efficiency_score": 64.0,
        "exploration_score": 100.0
    })

    await repo.save_director_report(run_id_2, {
        "run_id": run_id_2,
        "health_score": 88,
        "executive_summary": "Post-balance validation successful. Game Health improved from 68/100 to 88/100. Casual survivability enhanced by 45% with stabilized frustration curves across all 10 dungeon sectors.",
        "common_issues": ["Minor explorer delay in Room 8 puzzle."],
        "persona_specific_issues": {"casual": ["Smooth progression, zero deaths."], "speedrunner": ["Targeted pacing achieved."], "explorer": ["100% item completion."]},
        "systemic_issues": ["Level flow is now balanced and engaging across all three play styles."],
        "recommendations": ["Release candidate approved for general playtesting."],
        "created_at": completed_at_2
    })

    logger.info("Successfully seeded mock benchmark datasets into SQLite.")
