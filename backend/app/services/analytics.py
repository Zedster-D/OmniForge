from typing import Dict, Any, List
from backend.app.telemetry.events import TelemetryEvent

class AnalyticsEngine:
    """
    Computes holistic swarm analytics, cross-persona friction scores,
    room heatmaps, and internal heuristic Game Health Score.
    """
    def compute_run_analytics(
        self,
        agent_metrics: Dict[str, Any],
        events: List[Dict[str, Any]],
        anomalies: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        casual = agent_metrics.get("casual", {})
        speedrunner = agent_metrics.get("speedrunner", {})
        explorer = agent_metrics.get("explorer", {})
        
        # 1. Frustration aggregates
        frustrations = [
            casual.get("avg_frustration", 0.0),
            speedrunner.get("avg_frustration", 0.0),
            explorer.get("avg_frustration", 0.0)
        ]
        avg_frustration = round(sum(frustrations) / max(1, len(frustrations)), 1)
        peak_frustration = max([
            casual.get("peak_frustration", 0),
            speedrunner.get("peak_frustration", 0),
            explorer.get("peak_frustration", 0)
        ], default=0)
        
        # 2. Action & Combat aggregates
        total_actions = sum(m.get("actions_taken", 0) for m in agent_metrics.values())
        total_failures = sum(m.get("failed_actions", 0) for m in agent_metrics.values())
        total_damage_taken = sum(m.get("damage_taken", 0) for m in agent_metrics.values())
        total_damage_dealt = sum(m.get("damage_dealt", 0) for m in agent_metrics.values())
        total_items_collected = sum(m.get("items_collected", 0) for m in agent_metrics.values())
        total_bypasses_used = sum(m.get("bypasses_used", 0) for m in agent_metrics.values())
        
        rooms_cleared = [m.get("rooms_completed", 0) for m in agent_metrics.values()]
        avg_rooms_cleared = sum(rooms_cleared) / max(1, len(rooms_cleared))

        # 3. Room-by-room heatmap computation (Rooms 1 to 10)
        room_heatmaps = self._compute_room_heatmaps(events, anomalies)
        
        # Identify most problematic room
        most_problematic_room = 1
        max_friction = -1.0
        for r_num, data in room_heatmaps.items():
            if data["friction_score"] > max_friction:
                max_friction = data["friction_score"]
                most_problematic_room = r_num

        # Identify most explored room
        most_explored_room = 1
        max_exp = -1
        for r_num, data in room_heatmaps.items():
            if data["explorer_actions"] > max_exp:
                max_exp = data["explorer_actions"]
                most_explored_room = r_num

        # 4. Calculate Game Health Score (0-100 Internal Heuristic)
        # Deductions: high frustration (-0.35 per pt), failures (-2.5 per fail), anomalies (-3.5 per anomaly), unfinished rooms (-4 per room)
        anomalies_count = len(anomalies)
        deduction = (avg_frustration * 0.35) + (total_failures * 2.5) + (anomalies_count * 3.5) + ((10 - avg_rooms_cleared) * 4.0)
        raw_health = 100.0 - deduction
        game_health_score = max(5, min(100, int(round(raw_health))))

        # 5. Radar chart stats for personas
        persona_radar = [
            {"subject": "Speed", "Casual": 30, "Speedrunner": 98, "Explorer": 40},
            {"subject": "Survival", "Casual": 88, "Speedrunner": 65, "Explorer": 75},
            {"subject": "Exploration", "Casual": 45, "Speedrunner": 15, "Explorer": 96},
            {"subject": "Combat Aggr.", "Casual": 35, "Speedrunner": 92, "Explorer": 60},
            {"subject": "Efficiency", "Casual": 50, "Speedrunner": 95, "Explorer": 65},
            {"subject": "Patience", "Casual": 30, "Speedrunner": 85, "Explorer": 95},
        ]

        return {
            "avg_frustration": avg_frustration,
            "peak_frustration": peak_frustration,
            "total_actions": total_actions,
            "total_failures": total_failures,
            "total_damage_taken": total_damage_taken,
            "total_damage_dealt": total_damage_dealt,
            "total_items_collected": total_items_collected,
            "total_bypasses_used": total_bypasses_used,
            "avg_rooms_cleared": round(avg_rooms_cleared, 1),
            "game_health_score": game_health_score,
            "most_problematic_room": most_problematic_room,
            "most_explored_room": most_explored_room,
            "total_anomalies": anomalies_count,
            "room_heatmaps": room_heatmaps,
            "persona_radar": persona_radar,
            "agent_summaries": agent_metrics
        }

    def _compute_room_heatmaps(self, events: List[Dict[str, Any]], anomalies: List[Dict[str, Any]]) -> Dict[int, Dict[str, Any]]:
        heatmaps: Dict[int, Dict[str, Any]] = {}
        for r in range(1, 11):
            heatmaps[r] = {
                "room": r,
                "casual_frustration": 0,
                "speedrunner_friction": 0,
                "explorer_friction": 0,
                "explorer_actions": 0,
                "damage_taken": 0,
                "failures": 0,
                "anomalies_count": 0,
                "friction_score": 0.0
            }

        # Ingest events
        for ev in events:
            r = ev.get("room", 1)
            if r not in heatmaps:
                continue
            agent = ev.get("agent_id")
            frust = ev.get("frustration", 0)
            dmg = ev.get("damage_taken", 0)
            
            if agent == "casual":
                heatmaps[r]["casual_frustration"] = max(heatmaps[r]["casual_frustration"], frust or 0)
            elif agent == "speedrunner":
                if ev.get("event_type") == "ACTION_RESULT" and not ev.get("tool_result", {}).get("success", True):
                    heatmaps[r]["speedrunner_friction"] += 15
                if frust:
                    heatmaps[r]["speedrunner_friction"] = max(heatmaps[r]["speedrunner_friction"], frust)
            elif agent == "explorer":
                heatmaps[r]["explorer_actions"] += 1
                if frust:
                    heatmaps[r]["explorer_friction"] = max(heatmaps[r]["explorer_friction"], frust)

            if dmg:
                heatmaps[r]["damage_taken"] += dmg
                
            if ev.get("event_type") == "ACTION_RESULT" and not ev.get("tool_result", {}).get("success", True):
                heatmaps[r]["failures"] += 1

        # Anomalies count per room
        for anom in anomalies:
            r = anom.get("room", 1)
            if r in heatmaps:
                heatmaps[r]["anomalies_count"] += 1

        # Calculate composite friction score per room
        for r, data in heatmaps.items():
            # Composite formula: weighted average of persona frictions + damages + failures
            raw_friction = (
                (data["casual_frustration"] * 0.4) +
                (data["speedrunner_friction"] * 0.3) +
                (data["explorer_friction"] * 0.2) +
                (data["failures"] * 5) +
                (data["anomalies_count"] * 8) +
                (data["damage_taken"] * 0.15)
            )
            data["friction_score"] = round(min(100.0, raw_friction), 1)

        return heatmaps

analytics_engine = AnalyticsEngine()
