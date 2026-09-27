from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.memory.repository import repo
from backend.app.api.runs import router as runs_router
from backend.app.api.agents import router as agents_router
from backend.app.api.websocket import router as ws_router
from backend.app.core.logging import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing OmniForge backend systems...")
    await repo.initialize()
    try:
        from backend.app.memory.mock_seeder import seed_mock_datasets
        await seed_mock_datasets(repo)
    except Exception as e:
        logger.warning(f"Failed to auto-seed mock datasets: {e}")
    yield
    logger.info("Shutting down OmniForge backend systems...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(runs_router, prefix=settings.API_PREFIX)
app.include_router(agents_router, prefix=settings.API_PREFIX)
app.include_router(ws_router)

@app.get("/api/health")
async def health_check():
    from backend.app.agents.orchestrator import orchestrator
    return {
        "status": "healthy",
        "service": "OmniForge AI Playtesting Swarm",
        "version": settings.VERSION,
        "ai_mode": orchestrator.get_ai_mode()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)
