class OmniForgeException(Exception):
    """Base exception for OmniForge platform."""
    pass

class GameEngineError(OmniForgeException):
    """Raised when an illegal or invalid game engine operation occurs."""
    pass

class InvalidActionError(GameEngineError):
    """Raised when an agent attempts an action that is not currently valid."""
    def __init__(self, action: str, reason: str, available_actions: list[str] | None = None):
        super().__init__(f"Action '{action}' is invalid: {reason}")
        self.action = action
        self.reason = reason
        self.available_actions = available_actions or []

class RunNotFoundError(OmniForgeException):
    """Raised when a requested simulation run cannot be found."""
    def __init__(self, run_id: str):
        super().__init__(f"Simulation run '{run_id}' not found.")
        self.run_id = run_id

class SimulationAlreadyRunningError(OmniForgeException):
    """Raised when attempting to start an already active simulation."""
    def __init__(self, run_id: str):
        super().__init__(f"Simulation run '{run_id}' is already running.")
        self.run_id = run_id
