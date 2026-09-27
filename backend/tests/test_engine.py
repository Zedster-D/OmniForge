import pytest
from backend.app.engine.game_engine import SimulatedGameEngine
from backend.app.engine.models import ActionType, GameState
from backend.app.engine.scenarios import generate_scenario

def test_scenario_generation_deterministic():
    rooms1 = generate_scenario(seed=123)
    rooms2 = generate_scenario(seed=123)
    assert len(rooms1) == 10
    assert len(rooms2) == 10
    assert rooms1[0].title == rooms2[0].title
    assert rooms1[3].enemy.name == rooms2[3].enemy.name
    assert rooms1[3].enemy.hp == rooms2[3].enemy.hp

def test_game_engine_inspect():
    engine = SimulatedGameEngine(run_id="TEST-RUN", agent_id="tester", seed=42)
    state = engine.get_state()
    assert state.room == 1
    assert ActionType.INSPECT.value in state.available_actions
    
    result = engine.execute_action(ActionType.INSPECT.value)
    assert result.success is True
    assert result.game_state.inspected_current_room is True
    assert result.time_spent_ms > 0

def test_game_engine_combat_and_healing():
    engine = SimulatedGameEngine(run_id="TEST-RUN", agent_id="tester", seed=42)
    
    # Attack enemy
    res = engine.execute_action(ActionType.ATTACK.value)
    assert res.success is True
    assert res.damage_dealt > 0

    # Test heal action
    engine.player_hp = 50
    engine.potions = 2
    heal_res = engine.execute_action(ActionType.HEAL.value)
    assert heal_res.success is True
    assert heal_res.hp_restored > 0
    assert engine.player_hp > 50
    assert engine.potions == 1

def test_game_engine_bypass():
    engine = SimulatedGameEngine(run_id="TEST-RUN", agent_id="tester", seed=42)
    # Room 1 has bypass available
    assert engine.current_room.bypass_available is True
    assert ActionType.BYPASS.value in engine.get_available_actions()
    
    bypass_res = engine.execute_action(ActionType.BYPASS.value)
    assert bypass_res.success is True
    assert bypass_res.bypass_used is True
    # Advanced to room 2
    assert engine.current_room.room_number == 2

def test_invalid_action_rejected():
    engine = SimulatedGameEngine(run_id="TEST-RUN", agent_id="tester", seed=42)
    res = engine.execute_action("non_existent_cheat_action")
    assert res.success is False
    assert "unavailable" in res.message or "Unknown" in res.message
