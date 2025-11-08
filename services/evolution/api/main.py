from fastapi import FastAPI
from .routes import predictions, evolution, health

app = FastAPI(title="BoltzTrader Predictive Analytics & Evolution API")

app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])
app.include_router(evolution.router, prefix="/api/evolution", tags=["evolution"])
app.include_router(health.router, prefix="/api/health", tags=["health"])