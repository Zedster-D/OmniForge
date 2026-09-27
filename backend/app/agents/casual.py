from typing import Dict, Any
from backend.app.agents.base import BasePlaytestingAgent, AgentDecisionProvider, AgentDecisionResult
from backend.app.engine.game_engine import SimulatedGameEngine
from backend.app.engine.models import GameState, ActionResult, ActionType

class CasualAgent(BasePlaytestingAgent):
    """
    Casual Player Persona:
    - Low patience, low risk tolerance, high survival priority.
    - Heals when HP drops dangerously.
    - Frustration spikes on repeated failures, critical HP, and heavy damage.
    - Frustration drops upon successful recovery and room clears.
    """
    def __init__(self, engine: SimulatedGameEngine, decision_provider: AgentDecisionProvider, speed_multiplier: float = 1.0):
        super().__init__(
            agent_id="casual",
            name="Casual",
            persona_description="Low patience, low risk tolerance, high survival priority, medium exploration, low speed priority. Heals when HP is low, flees dangerous fights if bypass is open, easily frustrated by repetitive damage spikes.",
            engine=engine,
            decision_provider=decision_provider,
            speed_multiplier=speed_multiplier
        )

    def update_metrics(self, result: ActionResult, state_before: GameState, decision: AgentDecisionResult):
        # Accumulate combat totals
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

        # Calculate Frustration delta
        delta = 0
        
        # +15 Critical HP
        if result.game_state.player_hp <= 25:
            delta += 15
            
        # +10 Failed action
        if not result.success:
            delta += 10
            # +8 Repeated failure
            if len(self.recent_history) >= 1 and not self.recent_history[-1].get("success", True):
                delta += 8

        # +5 Damage received
        if result.damage_taken > 0:
            delta += min(15, (result.damage_taken // 5) * 4)

        # -10 Successful heal
        if result.action == ActionType.HEAL.value and result.success:
            delta -= 10

        # -8 Room completion
        if result.room_advanced:
            delta -= 8

        # -5 Successful enemy defeat / major action
        if result.damage_dealt >= 30 or "defeated" in result.message:
            delta -= 5

        # Apply and clamp 0-100
        self.frustration = max(0, min(100, self.frustration + delta))
        
        self.frustration_history.append({
            "step": self.actions_taken,
            "room": result.game_state.room,
            "frustration": self.frustration,
            "delta": delta,
            "hp": result.game_state.player_hp
        })

    def get_metrics_summary(self) -> Dict[str, Any]:
        data = super().get_metrics_summary()
        # Calculate casual-specific survival efficiency
        data["survival_rate"] = 1.0 if not self.engine.is_dead else 0.0
        return data
