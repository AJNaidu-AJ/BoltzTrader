from fastapi import FastAPI
from .routes import mesh, consensus, hedging, health

app = FastAPI(title="BoltzTrader Multi-Agent Trading Network")

app.include_router(mesh.router, prefix="/api/mesh", tags=["mesh"])
app.include_router(consensus.router, prefix="/api/consensus", tags=["consensus"])
app.include_router(hedging.router, prefix="/api/hedging", tags=["hedging"])
app.include_router(health.router, prefix="/api/health", tags=["health"])