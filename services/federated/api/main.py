from fastapi import FastAPI
from .routes import clients, updates, models, health

app = FastAPI(title="BoltzTrader Federated Mesh")

app.include_router(clients.router, prefix="/api/federated/clients", tags=["clients"])
app.include_router(updates.router, prefix="/api/federated/updates", tags=["updates"])
app.include_router(models.router, prefix="/api/federated/models", tags=["models"])
app.include_router(health.router, prefix="/api/federated/health", tags=["health"])