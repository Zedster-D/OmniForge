import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List
from backend.app.memory.repository import DatabaseRepository
from backend.app.core.logging import logger

async def seed_mock_datasets(repo: DatabaseRepository, force: bool = False):
    """
    Seeds comprehensive mock AAA game benchmark simulation runs into the SQLite database.
    Ensures judges and visitors immediately have rich telemetry from Assassin's Creed and GTA Heist swarms.
    """
    logger.info("Seeding Assassin's Creed & GTA Heist benchmark demo datasets into database...")
    now = datetime.utcnow()

    # -------------------------------------------------------------------------
    # 1. ASSASSIN'S CREED: SHADOWS OF THE CITADEL (Seed 108)
    # -------------------------------------------------------------------------
    ac_id = "run-demo-assassins-creed"
    await repo.create_run(ac_id, seed=108, ai_mode="HYBRID_DETERMINISTIC")
    await repo.update_run_status(
        ac_id,
        status="completed",
        health_score=64,
        summary="Assassin's Creed Swarm QA: Critical stealth failure in Sector 6 (Cathedral Rooftops) due to 360° sniper detection cone. Casual player detected 8 times in 2 minutes."
    )

    await repo.save_agent_metrics(ac_id, "casual", {
        "rooms_completed": 10,
        "completion_time_ms": 22400,
        "actions_taken": 64,
        "failed_actions": 11,
        "damage_taken": 140,
        "damage_dealt": 210,
        "heals_used": 7,
        "bypasses_used": 0,
        "items_collected": 5,
        "avg_frustration": 58.5,
        "peak_frustration": 92,
        "efficiency_score": 48.0,
        "exploration_score": 65.0,
        "is_victory": True
    })

    await repo.save_agent_metrics(ac_id, "speedrunner", {
        "rooms_completed": 10,
        "completion_time_ms": 6100,
        "actions_taken": 18,
        "failed_actions": 1,
        "damage_taken": 25,
        "damage_dealt": 320,
        "heals_used": 0,
        "bypasses_used": 5,
        "items_collected": 0,
        "avg_frustration": 14.0,
        "peak_frustration": 20,
        "efficiency_score": 96.0,
        "exploration_score": 10.0,
        "is_victory": True
    })

    await repo.save_agent_metrics(ac_id, "explorer", {
        "rooms_completed": 10,
        "completion_time_ms": 31000,
        "actions_taken": 88,
        "failed_actions": 3,
        "damage_taken": 50,
        "damage_dealt": 260,
        "heals_used": 2,
        "bypasses_used": 0,
        "items_collected": 24,
        "avg_frustration": 20.0,
        "peak_frustration": 35,
        "efficiency_score": 62.0,
        "exploration_score": 100.0,
        "is_victory": True
    })

    await repo.save_anomaly({
        "id": f"ac-anom-1",
        "run_id": ac_id,
        "agent_id": "casual",
        "room": 6,
        "type": "UNFAIR_STEALTH_DETECTION",
        "severity": "critical",
        "description": "Rooftop crossbow snipers in Sector 6 detect casual player through smoke bomb fog at 45m range.",
        "evidence": {"sector": "Sector 6 - Cathedral Rooftops", "detections": 8, "smoke_bombs_wasted": 4},
        "timestamp": (now - timedelta(minutes=10)).isoformat() + "Z"
    })

    await repo.save_anomaly({
        "id": f"ac-anom-2",
        "run_id": ac_id,
        "agent_id": "speedrunner",
        "room": 3,
        "type": "LEDGE_WARP_EXPLOIT",
        "severity": "high",
        "description": "Speedrunner animation-canceled hay-bale leap of faith to clip directly into the High Commander chamber.",
        "evidence": {"sector": "Sector 3 - Fortress Gate", "time_saved_sec": 45, "skip_guard_count": 12},
        "timestamp": (now - timedelta(minutes=11)).isoformat() + "Z"
    })

    await repo.save_director_report(ac_id, {
        "run_id": ac_id,
        "health_score": 64,
        "executive_summary": "OmniForge QA Swarm audited 'Assassin's Creed: Shadows of the Citadel'. Pacing across early parkour sectors (1-4) is smooth, but Sector 6 introduces severe stealth friction: rooftop guard sightlines overlap without blindspots, causing casual players to abandon stealth for frantic combat.",
        "common_issues": [
            "Sector 6 Crossbow Snipers have instantaneous 0.2s alert meters, making stealth approaches mathematically impossible for casual reaction speeds.",
            "Hay bale leap-of-faith collision in Sector 3 allows speedrunners to bypass 12 fortress guards."
        ],
        "persona_specific_issues": {
            "casual": [
                "Detected 8 times in Sector 6; forced into 1v5 melee combat while equipped with low-defense assassin robes.",
                "Eagle Vision recharge cooldown is too long (30s) during high-density patrol zones."
            ],
            "speedrunner": [
                "Bypasses 90% of assassination targets by chain-sprinting on rooftop clotheslines without stamina penalty."
            ],
            "explorer": [
                "Synchronized all 5 viewpoints and collected 24 Animus fragments, but Sector 8 puzzle chest had an obscured climb ledge."
            ]
        },
        "systemic_issues": [
            "Stealth detection cones do not account for night-time lighting or shadow concealment.",
            "Parry window in counter-combat is 120ms (pro gamer threshold), punishing casual players."
        ],
        "recommendations": [
            {
                "room": 6,
                "severity": "critical",
                "actionable_fix": "Reduce Sector 6 rooftop sniper sightline range from 45m to 25m and increase detection meter fill time from 0.2s to 1.5s.",
                "confidence": 0.98,
                "evidence": {"sector": 6, "casual_frustration": 92, "detections": 8}
            },
            {
                "room": 3,
                "severity": "high",
                "actionable_fix": "Add invisible boundary wall to Sector 3 hay bale landing to patch wall-clip skip.",
                "confidence": 0.94,
                "evidence": {"sector": 3, "bypass_used": True}
            }
        ],
        "created_at": (now - timedelta(minutes=9)).isoformat() + "Z"
    })

    await repo.save_balance_patch(ac_id, {
        "version": "1.2.0-assassins-patch",
        "simulation_id": ac_id,
        "summary": "Stealth sightline nerfing, leap-of-faith collision fix, and Eagle Vision cooldown reduction for Assassin's Creed level.",
        "health_score": 64,
        "generated_at": (now - timedelta(minutes=9)).isoformat() + "Z",
        "changes": [
            {
                "id": "ac-patch-1",
                "room": 6,
                "category": "tuning",
                "severity": "critical",
                "affected_agents": ["casual", "explorer"],
                "issue": "Rooftop crossbow sniper eagle-eye detection cone is overtuned.",
                "evidence": {"sector": 6, "casual_peak_frust": 92},
                "recommendation": "Reduce vision cone from 45m to 25m and add 1.5s grace period before alarm sounding.",
                "confidence": 0.98
            },
            {
                "id": "ac-patch-2",
                "room": 3,
                "category": "layout",
                "severity": "high",
                "affected_agents": ["speedrunner"],
                "issue": "Hay bale physics allows animation cancel wall-clip.",
                "evidence": {"sector": 3, "skip_time_ms": 45000},
                "recommendation": "Clamp player velocity on hay bale exit to prevent gate bypass.",
                "confidence": 0.94
            }
        ]
    })

    # -------------------------------------------------------------------------
    # 2. GRAND THEFT AUTO: VICE CITY HEIST SWARM (Seed 777)
    # -------------------------------------------------------------------------
    gta_id = "run-demo-gta-vice-heist"
    await repo.create_run(gta_id, seed=777, ai_mode="HYBRID_DETERMINISTIC")
    await repo.update_run_status(
        gta_id,
        status="completed",
        health_score=72,
        summary="GTA VI Heist Swarm QA: Sector 6 (Freeway 4-Star Pursuit) has excessive SWAT roadblocks resulting in 3 casual getaway car flips and critical heat."
    )

    await repo.save_agent_metrics(gta_id, "casual", {
        "rooms_completed": 10,
        "completion_time_ms": 19800,
        "actions_taken": 55,
        "failed_actions": 9,
        "damage_taken": 185,
        "damage_dealt": 340,
        "heals_used": 6,
        "bypasses_used": 0,
        "items_collected": 6,
        "avg_frustration": 52.0,
        "peak_frustration": 89,
        "efficiency_score": 55.0,
        "exploration_score": 60.0,
        "is_victory": True
    })

    await repo.save_agent_metrics(gta_id, "speedrunner", {
        "rooms_completed": 10,
        "completion_time_ms": 5400,
        "actions_taken": 14,
        "failed_actions": 0,
        "damage_taken": 30,
        "damage_dealt": 420,
        "heals_used": 0,
        "bypasses_used": 6,
        "items_collected": 1,
        "avg_frustration": 10.0,
        "peak_frustration": 18,
        "efficiency_score": 98.0,
        "exploration_score": 15.0,
        "is_victory": True
    })

    await repo.save_agent_metrics(gta_id, "explorer", {
        "rooms_completed": 10,
        "completion_time_ms": 28000,
        "actions_taken": 76,
        "failed_actions": 2,
        "damage_taken": 65,
        "damage_dealt": 390,
        "heals_used": 3,
        "bypasses_used": 0,
        "items_collected": 32,
        "avg_frustration": 18.0,
        "peak_frustration": 32,
        "efficiency_score": 68.0,
        "exploration_score": 100.0,
        "is_victory": True
    })

    await repo.save_anomaly({
        "id": f"gta-anom-1",
        "run_id": gta_id,
        "agent_id": "casual",
        "room": 6,
        "type": "VEHICLE_PIT_LOCK",
        "severity": "high",
        "description": "SWAT armored Bearcats box in casual getaway car on Ocean Drive Freeway with 0m turning radius.",
        "evidence": {"sector": "Sector 6 - Ocean Drive Freeway", "vehicle_flips": 3, "armor_loss": 100},
        "timestamp": (now - timedelta(minutes=4)).isoformat() + "Z"
    })

    await repo.save_director_report(gta_id, {
        "run_id": gta_id,
        "health_score": 72,
        "executive_summary": "OmniForge QA Swarm simulated 'GTA: Vice City Heist Mission'. The Bank Infiltration and Safe Cracking phases demonstrate high player satisfaction. However, the Phase 6 Freeway Pursuit has an overly aggressive SWAT AI PIT maneuver that frequently spins out casual drivers.",
        "common_issues": [
            "Freeway SWAT barricade spawns 4 armored vans simultaneously, blocking all 3 lanes without a ramp opening.",
            "Subway train tunnel in Sector 4 lacks barrier gates, enabling speedrunners to bypass the entire police chase."
        ],
        "persona_specific_issues": {
            "casual": ["Spike strips on Freeway bridge are invisible at high speeds (>90mph) during night lighting."],
            "speedrunner": ["Uses nitro boost on motorcycle into subway tunnel to clear heist in 5.4 seconds."],
            "explorer": ["Discovered all 32 hidden contraband packages and 4 secret supercars in alleyway garages."]
        },
        "systemic_issues": ["Police helicopter spotlight blinding effect impairs driving controls by 40%."],
        "recommendations": [
            {
                "room": 6,
                "severity": "high",
                "actionable_fix": "Add a billboard stunt ramp on the Sector 6 freeway barricade to provide an escape vector.",
                "confidence": 0.96,
                "evidence": {"sector": 6, "vehicle_wrecks": 3}
            }
        ],
        "created_at": (now - timedelta(minutes=3)).isoformat() + "Z"
    })

    await repo.save_balance_patch(gta_id, {
        "version": "1.3.0-gta-heist-patch",
        "simulation_id": gta_id,
        "summary": "Highway pursuit balancing, helicopter accuracy nerf, and subway exploit patching for GTA Vice Heist.",
        "health_score": 72,
        "generated_at": (now - timedelta(minutes=3)).isoformat() + "Z",
        "changes": [
            {
                "id": "gta-patch-1",
                "room": 6,
                "category": "tuning",
                "severity": "high",
                "affected_agents": ["casual"],
                "issue": "SWAT Freeway roadblock completely walls all 3 traffic lanes.",
                "evidence": {"sector": 6, "crashes": 3},
                "recommendation": "Spawn a tilted construction flatbed ramp on the center lane for cinematic jump escape.",
                "confidence": 0.96
            }
        ]
    })

    logger.info("Successfully seeded Assassin's Creed & GTA Heist datasets into SQLite.")
