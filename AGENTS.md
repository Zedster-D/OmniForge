# OmniForge Agent Specifications & Architecture

OmniForge orchestrates 3 autonomous playtesting player agents plus 1 analytical Director agent across a simulated 10-room dungeon crawler environment.

```
+-----------------------------------------------------------------------------------+
|                               SIMULATION ORCHESTRATOR                             |
+-----------------------------------------------------------------------------------+
       | (Same Scenario Seed)                                      | Telemetry & Metrics
       v                                                           v
+-------------------+  +---------------------+  +--------------------+  +-----------+
|    CASUAL AGENT   |  |  SPEEDRUNNER AGENT  |  |   EXPLORER AGENT   |  | SQLite &  |
|  (casual.py)      |  |  (speedrunner.py)   |  |   (explorer.py)    |  | WebSockets|
+-------------------+  +---------------------+  +--------------------+  +-----------+
       \                          |                         /                  ^
        \                         v                        /                   |
         +------------------------------------------------+                    |
         |         10-ROOM SIMULATED GAME ENGINE          |--------------------+
         +------------------------------------------------+
                                  |
                                  | All 3 Simulations Complete
                                  v
                   +-----------------------------+
                   |       DIRECTOR AGENT        |
                   |        (director.py)        |
                   +-----------------------------+
                                  |
                                  v
                   +-----------------------------+
                   |     balance_patch.json      |
                   +-----------------------------+
```

---

## 1. Casual Agent (`casual.py`)
- **Profile**: Low patience, low risk tolerance, high survival priority, medium exploration, low speed priority.
- **Key Mechanics**:
  - Heals when `player_hp <= 45`.
  - Flees or avoids high-risk heavy attacks unless enemy is staggered.
  - Frustration is calculated in real-time (0–100 scale):
    - `+15` Critical HP (< 25%)
    - `+10` Failed Action
    - `+8` Repeated Failure
    - `+5` Damage Received
    - `+4` Blocked Progress
    - `-10` Successful Heal
    - `-8` Room Completion
    - `-5` Successful Major Action
- **Telemetry Tracked**: Actions, Failures, Damage Taken, Heals, Rooms Completed, Frustration History.

---

## 2. Speedrunner Agent (`speedrunner.py`)
- **Profile**: High patience, high risk tolerance, extreme speed priority, low exploration.
- **Key Mechanics**:
  - Always uses `bypass` when `bypass_available == true`.
  - Minimizes actions per room, avoids optional fights, ignores lore and secondary chests.
  - Prioritizes heavy attacks and burst damage to rush room exits.
- **Telemetry Tracked**: Actions Taken, Completion Time (ms), Damage Taken, Bypasses Used, Failed Actions, Efficiency Score.

---

## 3. Explorer Agent (`explorer.py`)
- **Profile**: High patience, medium risk tolerance, extreme exploration, extreme completionism.
- **Key Mechanics**:
  - Inspects every room before acting.
  - Interacts with all items, lore objects, and switches.
  - Explores optional paths before unlocking exits.
  - Gathers 100% of available resources.
- **Telemetry Tracked**: Items Discovered, Items Collected, Optional Paths Explored, Rooms Fully Explored, Exploration Score.

---

## 4. Director Agent (`director.py`)
- **Role**: Executive QA & Game Systems Balancer.
- **Inputs**: Telemetry logs, per-room friction metrics, anomaly detection events, cross-agent differential metrics.
- **Outputs**:
  - Game Health Score (0–100 heuristic).
  - Executive Summary.
  - Persona-Specific vs. Systemic Friction Analysis.
  - `balance_patch.json`: Machine-readable balance patch file with specific tuning recommendations, confidence levels, and telemetry evidence.
