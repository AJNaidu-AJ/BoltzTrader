from fastapi import APIRouter, HTTPException
from ...core.consensus_layer import ConsensusLayer
from ...core.confidence_aggregator import adjust_confidence, detect_outliers
from ...models.schemas import ConsensusRequest, ConsensusResponse, AgentSignal
from typing import List

router = APIRouter()
consensus_layer = ConsensusLayer()

@router.post("/vote", response_model=ConsensusResponse)
async def consensus_vote(request: ConsensusRequest):
    """Run consensus voting on agent signals"""
    try:
        # Generate signals from agents
        agent_signals = []
        for agent in request.agents:
            from ...core.agent_node import AgentNode
            agent_node = AgentNode(**agent.dict())
            signal = agent_node.generate_signal(request.market_data)
            agent_signals.append(signal)
        
        # Adjust confidence based on peer feedback
        adjusted_signals = adjust_confidence(agent_signals, agent_signals)
        
        # Get consensus
        consensus_result = consensus_layer.aggregate(adjusted_signals)
        
        return ConsensusResponse(
            consensus=consensus_result['consensus'],
            confidence=consensus_result['confidence'],
            score=consensus_result['score'],
            agreement=consensus_result['agreement'],
            votes=consensus_result['votes'],
            agent_breakdown=consensus_result['agent_breakdown'],
            agent_signals=[AgentSignal(
                agent_id=s['agent_id'],
                signal=s['signal'],
                confidence=s['confidence'],
                weight=s['weight']
            ) for s in adjusted_signals]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Consensus voting failed: {str(e)}")

@router.post("/validate")
async def validate_consensus(consensus_result: dict, min_confidence: float = 0.6):
    """Validate consensus quality"""
    try:
        is_valid = consensus_layer.validate_consensus(consensus_result, min_confidence)
        
        return {
            "valid": is_valid,
            "confidence": consensus_result.get('confidence', 0),
            "agreement": consensus_result.get('agreement', 0),
            "threshold_met": consensus_result.get('confidence', 0) >= min_confidence
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Consensus validation failed: {str(e)}")

@router.post("/outliers")
async def detect_agent_outliers(agent_signals: List[dict]):
    """Detect outlier agents in consensus"""
    try:
        outliers = detect_outliers(agent_signals)
        
        return {
            "outliers": outliers,
            "count": len(outliers),
            "total_agents": len(agent_signals)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Outlier detection failed: {str(e)}")

@router.put("/threshold")
async def update_consensus_threshold(new_threshold: float):
    """Update consensus decision threshold"""
    try:
        consensus_layer.update_threshold(new_threshold)
        
        return {
            "threshold": consensus_layer.threshold,
            "status": "updated"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Threshold update failed: {str(e)}")

@router.get("/metrics")
async def get_consensus_metrics():
    """Get consensus performance metrics"""
    # TODO: Fetch from database
    return {
        "total_votes": 1250,
        "accuracy": 0.78,
        "avg_confidence": 0.72,
        "avg_agreement": 0.68,
        "outlier_rate": 0.12
    }