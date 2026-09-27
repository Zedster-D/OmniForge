import random
from typing import List
from backend.app.engine.models import RoomDefinition, Enemy, Item, Hazard

ROOM_TEMPLATES = [
    {
        "room_number": 1,
        "title": "Forgotten Vestibule",
        "description": "A damp stone entrance hall littered with broken pottery.",
        "enemy": {"name": "Goblin Scout", "enemy_type": "goblin", "hp": 40, "max_hp": 40, "attack_power": 8, "defense": 1},
        "items": [{"id": "item_1_potion", "name": "Minor Health Potion", "item_type": "consumable", "value": 25, "description": "Restores 25 HP."}],
        "hazards": [],
        "bypass_available": True,
        "bypass_description": "A cracked wall crevice leads past the guard.",
        "optional_path_available": True,
        "optional_path_reward": {"id": "item_1_lore", "name": "Scout's Field Diary", "item_type": "lore", "value": 10, "description": "Notes about the deeper catacombs."},
    },
    {
        "room_number": 2,
        "title": "Submerged Armory",
        "description": "An ankle-deep flooded armory with rusted weapon racks.",
        "enemy": {"name": "Cave Crawler", "enemy_type": "beast", "hp": 55, "max_hp": 55, "attack_power": 12, "defense": 2},
        "items": [{"id": "item_2_shard", "name": "Iron Shield Shard", "item_type": "relic", "value": 15, "description": "Increases defense slightly."}],
        "hazards": [{"id": "haz_2_spikes", "name": "Submerged Spike Grid", "damage": 14, "dodge_difficulty": 0.4, "description": "Hidden underwater spikes."}],
        "bypass_available": True,
        "bypass_description": "An overhead drainage pipe allows stealth traversal.",
        "optional_path_available": False,
    },
    {
        "room_number": 3,
        "title": "Archivist's Scriptorium",
        "description": "Towering bookshelves rotten with mildew. Green dust hangs in the air.",
        "enemy": {"name": "Skeleton Scribe", "enemy_type": "undead", "hp": 65, "max_hp": 65, "attack_power": 14, "defense": 3},
        "items": [
            {"id": "item_3_scroll", "name": "Glyph of Warding", "item_type": "lore", "value": 20, "description": "Ancient protective ritual text."},
            {"id": "item_3_pot", "name": "Herbal Draught", "item_type": "consumable", "value": 30, "description": "Restores 30 HP."}
        ],
        "hazards": [{"id": "haz_3_gas", "name": "Toxic Mold Spores", "damage": 12, "dodge_difficulty": 0.5, "description": "Puffs of poisonous spores."}],
        "bypass_available": False,
        "optional_path_available": True,
        "optional_path_reward": {"id": "item_3_tome", "name": "Forbidden Grimoire", "item_type": "relic", "value": 35, "description": "High value arcane text."},
    },
    {
        "room_number": 4,
        "title": "Crypt of the Silent Watcher",
        "description": "Dark gothic mausoleum with flickering shadows.",
        "enemy": {"name": "Shadow Stalker", "enemy_type": "specter", "hp": 75, "max_hp": 75, "attack_power": 22, "defense": 4},
        "items": [{"id": "item_4_key", "name": "Bone Key", "item_type": "key", "value": 10, "description": "Unlocks crypt chambers."}],
        "hazards": [{"id": "haz_4_darts", "name": "Pressure Dart Traps", "damage": 18, "dodge_difficulty": 0.6, "description": "Rapid fire concealed darts."}],
        "bypass_available": True,
        "bypass_description": "A high rafter beam lets a nimble rogue cross unseen.",
        "optional_path_available": False,
    },
    {
        "room_number": 5,
        "title": "The Molten Crucible",
        "description": "A blazing foundry suspended above rivers of bubbling slag.",
        "enemy": {"name": "Armored Flame-Orc", "enemy_type": "humanoid", "hp": 90, "max_hp": 90, "attack_power": 20, "defense": 6},
        "items": [{"id": "item_5_pot", "name": "Greater Healing Flask", "item_type": "consumable", "value": 45, "description": "Restores 45 HP."}],
        "hazards": [{"id": "haz_5_lava", "name": "Lava Flare Eruption", "damage": 22, "dodge_difficulty": 0.55, "description": "Bursts of superheated slag."}],
        "bypass_available": True,
        "bypass_description": "A cooling exhaust shaft can be crawled through.",
        "optional_path_available": True,
        "optional_path_reward": {"id": "item_5_core", "name": "Pyretic Core", "item_type": "relic", "value": 40, "description": "Glowing elemental core."},
    },
    {
        "room_number": 6,
        "title": "Chamber of Pestilence",
        "description": "Vile miasma covers the floor. Slime drips from stalactites.",
        "enemy": {"name": "Blight Fiend", "enemy_type": "aberration", "hp": 110, "max_hp": 110, "attack_power": 26, "defense": 5},
        "items": [{"id": "item_6_antidote", "name": "Purified Salve", "item_type": "consumable", "value": 35, "description": "Restores 35 HP."}],
        "hazards": [{"id": "haz_6_rot", "name": "Acidic Bile Pools", "damage": 20, "dodge_difficulty": 0.65, "description": "Corrosive caustic acid."}],
        "bypass_available": False, # Forces combat friction!
        "optional_path_available": True,
        "optional_path_reward": {"id": "item_6_specimen", "name": "Preserved Blight Heart", "item_type": "relic", "value": 50, "description": "Curious biological anomaly."},
    },
    {
        "room_number": 7,
        "title": "Echoing Catacombs",
        "description": "A disorienting labyrinth of limestone pillars and mirrors.",
        "enemy": {"name": "Dungeon Stalker", "enemy_type": "beast", "hp": 85, "max_hp": 85, "attack_power": 24, "defense": 4},
        "items": [{"id": "item_7_mirror", "name": "Shard of Truth", "item_type": "relic", "value": 30, "description": "Reveals hidden passages."}],
        "hazards": [{"id": "haz_7_pit", "name": "Concealed Pitfall", "damage": 18, "dodge_difficulty": 0.5, "description": "Fragile slate floor collapse."}],
        "bypass_available": True,
        "bypass_description": "A mirror illusion concealing an instant shortcut.",
        "optional_path_available": False,
    },
    {
        "room_number": 8,
        "title": "Gladiator's Colosseum",
        "description": "A sand-strewn arena surrounded by iron cages.",
        "enemy": {"name": "Dread Minotaur", "enemy_type": "monstrosity", "hp": 130, "max_hp": 130, "attack_power": 28, "defense": 7},
        "items": [
            {"id": "item_8_shrine", "name": "Shrine Nectar", "item_type": "consumable", "value": 50, "description": "Full HP recovery."},
            {"id": "item_8_trophy", "name": "Champion's Medallion", "item_type": "relic", "value": 45, "description": "Gladiator glory artifact."}
        ],
        "hazards": [{"id": "haz_8_blade", "name": "Swinging Guillotine Blades", "damage": 25, "dodge_difficulty": 0.7, "description": "Massive pendulums."}],
        "bypass_available": False,
        "optional_path_available": True,
        "optional_path_reward": {"id": "item_8_blade", "name": "Executioner's Edge", "item_type": "relic", "value": 60, "description": "Lethal ancient weapon."},
    },
    {
        "room_number": 9,
        "title": "Sanctum of the Void Rift",
        "description": "Reality bends around a swirling purple anomaly in the floor.",
        "enemy": {"name": "Void Warden", "enemy_type": "celestial", "hp": 120, "max_hp": 120, "attack_power": 30, "defense": 6},
        "items": [{"id": "item_9_elixir", "name": "Void Elixir", "item_type": "consumable", "value": 60, "description": "Potent dimensional brew."}],
        "hazards": [{"id": "haz_9_distortion", "name": "Gravitational Rift", "damage": 24, "dodge_difficulty": 0.6, "description": "Pulls player violently."}],
        "bypass_available": True,
        "bypass_description": "An unstable portal connects directly to the final throne room.",
        "optional_path_available": True,
        "optional_path_reward": {"id": "item_9_star", "name": "Void Star Remnant", "item_type": "relic", "value": 75, "description": "Cosmic energy stone."},
    },
    {
        "room_number": 10,
        "title": "Throne of the Abyssal Sovereign",
        "description": "The heart of the citadel. A crowned tyrant sits atop a black obsidian throne.",
        "enemy": {"name": "Abyssal Sovereign", "enemy_type": "boss", "hp": 160, "max_hp": 160, "attack_power": 34, "defense": 8},
        "items": [{"id": "item_10_crown", "name": "Crown of Omniscience", "item_type": "relic", "value": 100, "description": "Final Victory Artifact."}],
        "hazards": [{"id": "haz_10_hellfire", "name": "Abyssal Flame Pillars", "damage": 28, "dodge_difficulty": 0.65, "description": "Pillars of dark fire."}],
        "bypass_available": False,
        "optional_path_available": False,
        "is_exit_room": True,
    }
]

def generate_scenario(seed: int = 42) -> List[RoomDefinition]:
    """
    Generate 10 deterministic rooms using the provided seed.
    Seed modifications introduce slight randomized variance in enemy HP, hazard dodge difficulty,
    and items while keeping room structure reproducible.
    """
    rng = random.Random(seed)
    rooms: List[RoomDefinition] = []
    
    for template in ROOM_TEMPLATES:
        # Enemy with variance
        enemy_data = template.get("enemy")
        enemy_obj = None
        if enemy_data:
            # Deterministic variance +/- 10%
            hp_mod = rng.randint(-3, 5)
            atk_mod = rng.randint(-1, 2)
            enemy_obj = Enemy(
                name=enemy_data["name"],
                enemy_type=enemy_data["enemy_type"],
                hp=max(20, enemy_data["hp"] + hp_mod),
                max_hp=max(20, enemy_data["max_hp"] + hp_mod),
                attack_power=max(5, enemy_data["attack_power"] + atk_mod),
                defense=enemy_data.get("defense", 0),
                is_alive=True
            )
        
        # Items
        items_objs: List[Item] = []
        for it in template.get("items", []):
            items_objs.append(Item(
                id=it["id"],
                name=it["name"],
                item_type=it["item_type"],
                value=it.get("value", 10),
                description=it["description"]
            ))
            
        # Hazards
        hazard_objs: List[Hazard] = []
        for hz in template.get("hazards", []):
            dmg_mod = rng.randint(-2, 3)
            hazard_objs.append(Hazard(
                id=hz["id"],
                name=hz["name"],
                damage=max(5, hz["damage"] + dmg_mod),
                dodge_difficulty=round(hz["dodge_difficulty"] + rng.uniform(-0.05, 0.05), 2),
                description=hz["description"]
            ))
            
        # Optional reward
        opt_reward = None
        if template.get("optional_path_reward"):
            r_data = template["optional_path_reward"]
            opt_reward = Item(
                id=r_data["id"],
                name=r_data["name"],
                item_type=r_data["item_type"],
                value=r_data.get("value", 20),
                description=r_data["description"]
            )
            
        room = RoomDefinition(
            room_number=template["room_number"],
            title=template["title"],
            description=template["description"],
            enemy=enemy_obj,
            items=items_objs,
            hazards=hazard_objs,
            bypass_available=template.get("bypass_available", False),
            bypass_description=template.get("bypass_description"),
            bypass_time_saved_ms=template.get("bypass_time_saved_ms", 3500),
            optional_path_available=template.get("optional_path_available", False),
            optional_path_reward=opt_reward,
            is_exit_room=template.get("is_exit_room", False)
        )
        rooms.append(room)
        
    return rooms
