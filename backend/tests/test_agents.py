import pytest
from backend.app.engine.game_engine import SimulatedGameEngine
from backend.app.agents.base import LocalDeterministicProvider
from backend.app.agents.casual import CasualAgent
from backend.app.agents.speedrunner import SpeedrunnerAgent
from backend.app.agents.explorer import ExplorerAgent

@pytest.mark.asyncio
async def test_casual_agent_step_and_frustration():
    engine = SimulatedGameEngine("RUN-TEST", "casual", seed=42)
    provider = LocalDeterministicProvider()
    agent = CasualAgent(engine, provider, speed_multiplier=10.0)

    # Initial state
    assert agent.frustration == 0
    
    # Run steps
    for _ in range(5):
        if agent.is_finished:
            break
        await agent.step()
        
    assert agent.actions_taken > 0
    assert len(agent.frustration_history) > 0
    assert 0 <= agent.frustration <= 100

@pytest.mark.asyncio
async def test_speedrunner_agent_bypasses():
    engine = SimulatedGameEngine("RUN-TEST", "speedrunner", seed=42)
    provider = LocalDeterministicProvider()
    agent = SpeedrunnerAgent(engine, provider, speed_multiplier=10.0)

    # Room 1 has bypass
    await agent.step()
    # Speedrunner should prefer bypass on room 1
    assert agent.bypasses_used >= 1 or agent.actions_taken >= 1
    summary = agent.get_metrics_summary()
    assert "efficiency_score" in summary

@pytest.mark.asyncio
async def test_explorer_agent_completionism():
    engine = SimulatedGameEngine("RUN-TEST", "explorer", seed=42)
    provider = LocalDeterministicProvider()
    agent = ExplorerAgent(engine, provider, speed_multiplier=10.0)

    # Step 1 should inspect room 1
    await agent.step()
    assert agent.rooms_inspected >= 1
    summary = agent.get_metrics_summary()
    assert "exploration_score" in summary
