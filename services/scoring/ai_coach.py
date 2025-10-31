from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import openai
import os
from datetime import datetime
from supabase import create_client

router = APIRouter()

class RiskProfile(BaseModel):
    risk_tolerance: str
    holding_time: str
    trade_frequency: str
    max_position_size: float
    preferred_sectors: List[str]

class DailySummaryRequest(BaseModel):
    user_id: str
    risk_profile: RiskProfile

class DailySummaryResponse(BaseModel):
    matching_signals_count: int
    total_signals_count: int
    coach_message: str
    recommendations: List[str]
    market_outlook: str

# Initialize OpenAI and Supabase
openai.api_key = os.getenv("OPENAI_API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase = create_client(supabase_url, supabase_key)

@router.post("/coach/daily-summary", response_model=DailySummaryResponse)
async def generate_daily_summary(request: DailySummaryRequest):
    """Generate personalized daily trading summary with AI coach"""
    try:
        # Get signals matching user's risk profile
        matching_signals = await get_matching_signals(request.risk_profile)
        total_signals = await get_total_signals()
        
        # Generate AI coach message
        coach_message = await generate_coach_message(
            request.risk_profile, 
            len(matching_signals), 
            total_signals
        )
        
        # Generate recommendations
        recommendations = generate_recommendations(request.risk_profile, matching_signals)
        
        return DailySummaryResponse(
            matching_signals_count=len(matching_signals),
            total_signals_count=total_signals,
            coach_message=coach_message,
            recommendations=recommendations,
            market_outlook=await generate_market_outlook()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")

@router.post("/coach/personalized-signals")
async def get_personalized_signals(request: DailySummaryRequest):
    """Get signals filtered by user's risk profile"""
    try:
        signals = await get_matching_signals(request.risk_profile)
        
        return {
            "signals": signals,
            "message": f"Found {len(signals)} signals matching your {request.risk_profile.risk_tolerance} risk profile"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get personalized signals: {str(e)}")

async def get_matching_signals(risk_profile: RiskProfile) -> List[Dict[str, Any]]:
    """Get signals that match user's risk profile"""
    try:
        # Map risk tolerance to signal risk levels
        risk_level_map = {
            'conservative': ['low'],
            'moderate': ['low', 'medium'],
            'aggressive': ['low', 'medium', 'high']
        }
        
        allowed_risk_levels = risk_level_map.get(risk_profile.risk_tolerance, ['medium'])
        
        # Build query
        query = supabase.table("signals").select("*").eq("is_active", True)
        
        # Filter by risk level
        query = query.in_("risk_level", allowed_risk_levels)
        
        # Filter by preferred sectors if specified
        if risk_profile.preferred_sectors:
            query = query.in_("sector", risk_profile.preferred_sectors)
        
        # Order by confidence
        query = query.order("confidence", desc=True).limit(20)
        
        result = query.execute()
        return result.data or []
        
    except Exception as e:
        print(f"Error getting matching signals: {e}")
        return []

async def get_total_signals() -> int:
    """Get total number of active signals"""
    try:
        result = supabase.table("signals").select("id", count="exact").eq("is_active", True).execute()
        return result.count or 0
    except Exception as e:
        print(f"Error getting total signals: {e}")
        return 0

async def generate_coach_message(risk_profile: RiskProfile, matching_count: int, total_count: int) -> str:
    """Generate personalized AI coach message"""
    try:
        prompt = f"""
        You are an AI trading coach. Generate a personalized daily message for a trader with this profile:
        - Risk tolerance: {risk_profile.risk_tolerance}
        - Holding time: {risk_profile.holding_time}
        - Trade frequency: {risk_profile.trade_frequency}
        - Max position size: ${risk_profile.max_position_size}
        
        Today there are {matching_count} signals matching their profile out of {total_count} total signals.
        
        Write a brief, encouraging message (2-3 sentences) that:
        1. Acknowledges their risk profile
        2. Comments on today's signal count
        3. Provides actionable guidance
        
        Keep it professional but friendly, like a personal trading mentor.
        """
        
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional trading coach providing personalized guidance."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        # Fallback message
        risk_messages = {
            'conservative': f"With your conservative approach, I've found {matching_count} low-risk signals for you today.",
            'moderate': f"Your balanced strategy has {matching_count} suitable opportunities today.",
            'aggressive': f"For your high-growth strategy, there are {matching_count} signals worth considering today."
        }
        
        return risk_messages.get(risk_profile.risk_tolerance, f"Found {matching_count} signals matching your profile today.")

def generate_recommendations(risk_profile: RiskProfile, signals: List[Dict[str, Any]]) -> List[str]:
    """Generate personalized recommendations based on profile and signals"""
    recommendations = []
    
    # Risk-based recommendations
    if risk_profile.risk_tolerance == 'conservative':
        recommendations.append("Focus on high-confidence signals with strong fundamentals")
        recommendations.append("Consider smaller position sizes to minimize risk")
    elif risk_profile.risk_tolerance == 'aggressive':
        recommendations.append("Look for high-potential signals with strong momentum")
        recommendations.append("Monitor volatility closely for optimal entry points")
    else:
        recommendations.append("Balance risk and reward with diversified positions")
        recommendations.append("Consider both technical and fundamental factors")
    
    # Frequency-based recommendations
    if risk_profile.trade_frequency == 'low':
        recommendations.append("Wait for the highest-confidence setups")
    elif risk_profile.trade_frequency == 'high':
        recommendations.append("Maintain discipline despite frequent opportunities")
    
    # Signal-specific recommendations
    if len(signals) > 10:
        recommendations.append("With many signals available, be selective and prioritize quality")
    elif len(signals) < 3:
        recommendations.append("Limited signals today - patience may be the best strategy")
    
    return recommendations[:3]  # Return top 3 recommendations

async def generate_market_outlook() -> str:
    """Generate general market outlook"""
    try:
        prompt = """
        Provide a brief 1-sentence market outlook for today based on general market conditions.
        Keep it neutral and educational, avoiding specific predictions.
        Focus on general market sentiment or volatility patterns.
        """
        
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a market analyst providing general market commentary."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=50,
            temperature=0.5
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        return "Mixed market conditions today - stay focused on your strategy."