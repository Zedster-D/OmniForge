import sqlite3
import aiosqlite
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from backend.app.core.config import settings
from backend.app.core.logging import logger

class DatabaseRepository:
    def __init__(self, db_path: str = settings.DATABASE_PATH):
        self.db_path = db_path
        self._init_schema_sync()

    def _init_schema_sync(self):
        """Synchronously ensures tables exist on startup."""
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS runs (
                id TEXT PRIMARY KEY,
                seed INTEGER NOT NULL,
                ai_mode TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                completed_at TEXT,
                health_score INTEGER DEFAULT 100,
                summary TEXT
            );
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS agent_events (
                id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL,
                agent_id TEXT,
                event_type TEXT NOT NULL,
                room INTEGER DEFAULT 1,
                timestamp TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                FOREIGN KEY (run_id) REFERENCES runs (id)
            );
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS agent_metrics (
                run_id TEXT NOT NULL,
                agent_id TEXT NOT NULL,
                rooms_completed INTEGER DEFAULT 0,
                completion_time_ms INTEGER DEFAULT 0,
                actions_taken INTEGER DEFAULT 0,
                failed_actions INTEGER DEFAULT 0,
                damage_taken INTEGER DEFAULT 0,
                damage_dealt INTEGER DEFAULT 0,
                heals_used INTEGER DEFAULT 0,
                bypasses_used INTEGER DEFAULT 0,
                items_collected INTEGER DEFAULT 0,
                avg_frustration REAL DEFAULT 0.0,
                peak_frustration INTEGER DEFAULT 0,
                efficiency_score REAL DEFAULT 0.0,
                exploration_score REAL DEFAULT 0.0,
                metrics_json TEXT,
                PRIMARY KEY (run_id, agent_id),
                FOREIGN KEY (run_id) REFERENCES runs (id)
            );
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS anomalies (
                id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL,
                agent_id TEXT NOT NULL,
                room INTEGER NOT NULL,
                anomaly_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                description TEXT NOT NULL,
                evidence_json TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (run_id) REFERENCES runs (id)
            );
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS director_reports (
                run_id TEXT PRIMARY KEY,
                health_score INTEGER DEFAULT 100,
                executive_summary TEXT NOT NULL,
                common_issues_json TEXT NOT NULL,
                persona_issues_json TEXT NOT NULL,
                systemic_issues_json TEXT NOT NULL,
                recommendations_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (run_id) REFERENCES runs (id)
            );
            """)

            cursor.execute("""
            CREATE TABLE IF NOT EXISTS balance_patches (
                run_id TEXT PRIMARY KEY,
                version TEXT NOT NULL,
                summary TEXT NOT NULL,
                patch_json TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (run_id) REFERENCES runs (id)
            );
            """)
            conn.commit()
        finally:
            conn.close()

    async def initialize(self):
        """Asynchronous verification."""
        self._init_schema_sync()

    async def create_run(self, run_id: str, seed: int, ai_mode: str) -> Dict[str, Any]:
        created_at = datetime.utcnow().isoformat() + "Z"
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT INTO runs (id, seed, ai_mode, status, created_at) VALUES (?, ?, ?, ?, ?)",
                (run_id, seed, ai_mode, "created", created_at)
            )
            await db.commit()
        return {
            "id": run_id,
            "seed": seed,
            "ai_mode": ai_mode,
            "status": "created",
            "created_at": created_at,
            "health_score": 100
        }

    async def update_run_status(self, run_id: str, status: str, health_score: Optional[int] = None, summary: Optional[str] = None):
        completed_at = datetime.utcnow().isoformat() + "Z" if status in ["completed", "stopped"] else None
        async with aiosqlite.connect(self.db_path) as db:
            if health_score is not None and summary is not None:
                await db.execute(
                    "UPDATE runs SET status = ?, completed_at = ?, health_score = ?, summary = ? WHERE id = ?",
                    (status, completed_at, health_score, summary, run_id)
                )
            elif health_score is not None:
                await db.execute(
                    "UPDATE runs SET status = ?, completed_at = ?, health_score = ? WHERE id = ?",
                    (status, completed_at, health_score, run_id)
                )
            else:
                await db.execute(
                    "UPDATE runs SET status = ?, completed_at = ? WHERE id = ?",
                    (status, completed_at, run_id)
                )
            await db.commit()

    async def get_run(self, run_id: str) -> Optional[Dict[str, Any]]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM runs WHERE id = ?", (run_id,)) as cursor:
                row = await cursor.fetchone()
                if row:
                    return dict(row)
        return None

    async def list_runs(self, limit: int = 50) -> List[Dict[str, Any]]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM runs ORDER BY created_at DESC LIMIT ?", (limit,)) as cursor:
                rows = await cursor.fetchall()
                return [dict(r) for r in rows]

    async def save_event(self, event_id: str, run_id: str, agent_id: Optional[str], event_type: str, room: int, timestamp: str, payload: Dict[str, Any]):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """INSERT OR REPLACE INTO agent_events (id, run_id, agent_id, event_type, room, timestamp, payload_json)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (event_id, run_id, agent_id, event_type, room, timestamp, json.dumps(payload))
            )
            await db.commit()

    async def get_events_for_run(self, run_id: str) -> List[Dict[str, Any]]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(
                "SELECT * FROM agent_events WHERE run_id = ? ORDER BY timestamp ASC",
                (run_id,)
            ) as cursor:
                rows = await cursor.fetchall()
                events = []
                for r in rows:
                    payload = json.loads(r["payload_json"])
                    events.append(payload)
                return events

    async def save_agent_metrics(self, run_id: str, agent_id: str, metrics: Dict[str, Any]):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """INSERT OR REPLACE INTO agent_metrics (
                    run_id, agent_id, rooms_completed, completion_time_ms, actions_taken,
                    failed_actions, damage_taken, damage_dealt, heals_used, bypasses_used,
                    items_collected, avg_frustration, peak_frustration, efficiency_score,
                    exploration_score, metrics_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    run_id,
                    agent_id,
                    metrics.get("rooms_completed", 0),
                    metrics.get("completion_time_ms", 0),
                    metrics.get("actions_taken", 0),
                    metrics.get("failed_actions", 0),
                    metrics.get("damage_taken", 0),
                    metrics.get("damage_dealt", 0),
                    metrics.get("heals_used", 0),
                    metrics.get("bypasses_used", 0),
                    metrics.get("items_collected", 0),
                    metrics.get("avg_frustration", 0.0),
                    metrics.get("peak_frustration", 0),
                    metrics.get("efficiency_score", 0.0),
                    metrics.get("exploration_score", 0.0),
                    json.dumps(metrics)
                )
            )
            await db.commit()

    async def get_metrics_for_run(self, run_id: str) -> Dict[str, Any]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM agent_metrics WHERE run_id = ?", (run_id,)) as cursor:
                rows = await cursor.fetchall()
                results = {}
                for r in rows:
                    m = dict(r)
                    if m.get("metrics_json"):
                        m["details"] = json.loads(m["metrics_json"])
                    results[r["agent_id"]] = m
                return results

    async def save_anomaly(self, anomaly: Dict[str, Any]):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """INSERT OR REPLACE INTO anomalies (id, run_id, agent_id, room, anomaly_type, severity, description, evidence_json, timestamp)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    anomaly["id"],
                    anomaly["run_id"],
                    anomaly["agent_id"],
                    anomaly["room"],
                    anomaly["type"],
                    anomaly["severity"],
                    anomaly["description"],
                    json.dumps(anomaly.get("evidence", {})),
                    anomaly.get("timestamp", datetime.utcnow().isoformat() + "Z")
                )
            )
            await db.commit()

    async def get_anomalies_for_run(self, run_id: str) -> List[Dict[str, Any]]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM anomalies WHERE run_id = ? ORDER BY timestamp ASC", (run_id,)) as cursor:
                rows = await cursor.fetchall()
                return [
                    {
                        "id": r["id"],
                        "run_id": r["run_id"],
                        "agent_id": r["agent_id"],
                        "room": r["room"],
                        "type": r["anomaly_type"],
                        "severity": r["severity"],
                        "description": r["description"],
                        "evidence": json.loads(r["evidence_json"]),
                        "timestamp": r["timestamp"]
                    }
                    for r in rows
                ]

    async def save_director_report(self, run_id: str, report: Dict[str, Any]):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """INSERT OR REPLACE INTO director_reports (
                    run_id, health_score, executive_summary, common_issues_json,
                    persona_issues_json, systemic_issues_json, recommendations_json, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    run_id,
                    report.get("health_score", 100),
                    report.get("executive_summary", ""),
                    json.dumps(report.get("common_issues", [])),
                    json.dumps(report.get("persona_specific_issues", {})),
                    json.dumps(report.get("systemic_issues", [])),
                    json.dumps(report.get("recommendations", [])),
                    report.get("created_at", datetime.utcnow().isoformat() + "Z")
                )
            )
            await db.commit()

    async def get_director_report(self, run_id: str) -> Optional[Dict[str, Any]]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM director_reports WHERE run_id = ?", (run_id,)) as cursor:
                row = await cursor.fetchone()
                if row:
                    return {
                        "run_id": row["run_id"],
                        "health_score": row["health_score"],
                        "executive_summary": row["executive_summary"],
                        "common_issues": json.loads(row["common_issues_json"]),
                        "persona_specific_issues": json.loads(row["persona_issues_json"]),
                        "systemic_issues": json.loads(row["systemic_issues_json"]),
                        "recommendations": json.loads(row["recommendations_json"]),
                        "created_at": row["created_at"]
                    }
        return None

    async def save_balance_patch(self, run_id: str, patch: Dict[str, Any]):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                """INSERT OR REPLACE INTO balance_patches (run_id, version, summary, patch_json, created_at)
                   VALUES (?, ?, ?, ?, ?)""",
                (
                    run_id,
                    patch.get("version", "1.0"),
                    patch.get("summary", ""),
                    json.dumps(patch),
                    patch.get("created_at", datetime.utcnow().isoformat() + "Z")
                )
            )
            await db.commit()

    async def get_balance_patch(self, run_id: str) -> Optional[Dict[str, Any]]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT * FROM balance_patches WHERE run_id = ?", (run_id,)) as cursor:
                row = await cursor.fetchone()
                if row:
                    return json.loads(row["patch_json"])
        return None

repo = DatabaseRepository()
