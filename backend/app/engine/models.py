from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ActionType(str, Enum):
    ATTACK = "attack"
    HEAVY_ATTACK = "heavy_attack"
    DODGE = "dodge"
    HEAL = "heal"
    INTERACT = "interact"
    COLLECT = "collect"
    BYPASS = "bypass"
    EXPLORE = "explore"
    INSPECT = "inspect"
    REST = "rest"

class Item(BaseModel):
    id: str
    name: str
    item_type: str # consumable, relic, key, lore
    value: int = 0
    description: str
    collected: bool = False

class Hazard(BaseModel):
    id: str
    name: str
    damage: int
    dodge_difficulty: float = 0.5 # 0.0 to 1.0
    disarmed: bool = False
    description: str

class Enemy(BaseModel):
    name: str
    enemy_type: str
    hp: int
    max_hp: int
    attack_power: int
    defense: int = 0
    staggered: bool = False
    is_alive: bool = True

class RoomDefinition(BaseModel):
    room_number: int
    title: str
    description: str
    enemy: Optional[Enemy] = None
    items: List[Item] = Field(default_factory=list)
    hazards: List[Hazard] = Field(default_factory=list)
    bypass_available: bool = False
    bypass_description: Optional[str] = None
    bypass_time_saved_ms: int = 3500
    optional_path_available: bool = False
    optional_path_explored: bool = False
    optional_path_reward: Optional[Item] = None
    is_exit_room: bool = False

class GameState(BaseModel):
    run_id: str
    agent_id: str
    room: int
    player_hp: int = 100
    max_player_hp: int = 100
    potions: int = 2
    enemy_type: Optional[str] = None
    enemy_hp: Optional[int] = None
    enemy_max_hp: Optional[int] = None
    available_actions: List[str] = Field(default_factory=list)
    items: List[str] = Field(default_factory=list)
    hazards: List[str] = Field(default_factory=list)
    bypass_available: bool = False
    optional_path_available: bool = False
    room_completed: bool = False
    is_dead: bool = False
    is_victory: bool = False
    room_elapsed_ms: int = 0
    total_elapsed_ms: int = 0
    turns_in_room: int = 0
    inventory: List[str] = Field(default_factory=list)
    inspected_current_room: bool = False

    def to_summary_dict(self) -> Dict[str, Any]:
        """Simple summary for agent decisions and UI."""
        return {
            "room": self.room,
            "player_hp": self.player_hp,
            "max_player_hp": self.max_player_hp,
            "potions": self.potions,
            "enemy_type": self.enemy_type,
            "enemy_hp": self.enemy_hp,
            "available_actions": self.available_actions,
            "items_present": self.items,
            "hazards_present": self.hazards,
            "bypass_available": self.bypass_available,
            "optional_path_available": self.optional_path_available,
            "room_completed": self.room_completed,
            "inventory": self.inventory,
            "turns_in_room": self.turns_in_room,
        }

class ActionResult(BaseModel):
    success: bool
    action: str
    message: str
    damage_dealt: int = 0
    damage_taken: int = 0
    hp_restored: int = 0
    items_acquired: List[str] = Field(default_factory=list)
    bypass_used: bool = False
    time_spent_ms: int = 0
    room_advanced: bool = False
    game_state: GameState
    details: Dict[str, Any] = Field(default_factory=dict)
