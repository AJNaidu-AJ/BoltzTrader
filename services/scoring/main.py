from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import numpy as np
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
from prometheus_fastapi_instrumentator import Instrumentator

from schemas import ScoreRequest, ScoreResponse, SignalCreate
from models.ensemble import EnsembleModel
from explain import router as explain_router
from backtest import router as backtest_router
from ai_coach import router as ai_coach_router
from news_api import router as news_router
from strategy_engine import router as strategy_router

load_dotenv()

# Initialize Sentry
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[
        StarletteIntegration(transaction_style="endpoint"),
        FastApiIntegration(auto_tag=True),
    ],
    traces_sample_rate=1.0,
)

app = FastAPI(title="AI Signal Scoring Service", version="1.0.0")

# Initialize Prometheus metrics
instrumentator = Instrumentator()
instrumentator.instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(explain_router, prefix="/api")
app.include_router(backtest_router, prefix="/api")
app.include_router(ai_coach_router, prefix="/api")
app.include_router(news_router, prefix="/api")
app.include_router(strategy_router, prefix="/api")

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL", "https://qmwyanlkaafeetqkthzm.supabase.co")
supabase_key = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtd3lhbmxrYWFmZWV0cWt0aHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDMyNzksImV4cCI6MjA3NzQxOTI3OX0.IynEM2m8qXDTOFhQ2MpDsDmA7z34IxvjI4N-eNQP5RE")
supabase: Client = create_client(supabase_url, supabase_key)

# Initialize ensemble model
ensemble_model = EnsembleModel()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-scoring"}

@app.post("/score", response_model=ScoreResponse)
async def score_signal(request: ScoreRequest):
    """Generate AI ensemble score for a trading signal"""
    try:
        # Mock market data - in production, fetch from market data API
        market_data = generate_mock_market_data(request.symbol)
        
        # Get ensemble prediction
        ensemble_score, confidence, individual_scores = ensemble_model.predict(
            request.symbol, market_data
        )
        
        # Create response
        response = ScoreResponse(
            symbol=request.symbol,
            timeframe=request.timeframe,
            ensemble_score=ensemble_score,
            confidence=confidence,
            rule_based_score=individual_scores['rule_based'],
            xgboost_score=individual_scores['xgboost'],
            lstm_score=individual_scores['lstm'],
            metadata={
                "market_data": market_data,
                "model_weights": ensemble_model.weights
            },
            timestamp=datetime.now()
        )
        
        # Save to Supabase signals table
        await save_signal_to_db(request.symbol, ensemble_score, confidence, market_data)
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")

async def save_signal_to_db(symbol: str, score: float, confidence: float, market_data: dict):
    """Save signal to Supabase signals table"""
    try:
        # Determine rank based on score
        if score >= 80:
            rank = "top"
        elif score >= 60:
            rank = "medium"
        else:
            rank = "low"
            
        # Calculate risk level
        price_change_percent = market_data.get("price_change_percent", 0.0)
        if confidence < 0.6 or abs(price_change_percent) > 5:
            risk_level = "high"
        elif confidence > 0.8 and abs(price_change_percent) < 2:
            risk_level = "low"
        else:
            risk_level = "medium"
        
        signal_data = {
            "symbol": symbol,
            "company_name": symbol,  # Would fetch from API in production
            "current_price": market_data.get("current_price", 100.0),
            "price_change": market_data.get("price_change", 0.0),
            "price_change_percent": price_change_percent,
            "volume": int(market_data.get("volume", 1000000)),
            "confidence": confidence,
            "rank": rank,
            "risk_level": risk_level,
            "sector": get_sector_for_symbol(symbol),
            "technical_indicators": {
                "rsi": market_data.get("rsi", 50),
                "macd": market_data.get("macd", 0),
                "volume_ratio": market_data.get("volume_ratio", 1.0)
            },
            "signal_reasons": generate_signal_reasons(score, confidence),
            "rule_matches": generate_rule_matches(market_data, score),
            "timeframe": "1d"
        }
        
        result = supabase.table("signals").insert(signal_data).execute()
        return result.data
        
    except Exception as e:
        print(f"Error saving to database: {e}")
        return None

def generate_mock_market_data(symbol: str) -> dict:
    """Generate mock market data for testing"""
    return {
        "current_price": np.random.uniform(50, 200),
        "price_change": np.random.uniform(-10, 10),
        "price_change_percent": np.random.uniform(-5, 5),
        "volume": np.random.randint(500000, 5000000),
        "volume_ratio": np.random.uniform(0.5, 3.0),
        "rsi": np.random.uniform(20, 80),
        "macd": np.random.uniform(-2, 2),
        "bb_position": np.random.uniform(0, 1),
        "atr": np.random.uniform(0.5, 2.0),
        "ma_signal": np.random.choice([-1, 0, 1]),
        "volatility": np.random.uniform(0.1, 0.5),
        "momentum": np.random.uniform(-0.1, 0.1),
        "sector_performance": np.random.uniform(-3, 3)
    }

def get_sector_for_symbol(symbol: str) -> str:
    """Get sector for symbol - mock implementation"""
    sectors = ["Technology", "Healthcare", "Finance", "Energy", "Consumer"]
    return np.random.choice(sectors)

def generate_signal_reasons(score: float, confidence: float) -> list:
    """Generate reasons for the signal"""
    reasons = []
    
    if score > 75:
        reasons.append("Strong technical momentum")
    if confidence > 80:
        reasons.append("High model agreement")
    if score > 60:
        reasons.append("Positive market indicators")
        
    return reasons if reasons else ["Mixed signals"]

def generate_rule_matches(market_data: dict, score: float) -> list:
    """Generate rule matches for explanation"""
    rules = []
    
    rsi = market_data.get("rsi", 50)
    if rsi > 70:
        rules.append({"name": "RSI Overbought", "value": f"RSI at {rsi:.1f}", "weight": 0.3})
    elif rsi < 30:
        rules.append({"name": "RSI Oversold", "value": f"RSI at {rsi:.1f}", "weight": 0.3})
    
    volume_ratio = market_data.get("volume_ratio", 1.0)
    if volume_ratio > 1.5:
        rules.append({"name": "High Volume", "value": f"{volume_ratio:.1f}x average", "weight": 0.25})
    
    price_change = market_data.get("price_change_percent", 0)
    if abs(price_change) > 3:
        direction = "up" if price_change > 0 else "down"
        rules.append({"name": "Price Momentum", "value": f"{abs(price_change):.1f}% {direction}", "weight": 0.3})
    
    if score > 75:
        rules.append({"name": "Strong Signal", "value": f"{score:.1f}% confidence", "weight": 0.15})
    
    return sorted(rules, key=lambda x: x.get("weight", 0), reverse=True)[:3]

# Add API documentation endpoint
@app.get("/api/docs", include_in_schema=False)
async def get_api_docs():
    from docs_generator import generate_api_docs
    return generate_api_docs(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)