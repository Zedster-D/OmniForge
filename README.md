# OmniForge // Autonomous Multi-Agent Playtesting Swarm

> **“Three autonomous AI players experience the same game differently. OmniForge watches them live, measures their behavior and frustration, detects gameplay problems, and automatically converts the evidence into actionable balance patches for game developers.”**

---

## 1. Overview

**OmniForge** is an AI-powered Game QA & Systems Balancing Platform. It simulates a 10-room dungeon crawler and orchestrates three distinct autonomous AI player personas (**Casual**, **Speedrunner**, and **Explorer**) playing through the identical scenario in parallel.

As the swarm navigates combat, traps, hidden routes, and puzzles, OmniForge tracks their gameplay decisions, health trajectories, action failures, and emotional frustration in real time. Once all playtests conclude, a fourth agent—the **Director**—synthesizes the cross-agent telemetry and generates a machine-readable `balance_patch.json` with verifiable tuning recommendations.

---

## 2. Problem

Modern game balance and playtesting suffer from critical bottlenecks:
* **Human QA is slow and expensive**: Manual playthroughs across dozens of archetypes require hundreds of hours.
* **Telemetry lacks psychological context**: Standard analytics show where players quit, but not *why* they became frustrated or what tactical loops broke down.
* **Balancing for one archetype breaks another**: Nerfing a boss for casual players might render it trivial for speedrunners; fixing an exploit might ruin exploration rewards.
* **Actionable tuning is disconnected from test logs**: Developers must manually translate playtest recordings into numerical combat tweaks.

---

## 3. Solution

OmniForge solves this with a closed-loop multi-agent playtesting pipeline:
1. **Multi-Archetype Autonomous Swarm**: Deploys simulated personas with distinct patience, risk tolerance, and routing priorities against the same seed.
2. **Live Cognitive & Physiological Telemetry**: Measures live frustration scores (0–100), combat efficiency, item completionism, and action failure streaks.
3. **Real-Time Anomaly Surveillance**: Flags damage spikes, repetitive loops, and critical health spirals.
4. **Director Synthesis**: Aggregates cross-persona differentials into a **Game Health Score (0–100)** and outputs a machine-readable `balance_patch.json`.

---

## 4. Pipeline Architecture

```
                       +------------------------------------------------+
                       |              SIMULATION SCENARIO               |
                       |             (Deterministic Seed)               |
                       +------------------------------------------------+
                                       |
                   +-------------------+-------------------+
                   |                   |                   |
                   v                   v                   v
           +---------------+   +---------------+   +---------------+
           |    CASUAL     |   |  SPEEDRUNNER  |   |   EXPLORER    |
           |  (casual.py)  |   | (speedrunner) |   | (explorer.py) |
           +---------------+   +---------------+   +---------------+
                   |                   |                   |
                   +-------------------+-------------------+
                                       |
                                       v
                       +--------------------------------+
                       |    10-ROOM DUNGEON ENGINE      |
                       |       (game_engine.py)         |
                       +--------------------------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
                   v                                       v
      +-------------------------+              +-------------------------+
      |    EVENT BROADCASTER    |              |     SQLITE DATABASE     |
      |   (WebSocket Stream)    |              |  (Telemetry & Metrics)  |
      +-------------------------+              +-------------------------+
                   |                                       |
                   +-------------------+-------------------+
                                       |
                                       v
                       +--------------------------------+
                       |      ANALYTICS & ANOMALY       |
                       |       DETECTION ENGINES        |
                       +--------------------------------+
                                       |
                                       v
                       +--------------------------------+
                       |         DIRECTOR AGENT         |
                       |   (Cross-Persona Synthesis)    |
                       +--------------------------------+
                                       |
                                       v
                       +--------------------------------+
                       |       balance_patch.json       |
                       +--------------------------------+
```

---

## 5. Agent Personas

| Agent | Executable | Patience | Risk Tolerance | Speed Priority | Exploration | Signature Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Casual** | `CASUAL.EXE` | Low | Low | Low | Medium | Heals at low HP, reactive frustration spikes (+15 critical HP, +10 failed actions), flees combat if bypass is open. |
| **Speedrunner** | `SPEEDRUN.EXE` | High | High | Extreme | Low | Takes every bypass instantly, skips non-mandatory fights, spams burst heavy attacks. |
| **Explorer** | `EXPLORER.EXE` | High | Medium | Low | Extreme | Inspects all rooms, disarms hazards, explores secret side branches, collects 100% of loot. |
| **Director** | `DIRECTOR.EXE` | — | — | — | — | Cross-synthesizes all 3 agent logs post-simulation, calculates Game Health Score, produces `balance_patch.json`. |

---

## 6. Real-Time Frustration Model (Casual Persona)

Frustration is calculated deterministically on a scale of `0 <= frustration <= 100`:
* `+15` Critical HP threshold (`HP <= 25%`)
* `+10` Failed or rejected action
* `+8` Consecutive repeated failure
* `+5` Environmental or combat damage received
* `+4` Blocked navigation or progression stall
* `-10` Successful potion heal
* `-8` Successful room completion
* `-5` High-damage strike or enemy defeated

---

## 7. Tech Stack

### Backend
* **Python 3.11+**
* **FastAPI**: Asynchronous high-performance REST API.
* **Pydantic v2**: Strict schema validation for actions, states, events, and balance patches.
* **WebSockets**: Real-time event streaming (`/ws/runs/{run_id}`) with catch-up buffering.
* **SQLite / aiosqlite**: Asynchronous persistence for runs, events, metrics, reports, and patches.
* **OpenAI API**: `AgentDecisionProvider` with deterministic local fallback (`LocalDeterministicProvider`).
* **Pytest & Pytest-Asyncio**: Comprehensive test suite.

### Frontend
* **Next.js (App Router)** & **React**
* **TypeScript**
* **Tailwind CSS**: Dark cyberpunk mission control theme with custom glow tokens.
* **Recharts**: Real-time multi-agent line charts, radar archetypes, and metric bars.
* **Lucide React**: Vector icons and telemetry badges.

---

## 8. Project Structure

```
Ai-gaming/
├── README.md
├── AGENTS.md
├── .gitignore
├── .env.example
├── docker-compose.yml
│
├── backend/
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── Dockerfile
│   │
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── exceptions.py
│   │   │   └── logging.py
│   │   ├── engine/
│   │   │   ├── models.py
│   │   │   ├── game_engine.py
│   │   │   └── scenarios.py
│   │   ├── agents/
│   │   │   ├── base.py
│   │   │   ├── casual.py
│   │   │   ├── speedrunner.py
│   │   │   ├── explorer.py
│   │   │   ├── director.py
│   │   │   └── orchestrator.py
│   │   ├── telemetry/
│   │   │   ├── events.py
│   │   │   └── broadcaster.py
│   │   ├── memory/
│   │   │   └── repository.py
│   │   ├── services/
│   │   │   ├── simulation_service.py
│   │   │   ├── analytics.py
│   │   │   ├── anomaly_detection.py
│   │   │   └── patch_generator.py
│   │   └── api/
│   │       ├── runs.py
│   │       ├── agents.py
│   │       └── websocket.py
│   │
│   └── tests/
│       ├── conftest.py
│       ├── test_engine.py
│       ├── test_agents.py
│       ├── test_analytics.py
│       ├── test_director.py
│       ├── test_api.py
│       └── test_e2e_full.py
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── MissionControl.tsx
│   │   ├── SimulationControls.tsx
│   │   ├── MetricCard.tsx
│   │   ├── AgentGrid.tsx
│   │   ├── AgentStream.tsx
│   │   ├── FrustrationChart.tsx
│   │   ├── RoomHeatmap.tsx
│   │   ├── PerformanceChart.tsx
│   │   ├── TelemetryPanel.tsx
│   │   ├── EventFeed.tsx
│   │   ├── DirectorReport.tsx
│   │   ├── BalancePatchViewer.tsx
│   │   └── JsonTree.tsx
│   ├── hooks/
│   │   ├── useSimulation.ts
│   │   └── useTelemetry.ts
│   └── lib/
│       ├── api.ts
│       ├── websocket.ts
│       ├── types.ts
│       └── utils.ts
│
└── data/
    └── omniforge.db
```

---

## 9. Installation & Setup

### Prerequisites
* Python 3.11+
* Node.js 18+ and npm

### 1. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Provide `OPENAI_API_KEY` to enable OpenAI mode. If left blank, OmniForge automatically operates in Local Deterministic Swarm Mode).*

### 2. Backend Setup
```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Run backend test suite
$env:PYTHONPATH="."; python -m pytest backend/tests -v

# Start FastAPI backend
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend will be available at: `http://localhost:8000` (Swagger docs: `http://localhost:8000/docs`).

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run build
npm run dev
```
The Mission Control dashboard will be available at: `http://localhost:3000`.

---

## 10. Demo Workflow

1. Open `http://localhost:3000` in your browser.
2. Select a preset scenario (e.g. **Infernal Crucible [Seed 108]** or **Default Gauntlet [Seed 42]**).
3. Click **START SWARM** to launch all 3 autonomous personas.
4. Watch live actions stream across `CASUAL.EXE`, `SPEEDRUN.EXE`, and `EXPLORER.EXE`.
5. Observe the **Frustration Timeline** and **10-Room Heatmap** react in real-time as Room 6 damage spikes trigger friction.
6. Upon dungeon clearance, the **Director Agent** automatically synthesizes the results, outputs the **Game Health Score**, and unlocks the **DIRECTOR REPORT**.
7. Inspect the generated `balance_patch.json` or download it directly with one click.
8. Click **REPLAY** to re-stream the stored run telemetry at adjustable speeds (0.5x, 1x, 2x, 5x).

---

## 11. Sample `balance_patch.json`

```json
{
  "version": "1.0",
  "simulation_id": "RUN-A91F2B",
  "summary": "Identified 3 gameplay balance adjustments across 2 rooms. Highest friction observed in Room 6.",
  "health_score": 74,
  "changes": [
    {
      "id": "PATCH-001",
      "room": 6,
      "category": "difficulty",
      "severity": "critical",
      "affected_agents": [
        "casual",
        "explorer"
      ],
      "issue": "Room 6 exhibits severe combat lethality and friction spike.",
      "evidence": {
        "casual_frustration_peak": 85,
        "total_damage_received": 78,
        "failed_actions": 2,
        "anomalies_triggered": 2,
        "friction_score": 79.2
      },
      "recommendation": "Reduce enemy base attack by 18% in Room 6 and add 1 guaranteed healing drop.",
      "confidence": 0.92
    }
  ],
  "generated_at": "2026-09-27T22:15:00Z"
}
```

---

## 12. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/runs` | Create a new simulation run with optional seed |
| `GET` | `/api/runs` | List past simulation runs |
| `GET` | `/api/runs/{run_id}` | Get detailed metrics, report, patch, and analytics |
| `POST` | `/api/runs/{run_id}/start` | Start swarm simulation |
| `POST` | `/api/runs/{run_id}/stop` | Abort active simulation |
| `POST` | `/api/runs/{run_id}/replay` | Replay historical run events |
| `GET` | `/api/runs/{run_id}/events` | Retrieve full telemetry event history |
| `GET` | `/api/runs/{run_id}/metrics` | Retrieve per-agent summary metrics |
| `GET` | `/api/runs/{run_id}/report` | Retrieve Director QA report |
| `GET` | `/api/runs/{run_id}/patch` | Retrieve `balance_patch.json` |
| `GET` | `/api/health` | Service health status & AI mode |
| `WS` | `/ws/runs/{run_id}` | Real-time WebSocket event stream |
