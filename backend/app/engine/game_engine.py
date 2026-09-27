import random
from typing import List, Dict, Any, Optional
from backend.app.engine.models import (
    RoomDefinition, GameState, ActionResult, ActionType, Item, Hazard, Enemy
)
from backend.app.engine.scenarios import generate_scenario
from backend.app.core.exceptions import InvalidActionError

class SimulatedGameEngine:
    """
    Stateful game engine simulating a 10-room dungeon crawler with deterministic seeding,
    strict action validation, rich telemetry generation, and combat/exploration resolution.
    """
    def __init__(self, run_id: str, agent_id: str, seed: int = 42):
        self.run_id = run_id
        self.agent_id = agent_id
        self.seed = seed
        self.rng = random.Random(seed + hash(agent_id) % 10000)
        
        self.rooms: List[RoomDefinition] = generate_scenario(seed)
        self.current_room_idx: int = 0
        
        # Player attributes
        self.player_hp: int = 100
        self.max_player_hp: int = 100
        self.potions: int = 2
        self.inventory: List[Item] = []
        self.is_dead: bool = False
        self.is_victory: bool = False
        
        # Tracking
        self.room_elapsed_ms: int = 0
        self.total_elapsed_ms: int = 0
        self.turns_in_room: int = 0
        self.inspected_current_room: bool = False
        self.optional_explored_in_room: bool = False
        
        # History
        self.action_history: List[Dict[str, Any]] = []

    @property
    def current_room(self) -> RoomDefinition:
        if self.current_room_idx < len(self.rooms):
            return self.rooms[self.current_room_idx]
        return self.rooms[-1]

    def get_available_actions(self) -> List[str]:
        if self.is_dead or self.is_victory:
            return []
            
        actions = []
        room = self.current_room
        enemy = room.enemy
        enemy_alive = enemy is not None and enemy.is_alive
        
        # Exploration / Inspection
        actions.append(ActionType.INSPECT.value)
        
        # Healing
        if self.potions > 0 and self.player_hp < self.max_player_hp:
            actions.append(ActionType.HEAL.value)
            
        # Combat actions
        if enemy_alive:
            actions.append(ActionType.ATTACK.value)
            actions.append(ActionType.HEAVY_ATTACK.value)
            actions.append(ActionType.DODGE.value)
            
        # Bypass
        if room.bypass_available and enemy_alive:
            actions.append(ActionType.BYPASS.value)
            
        # Collection
        uncollected_items = [it for it in room.items if not it.collected]
        if uncollected_items:
            actions.append(ActionType.COLLECT.value)
            
        # Optional exploration
        if room.optional_path_available and not self.optional_explored_in_room:
            actions.append(ActionType.EXPLORE.value)
            
        # Interact / puzzle / hazard
        active_hazards = [hz for hz in room.hazards if not hz.disarmed]
        if active_hazards:
            actions.append(ActionType.INTERACT.value)
            
        # Rest (only if safe or enemy defeated)
        if not enemy_alive and self.player_hp < self.max_player_hp:
            actions.append(ActionType.REST.value)
            
        return actions

    def get_state(self) -> GameState:
        room = self.current_room
        enemy = room.enemy
        
        items_names = [it.name for it in room.items if not it.collected]
        hazards_names = [hz.name for hz in room.hazards if not hz.disarmed]
        
        return GameState(
            run_id=self.run_id,
            agent_id=self.agent_id,
            room=room.room_number,
            player_hp=self.player_hp,
            max_player_hp=self.max_player_hp,
            potions=self.potions,
            enemy_type=enemy.enemy_type if enemy and enemy.is_alive else None,
            enemy_hp=enemy.hp if enemy and enemy.is_alive else None,
            enemy_max_hp=enemy.max_hp if enemy else None,
            available_actions=self.get_available_actions(),
            items=items_names,
            hazards=hazards_names,
            bypass_available=room.bypass_available and (enemy is not None and enemy.is_alive),
            optional_path_available=room.optional_path_available and not self.optional_explored_in_room,
            room_completed=self.is_current_room_completed(),
            is_dead=self.is_dead,
            is_victory=self.is_victory,
            room_elapsed_ms=self.room_elapsed_ms,
            total_elapsed_ms=self.total_elapsed_ms,
            turns_in_room=self.turns_in_room,
            inventory=[it.name for it in self.inventory],
            inspected_current_room=self.inspected_current_room
        )

    def is_current_room_completed(self) -> bool:
        room = self.current_room
        if room.enemy and room.enemy.is_alive:
            return False
        return True

    def execute_action(self, action_str: str) -> ActionResult:
        """
        Validates and executes an agent action, evolving the game state and returning ActionResult.
        """
        if self.is_dead:
            return ActionResult(
                success=False,
                action=action_str,
                message="Player is deceased. No actions can be performed.",
                game_state=self.get_state()
            )
            
        if self.is_victory:
            return ActionResult(
                success=False,
                action=action_str,
                message="Dungeon cleared. Victory achieved.",
                game_state=self.get_state()
            )

        avail = self.get_available_actions()
        if action_str not in avail:
            # Action is not currently valid
            return ActionResult(
                success=False,
                action=action_str,
                message=f"Action '{action_str}' is unavailable. Available actions: {avail}",
                game_state=self.get_state(),
                details={"reason": "Action not in available actions", "available": avail}
            )

        self.turns_in_room += 1
        room = self.current_room
        enemy = room.enemy
        
        # Dispatch action
        try:
            action_type = ActionType(action_str)
        except ValueError:
            return ActionResult(
                success=False,
                action=action_str,
                message=f"Unknown action type: {action_str}",
                game_state=self.get_state()
            )

        if action_type == ActionType.INSPECT:
            return self._handle_inspect()
        elif action_type == ActionType.ATTACK:
            return self._handle_attack(is_heavy=False)
        elif action_type == ActionType.HEAVY_ATTACK:
            return self._handle_attack(is_heavy=True)
        elif action_type == ActionType.DODGE:
            return self._handle_dodge()
        elif action_type == ActionType.HEAL:
            return self._handle_heal()
        elif action_type == ActionType.COLLECT:
            return self._handle_collect()
        elif action_type == ActionType.BYPASS:
            return self._handle_bypass()
        elif action_type == ActionType.EXPLORE:
            return self._handle_explore()
        elif action_type == ActionType.INTERACT:
            return self._handle_interact()
        elif action_type == ActionType.REST:
            return self._handle_rest()
            
        return ActionResult(
            success=False,
            action=action_str,
            message="Unhandled action",
            game_state=self.get_state()
        )

    def _handle_inspect(self) -> ActionResult:
        self.inspected_current_room = True
        time_spent = 500
        self.room_elapsed_ms += time_spent
        self.total_elapsed_ms += time_spent
        
        room = self.current_room
        details = []
        if room.enemy and room.enemy.is_alive:
            details.append(f"Enemy: {room.enemy.name} (HP: {room.enemy.hp}/{room.enemy.max_hp}, ATK: {room.enemy.attack_power})")
        if room.hazards:
            details.append(f"Hazards: {', '.join(h.name for h in room.hazards if not h.disarmed)}")
        if room.items:
            details.append(f"Items: {', '.join(it.name for it in room.items if not it.collected)}")
        if room.bypass_available:
            details.append(f"Bypass: {room.bypass_description}")
            
        msg = f"Inspected Room {room.room_number}: {room.description} | " + " | ".join(details)
        return ActionResult(
            success=True,
            action=ActionType.INSPECT.value,
            message=msg,
            time_spent_ms=time_spent,
            game_state=self.get_state()
        )

    def _handle_attack(self, is_heavy: bool) -> ActionResult:
        room = self.current_room
        enemy = room.enemy
        if not enemy or not enemy.is_alive:
            return ActionResult(
                success=False,
                action=ActionType.HEAVY_ATTACK.value if is_heavy else ActionType.ATTACK.value,
                message="No enemy present to attack.",
                game_state=self.get_state()
            )
            
        time_spent = 1200 if is_heavy else 800
        self.room_elapsed_ms += time_spent
        self.total_elapsed_ms += time_spent
        
        # Player damage calculation
        if is_heavy:
            base_dmg = self.rng.randint(35, 52)
        else:
            base_dmg = self.rng.randint(18, 28)
            
        net_player_dmg = max(5, base_dmg - enemy.defense)
        enemy.hp -= net_player_dmg
        
        msg_parts = [f"Dealt {net_player_dmg} {'heavy ' if is_heavy else ''}damage to {enemy.name}."]
        
        # Enemy defeat check
        damage_taken = 0
        if enemy.hp <= 0:
            enemy.hp = 0
            enemy.is_alive = False
            msg_parts.append(f"{enemy.name} was defeated!")
            
            # Auto-advance check or award minor potion drop
            if self.rng.random() < 0.35:
                self.potions += 1
                msg_parts.append("Looted 1 Health Potion from the enemy.")
        else:
            # Enemy retaliates
            enemy_base_atk = enemy.attack_power
            if is_heavy:
                enemy_base_atk = int(enemy_base_atk * 1.25)
            
            # Hazard additive damage if active
            active_hazards = [h for h in room.hazards if not h.disarmed]
            hazard_extra = 0
            if active_hazards and self.rng.random() < 0.4:
                hazard = active_hazards[0]
                hazard_extra = hazard.damage // 2
                msg_parts.append(f"Triggered {hazard.name} for {hazard_extra} environmental damage!")

            damage_taken = max(4, enemy_base_atk + hazard_extra + self.rng.randint(-2, 3))
            self.player_hp -= damage_taken
            msg_parts.append(f"{enemy.name} counter-attacked for {damage_taken} damage.")
            
            if self.player_hp <= 0:
                self.player_hp = 0
                self.is_dead = True
                msg_parts.append("Player succumbed to lethal damage!")

        # Check room transition if enemy dead and no mandatory barriers
        room_advanced = False
        if not self.is_dead and enemy.hp <= 0:
            room_advanced = self._check_and_advance_room()

        return ActionResult(
            success=True,
            action=ActionType.HEAVY_ATTACK.value if is_heavy else ActionType.ATTACK.value,
            message=" ".join(msg_parts),
            damage_dealt=net_player_dmg,
            damage_taken=damage_taken,
            time_spent_ms=time_spent,
            room_advanced=room_advanced,
            game_state=self.get_state()
        )

    def _handle_dodge(self) -> ActionResult:
        time_spent = 400
        self.room_elapsed_ms += time_spent
        self.total_elapsed_ms += time_spent
        
        room = self.current_room
        enemy = room.enemy
        
        # Stagger chance or evasion
        staggered = False
        if enemy and enemy.is_alive:
            if self.rng.random() < 0.65:
                enemy.staggered = True
                staggered = True
                msg = f"Executed tactical dodge! {enemy.name} is staggered and exposed."
            else:
                msg = f"Dodged, but {enemy.name} maintained composure."
        else:
            msg = "Executed evasive roll through room obstacles."

        return ActionResult(
            success=True,
            action=ActionType.DODGE.value,
            message=msg,
            time_spent_ms=time_spent,
            game_state=self.get_state(),
            details={"staggered": staggered}
        )

    def _handle_heal(self) -> ActionResult:
        if self.potions <= 0:
            return ActionResult(
                success=False,
                action=ActionType.HEAL.value,
                message="No potions remaining in inventory.",
                game_state=self.get_state()
            )
            
        time_spent = 600
        self.room_elapsed_ms += time_spent
        self.total_elapsed_ms += time_spent
        
        self.potions -= 1
        restore_amount = min(35, self.max_player_hp - self.player_hp)
        self.player_hp += restore_amount
        
        return ActionResult(
            success=True,
            action=ActionType.HEAL.value,
            message=f"Drank Health Potion. Restored +{restore_amount} HP ({self.player_hp}/{self.max_player_hp}). Potions left: {self.potions}.",
            hp_restored=restore_amount,
            time_spent_ms=time_spent,
            game_state=self.get_state()
        )

    def _handle_collect(self) -> ActionResult:
        room = self.current_room
        uncollected = [it for it in room.items if not it.collected]
        if not uncollected:
            return ActionResult(
                success=False,
                action=ActionType.COLLECT.value,
                message="No uncollected items remaining in this room.",
                game_state=self.get_state()
            )
            
        time_spent = 500
        self.room_elapsed_ms += time_spent
        self.total_elapsed_ms += time_spent
        
        acquired = []
        for it in uncollected:
            it.collected = True
            self.inventory.append(it)
            acquired.append(it.name)
            if it.item_type == "consumable":
                self.potions += 1
                
        msg = f"Collected {len(acquired)} item(s): {', '.join(acquired)}."
        
        # Check advance if room is clear
        room_advanced = False
        if not room.enemy or not room.enemy.is_alive:
            room_advanced = self._check_and_advance_room()

        return ActionResult(
            success=True,
            action=ActionType.COLLECT.value,
            message=msg,
            items_acquired=acquired,
            time_spent_ms=time_spent,
            room_advanced=room_advanced,
            game_state=self.get_state()
        )

    def _handle_bypass(self) -> ActionResult:
        room = self.current_room
        if not room.bypass_available:
            return ActionResult(
                success=False,
                action=ActionType.BYPASS.value,
                message="No bypass route available in this room.",
                game_state=self.get_state()
            )
            
        time_saved = room.bypass_time_saved_ms
        time_spent = 400
        self.room_elapsed_ms += time_spent
        self.total_elapsed_ms += time_spent
        
        msg = f"Successfully used bypass: {room.bypass_description}. Saved {time_saved}ms!"
        
        # Immediate advance
        room_advanced = self._advance_room()
        
        return ActionResult(
            success=True,
            action=ActionType.BYPASS.value,
            message=msg,
            bypass_used=True,
            time_spent_ms=time_spent,
            room_advanced=room_advanced,
            game_state=self.get_state(),
            details={"time_saved_ms": time_saved}
        )

    def _handle_explore(self) -> ActionResult:
        room = self.current_room
        if not room.optional_path_available or self.optional_explored_in_room:
            return ActionResult(
                success=False,
                action=ActionType.EXPLORE.value,
                message="No unexplored optional paths in this room.",
                game_state=self.get_state()
            )
            
        time_spent = 1000
        self.room_elapsed_ms += time_spent
        self.total_elapsed_ms += time_spent
        self.optional_explored_in_room = True
        
        acquired = []
        if room.optional_path_reward:
            self.inventory.append(room.optional_path_reward)
            acquired.append(room.optional_path_reward.name)
            msg = f"Explored hidden side alcove! Discovered rare reward: {room.optional_path_reward.name}."
        else:
            msg = "Explored optional chamber. Discovered ancient wall inscriptions."
            
        return ActionResult(
            success=True,
            action=ActionType.EXPLORE.value,
            message=msg,
            items_acquired=acquired,
            time_spent_ms=time_spent,
            game_state=self.get_state()
        )

    def _handle_interact(self) -> ActionResult:
        room = self.current_room
        active_hazards = [h for h in room.hazards if not h.disarmed]
        time_spent = 700
        self.room_elapsed_ms += time_spent
        self.total_elapsed_ms += time_spent
        
        if active_hazards:
            for h in active_hazards:
                h.disarmed = True
            msg = f"Disarmed environmental hazards: {', '.join(h.name for h in active_hazards)}."
        else:
            msg = "Interacted with ancient dungeon mechanism. Mechanism activated."
            
        return ActionResult(
            success=True,
            action=ActionType.INTERACT.value,
            message=msg,
            time_spent_ms=time_spent,
            game_state=self.get_state()
        )

    def _handle_rest(self) -> ActionResult:
        time_spent = 1500
        self.room_elapsed_ms += time_spent
        self.total_elapsed_ms += time_spent
        
        restored = min(20, self.max_player_hp - self.player_hp)
        self.player_hp += restored
        msg = f"Rested in cleared chamber. Recovered +{restored} HP ({self.player_hp}/{self.max_player_hp})."
        
        room_advanced = self._check_and_advance_room()
        
        return ActionResult(
            success=True,
            action=ActionType.REST.value,
            message=msg,
            hp_restored=restored,
            time_spent_ms=time_spent,
            room_advanced=room_advanced,
            game_state=self.get_state()
        )

    def _check_and_advance_room(self) -> bool:
        # Advance if room is cleared and all relevant exploration done or ready
        room = self.current_room
        if (not room.enemy or not room.enemy.is_alive):
            return self._advance_room()
        return False

    def _advance_room(self) -> bool:
        if self.current_room.is_exit_room or self.current_room_idx >= len(self.rooms) - 1:
            self.is_victory = True
            return True
            
        self.current_room_idx += 1
        self.room_elapsed_ms = 0
        self.turns_in_room = 0
        self.inspected_current_room = False
        self.optional_explored_in_room = False
        return True
