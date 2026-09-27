import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app

@pytest.mark.asyncio
async def test_health_check_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "ai_mode" in data

@pytest.mark.asyncio
async def test_create_and_get_run_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Create run
        res_create = await ac.post("/api/runs", json={"seed": 100})
        assert res_create.status_code == 200
        created = res_create.json()
        run_id = created["id"]
        assert run_id.startswith("RUN-")
        assert created["seed"] == 100

        # Get run details
        res_get = await ac.get(f"/api/runs/{run_id}")
        assert res_get.status_code == 200
        details = res_get.json()
        assert details["run"]["id"] == run_id

@pytest.mark.asyncio
async def test_list_agents_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/agents")
        assert res.status_code == 200
        agents = res.json()
        assert len(agents) >= 3
        agent_ids = [a["id"] for a in agents]
        assert "casual" in agent_ids
        assert "speedrunner" in agent_ids
        assert "explorer" in agent_ids
