from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import openai
import os
from datetime import datetime

router = APIRouter()

class ExplainRequest(BaseModel):
    symbol: str
    action: str = "BUY"
    rule_matches: List[Dict[str, Any]]

class ExplainResponse(BaseModel):
    symbol: str
    explanation: str
    bullets: List[str]
    generated_at: datetime

# Initialize OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

@router.post("/explain", response_model=ExplainResponse)
async def explain_signal(request: ExplainRequest):
    """Generate GPT-4o explanation for signal"""
    try:
        # Format rules for prompt
        rules_text = format_rules(request.rule_matches)
        
        # Create GPT prompt
        prompt = f"""Explain why signal {request.action} for {request.symbol} using these rules: {rules_text}.

Provide exactly 3 bullet points explaining the reasoning in simple terms for retail traders.
Format as:
• Point 1
• Point 2  
• Point 3"""

        # Call GPT-4o
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a trading signal explainer. Provide clear, concise explanations for retail traders."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.3
        )
        
        explanation = response.choices[0].message.content
        bullets = parse_bullets(explanation)
        
        return ExplainResponse(
            symbol=request.symbol,
            explanation=explanation,
            bullets=bullets,
            generated_at=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation failed: {str(e)}")

def format_rules(rule_matches: List[Dict[str, Any]]) -> str:
    """Format rule matches for GPT prompt"""
    if not rule_matches:
        return "Technical analysis indicators"
    
    formatted = []
    for rule in rule_matches[:3]:  # Top 3 rules
        name = rule.get('name', 'Technical indicator')
        value = rule.get('value', '')
        formatted.append(f"{name}: {value}")
    
    return ", ".join(formatted)

def parse_bullets(explanation: str) -> List[str]:
    """Extract bullet points from explanation"""
    lines = explanation.split('\n')
    bullets = []
    
    for line in lines:
        line = line.strip()
        if line.startswith('•') or line.startswith('-') or line.startswith('*'):
            bullets.append(line.lstrip('•-* '))
    
    # Fallback if no bullets found
    if not bullets and explanation:
        sentences = explanation.split('.')[:3]
        bullets = [s.strip() for s in sentences if s.strip()]
    
    return bullets[:3]  # Max 3 bullets