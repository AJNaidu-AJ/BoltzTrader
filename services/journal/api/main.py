from fastapi import FastAPI
from .routes import journal, analytics, exports

app = FastAPI(title="BoltzTrader - Trade Journal & Analytics")
app.include_router(journal.router, prefix="/api/journal", tags=["journal"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(exports.router, prefix="/api/exports", tags=["exports"])

@app.get("/health")
async def health(): 
    return {"status": "ok"}