from fastapi import APIRouter, HTTPException
from ...core.agent_node import AgentNode
from ...core.consensus_layer import ConsensusLayer
from ...core.confidence_aggregator import calculate_network_confidence, calculate_consensus_strength
from ...models.schemas import MeshRunRequest, MeshRunResponse, NetworkStatus, ConsensusResponse
from datetime import datetime

router = APIRouter()
consensus_layer = ConsensusLayer()

@router.post("/run", response_model=MeshRunResponse)
async def run_mesh(request: MeshRunRequest):
    """Run multi-agent mesh consensus"""
    try:
        # Create agent instances
        agents = [AgentNode(**agent.dict()) for agent in request.agents]
        
        # Generate signals from all agents
        agent_signals = []
        for agent in agents:
            signal = agent.generate_signal(request.market_data)
            agent_signals.append(signal)
        
        # Get consensus decision
        consensus_result = consensus_layer.aggregate(agent_signals)
        
        # Calculate network metrics
        network_confidence = calculate_network_confidence(agent_signals)
        consensus_strength_metrics = calculate_consensus_strength(agent_signals)
        
        # Build response
        consensus_response = ConsensusResponse(
            consensus=consensus_result['consensus'],
            confidence=consensus_result['confidence'],
            score=consensus_result['score'],
            agreement=consensus_result['agreement'],
            votes=consensus_result['votes'],
            agent_breakdown=consensus_result['agent_breakdown'],
            agent_signals=[{
                'agent_id': s['agent_id'],
                'signal': s['signal'],
                'confidence': s['confidence'],
                'weight': s['weight'],
                'timestamp': datetime.now()
            } for s in agent_signals]
        )
        
        network_status = NetworkStatus(
            active_agents=len([a for a in agents if a.active]),
            consensus_strength=consensus_strength_metrics['strength'],
            network_confidence=network_confidence,
            last_update=datetime.now()
        )
        
        return MeshRunResponse(
            decision=consensus_response,
            network_status=network_status
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mesh run failed: {str(e)}")

@router.get("/agents")
async def get_active_agents():
    """Get list of active agents"""
    # TODO: Fetch from database
    default_agents = AgentNode.create_default_agents()
    return {
        "agents": [agent.__dict__ for agent in default_agents],
        "count": len(default_agents)
    }

@router.post("/agents/{agent_id}/update")
async def update_agent_reliability(agent_id: str, performance_score: float):
    """Update agent reliability based on performance"""
    try:
        # TODO: Fetch agent from database and update
        return {
            "agent_id": agent_id,
            "performance_score": performance_score,
            "status": "updated"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent update failed: {str(e)}")

@router.get("/network/status")
async def get_network_status():
    """Get current network status"""
    # TODO: Fetch real network metrics
    return {
        "active_agents": 4,
        "total_agents": 4,
        "network_health": 0.85,
        "last_consensus": datetime.now(),
        "uptime": "99.9%"
    }