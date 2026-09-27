from typing import List, Dict, Any
from fastapi import APIRouter
from backend.app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/agents", tags=["agents"])

@router.get("", response_model=List[Dict[str, Any]])
async def list_agent_personas():
    ai_mode = orchestrator.get_ai_mode()
    return [
        {
            "id": "casual",
            "name": "Casual Agent",
            "executable": "CASUAL.EXE",
            "patience": "Low",
            "risk_tolerance": "Low",
            "speed_priority": "Low",
            "exploration_priority": "Medium",
            "color": "#38bdf8", # cyan/sky
            "description": "Prefers safe decisions, heals at low HP, reactive to failure spirals with high frustration."
        },
        {
            "id": "speedrunner",
            "name": "Speedrunner Agent",
            "executable": "SPEEDRUN.EXE",
            "patience": "High",
            "risk_tolerance": "High",
            "speed_priority": "Extreme",
            "exploration_priority": "Low",
            "color": "#a855f7", # violet/purple
            "description": "Aggressively routes bypasses, maximizes burst damage heavy attacks, minimizes frame times."
        },
        {
            "id": "explorer",
            "name": "Explorer Agent",
            "executable": "EXPLORER.EXE",
            "patience": "High",
            "risk_tolerance": "Medium",
            "speed_priority": "Low",
            "exploration_priority": "Extreme",
            "color": "#10b981", # emerald
            "description": "Inspects all room objects, disarms hazards, explores optional branches, maximizes 100% completion."
        },
        {
            "id": "director",
            "name": "Director Agent",
            "executable": "DIRECTOR.EXE",
            "role": "QA Balancer",
            "color": "#f59e0b", # amber
            "description": "Cross-synthesizes all agent logs post-simulation, determines Game Health Score, generates balance_patch.json."
        }
    ]

@router.get("/status", response_model=Dict[str, Any])
async def get_system_status():
    return {
        "ai_mode": orchestrator.get_ai_mode(),
        "active_simulations": len(orchestrator._active_tasks),
        "engine_version": "1.0.0",
        "supported_rooms": 10
    }
