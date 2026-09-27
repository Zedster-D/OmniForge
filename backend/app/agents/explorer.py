from typing import Dict, Any
from backend.app.agents.base import BasePlaytestingAgent, AgentDecisionProvider, AgentDecisionResult
from backend.app.engine.game_engine import SimulatedGameEngine
from backend.app.engine.models import GameState, ActionResult, ActionType

class ExplorerAgent(BasePlaytestingAgent):
    """
    Explorer Player Persona:
    - High patience, medium risk tolerance, extreme exploration, extreme completionism.
    - Inspects every room, explores secret alcoves, disarms traps, and gathers all loot.
    - Calculates a 100% completionism / exploration score.
    """
    def __init__(self, engine: SimulatedGameEngine, decision_provider: AgentDecisionProvider, speed_multiplier: float = 1.0):
        super().__init__(
            agent_id="explorer",
            name="Explorer",
            persona_description="High patience, medium risk tolerance, extreme exploration, extreme completionism. Systematically inspects every chamber, searches for secret passages, collects all relics and lore artifacts.",
            engine=engine,
            decision_provider=decision_provider,
            speed_multiplier=speed_multiplier
        )
        self.optional_paths_explored: int = 0
        self.rooms_inspected: int = 0

    def update_metrics(self, result: ActionResult, state_before: GameState, decision: AgentDecisionResult):
        self.damage_taken += result.damage_taken
        self.damage_dealt += result.damage_dealt
        
        if result.action == ActionType.HEAL.value and result.success:
            self.heals_used += 1
        if result.bypass_used:
            self.bypasses_used += 1
        if result.items_acquired:
            self.items_collected += len(result.items_acquired)
        if result.action == ActionType.INSPECT.value and result.success:
            self.rooms_inspected += 1
        if result.action == ActionType.EXPLORE.value and result.success:
            self.optional_paths_explored += 1
        if not result.success:
            self.failed_actions += 1

        # Explorer frustration dynamics
        delta = 0
        if not result.success:
            delta += 7
        if result.damage_taken > 20:
            delta += 6
        if result.action in [ActionType.INSPECT.value, ActionType.EXPLORE.value, ActionType.COLLECT.value] and result.success:
            delta -= 8 # Rewarded by discovery

        self.frustration = max(0, min(100, self.frustration + delta))
        
        self.frustration_history.append({
            "step": self.actions_taken,
            "room": result.game_state.room,
            "frustration": self.frustration,
            "delta": delta,
            "hp": result.game_state.player_hp
        })

    def calculate_exploration_score(self) -> float:
        # 10 rooms + ~5 optional paths + items
        score = (self.rooms_inspected * 5.0) + (self.items_collected * 4.0) + (self.optional_paths_explored * 8.0)
        return min(100.0, round(score, 1))

    def get_metrics_summary(self) -> Dict[str, Any]:
        data = super().get_metrics_summary()
        data["exploration_score"] = self.calculate_exploration_score()
        data["optional_paths_explored"] = self.optional_paths_explored
        data["rooms_inspected"] = self.rooms_inspected
        return data
