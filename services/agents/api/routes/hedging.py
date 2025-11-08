from fastapi import APIRouter, HTTPException
from ...core.correlation_engine import CorrelationEngine
from ...models.schemas import CorrelationRequest, CorrelationResponse, HedgeRecommendation
from typing import Dict, List

router = APIRouter()
correlation_engine = CorrelationEngine()

@router.post("/correlate", response_model=CorrelationResponse)
async def compute_correlations(request: CorrelationRequest):
    """Compute cross-market correlations"""
    try:
        # Compute correlations
        correlations = correlation_engine.compute_correlations(request.price_data)
        
        # Suggest hedge pairs
        hedge_pairs_raw = correlation_engine.suggest_hedges(correlations)
        
        # Format hedge pairs
        hedge_pairs = []
        for base, hedge, corr in hedge_pairs_raw:
            hedge_pairs.append({
                "base_symbol": base,
                "hedge_symbol": hedge,
                "correlation": corr,
                "strength": "Strong" if abs(corr) > 0.8 else "Moderate" if abs(corr) > 0.6 else "Weak"
            })
        
        # Calculate diversification score if portfolio weights provided
        diversification_score = None
        # TODO: Add portfolio weights parameter and calculation
        
        return CorrelationResponse(
            correlations=correlations,
            hedge_pairs=hedge_pairs,
            diversification_score=diversification_score
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Correlation computation failed: {str(e)}")

@router.post("/hedge-ratio")
async def calculate_hedge_ratio(base_returns: List[float], hedge_returns: List[float]):
    """Calculate optimal hedge ratio"""
    try:
        hedge_ratio = correlation_engine.calculate_hedge_ratio(base_returns, hedge_returns)
        
        return {
            "hedge_ratio": hedge_ratio,
            "interpretation": "Short" if hedge_ratio < 0 else "Long",
            "strength": abs(hedge_ratio)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hedge ratio calculation failed: {str(e)}")

@router.post("/diversification")
async def calculate_diversification(portfolio_weights: Dict[str, float], correlations: Dict[str, Dict[str, float]]):
    """Calculate portfolio diversification score"""
    try:
        score = correlation_engine.get_diversification_score(portfolio_weights, correlations)
        
        return {
            "diversification_score": score,
            "rating": "Excellent" if score > 0.8 else "Good" if score > 0.6 else "Fair" if score > 0.4 else "Poor",
            "recommendation": "Well diversified" if score > 0.7 else "Consider adding uncorrelated assets"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diversification calculation failed: {str(e)}")

@router.get("/recommendations/{symbol}")
async def get_hedge_recommendations(symbol: str):
    """Get hedge recommendations for a symbol"""
    try:
        # TODO: Fetch real correlation data and generate recommendations
        mock_recommendations = [
            HedgeRecommendation(
                base_symbol=symbol,
                hedge_symbol="SPY",
                correlation=-0.65,
                hedge_ratio=0.8,
                confidence=0.75
            ),
            HedgeRecommendation(
                base_symbol=symbol,
                hedge_symbol="GLD",
                correlation=-0.45,
                hedge_ratio=0.6,
                confidence=0.68
            )
        ]
        
        return {
            "symbol": symbol,
            "recommendations": [rec.dict() for rec in mock_recommendations],
            "count": len(mock_recommendations)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hedge recommendations failed: {str(e)}")

@router.get("/market-regime")
async def detect_market_regime():
    """Detect current market regime for hedging strategy"""
    # TODO: Implement market regime detection
    return {
        "regime": "Risk-On",
        "confidence": 0.72,
        "indicators": {
            "vix": "Low",
            "correlation": "Moderate",
            "volatility": "Normal"
        },
        "hedging_strategy": "Reduce hedge ratios in risk-on environment"
    }