from fastapi import FastAPI
from .routes import models, governance, validation, orchestrate

app = FastAPI(title="BoltzTrader Global AI Orchestrator", version="1.0.0")

app.include_router(models.router, prefix="/api/models", tags=["Models"])
app.include_router(governance.router, prefix="/api/governance", tags=["Governance"])
app.include_router(validation.router, prefix="/api/validation", tags=["Validation"])
app.include_router(orchestrate.router, prefix="/api/orchestrate", tags=["Orchestration"])

@app.get("/health")
async def health():
    return {"status": "ok", "orchestrator": True, "version": "1.0.0"}