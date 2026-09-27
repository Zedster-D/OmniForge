from typing import Dict, Any
from backend.app.agents.base import BasePlaytestingAgent, AgentDecisionProvider, AgentDecisionResult
from backend.app.engine.game_engine import SimulatedGameEngine
from backend.app.engine.models import GameState, ActionResult, ActionType

class SpeedrunnerAgent(BasePlaytestingAgent):
    """
    Speedrunner Player Persona:
    - High patience, high risk tolerance, extreme speed priority, low exploration.
    - Always bypasses whenever available to save maximum milliseconds.
    - Focuses on burst damage and fastest exits.
    """
    def __init__(self, engine: SimulatedGameEngine, decision_provider: AgentDecisionProvider, speed_multiplier: float = 1.0):
        super().__init__(
            agent_id="speedrunner",
            name="Speedrunner",
            persona_description="High patience, high risk tolerance, extreme speed priority, low exploration. Bypasses rooms immediately, uses high damage burst heavy attacks, minimizes elapsed milliseconds and skips loot.",
            engine=engine,
            decision_provider=decision_provider,
            speed_multiplier=speed_multiplier
        )

    def update_metrics(self, result: ActionResult, state_before: GameState, decision: AgentDecisionResult):
        self.damage_taken += result.damage_taken
        self.damage_dealt += result.damage_dealt
        
        if result.action == ActionType.HEAL.value and result.success:
            self.heals_used += 1
        if result.bypass_used:
            self.bypasses_used += 1
        if result.items_acquired:
            self.items_collected += len(result.items_acquired)
        if not result.success:
            self.failed_actions += 1

        # Speedrunners get frustrated if slowed down or forced into lengthy combat
        delta = 0
        if not result.success:
            delta += 8
        if result.game_state.turns_in_room > 4:
            delta += 6 # Frustrated by room slog
        if result.bypass_used:
            delta -= 12 # Satisfied by speed routing
        if result.room_advanced:
            delta -= 5

        self.frustration = max(0, min(100, self.frustration + delta))
        
        self.frustration_history.append({
            "step": self.actions_taken,
            "room": result.game_state.room,
            "frustration": self.frustration,
            "delta": delta,
            "hp": result.game_state.player_hp
        })

    def calculate_efficiency_score(self) -> float:
        # Benchmark ideal speed: ~15,000ms for 10 rooms
        if self.engine.total_elapsed_ms <= 0:
            return 100.0
        ideal_time = 12000
        ratio = ideal_time / max(ideal_time, self.engine.total_elapsed_ms)
        efficiency = min(100.0, max(20.0, ratio * 100 + (self.bypasses_used * 6)))
        return round(efficiency, 1)

    def get_metrics_summary(self) -> Dict[str, Any]:
        data = super().get_metrics_summary()
        data["efficiency_score"] = self.calculate_efficiency_score()
        return data
