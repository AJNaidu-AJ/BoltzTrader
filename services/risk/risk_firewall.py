"""
Risk Firewall - Central risk evaluation engine
"""

from typing import List, Dict, Any, Optional
from .risk_base import BaseRiskPolicy, RiskAssessment, TradeRequest, PortfolioState, PolicyAction, RiskLevel
from .policies.exposure_policy import ExposureControlPolicy
from .policies.volatility_policy import VolatilityGatePolicy
from .policies.drawdown_policy import DrawdownControllerPolicy
from .policies.reputation_policy import ReputationPolicy
import asyncio
from datetime import datetime

class RiskFirewall:
    def __init__(self):
        self.policies: List[BaseRiskPolicy] = []
        self.policy_logs: List[Dict[str, Any]] = []
        self._initialize_policies()
        
    def _initialize_policies(self):
        """Initialize all risk policies"""
        self.policies = [
            DrawdownControllerPolicy(),    # Highest priority
            ExposureControlPolicy(),
            VolatilityGatePolicy(),
            ReputationPolicy()
        ]
        
        # Sort by priority (lower number = higher priority)
        self.policies.sort(key=lambda p: p.priority)
    
    async def evaluate_trade(self, trade_request: TradeRequest,
                           portfolio_state: PortfolioState,
                           market_data: Dict[str, Any]) -> RiskAssessment:
        """Evaluate trade request through all risk policies"""
        
        assessments = []
        final_assessment = None
        
        # Run all enabled policies
        for policy in self.policies:
            if not policy.enabled:
                continue
                
            try:
                assessment = await policy.evaluate(trade_request, portfolio_state, market_data)
                assessments.append({
                    "policy_id": policy.policy_id,
                    "assessment": assessment
                })
                
                # If any policy blocks the trade, stop evaluation
                if assessment.action == PolicyAction.BLOCK:
                    final_assessment = assessment
                    final_assessment.reasoning.insert(0, f"Blocked by {policy.name}")
                    break
                    
            except Exception as e:
                # Log policy error but continue
                self._log_policy_error(policy.policy_id, str(e))
        
        # If no blocking policy, combine assessments
        if not final_assessment:
            final_assessment = self._combine_assessments(assessments, trade_request)
        
        # Log the decision
        self._log_decision(trade_request, final_assessment, assessments)
        
        return final_assessment
    
    def _combine_assessments(self, assessments: List[Dict], 
                           original_request: TradeRequest) -> RiskAssessment:
        """Combine multiple policy assessments into final decision"""
        
        if not assessments:
            return RiskAssessment(
                risk_level=RiskLevel.MEDIUM,
                action=PolicyAction.ALLOW,
                confidence=0.5,
                reasoning=["No policies evaluated"]
            )
        
        # Collect all adjustments
        final_quantity = original_request.quantity
        all_reasoning = []
        max_risk_level = RiskLevel.LOW
        min_confidence = 1.0
        has_resize = False
        has_delay = False
        delay_minutes = 0
        
        for item in assessments:
            assessment = item["assessment"]
            policy_id = item["policy_id"]
            
            # Track highest risk level
            if assessment.risk_level == RiskLevel.CRITICAL:
                max_risk_level = RiskLevel.CRITICAL
            elif assessment.risk_level == RiskLevel.HIGH and max_risk_level != RiskLevel.CRITICAL:
                max_risk_level = RiskLevel.HIGH
            elif assessment.risk_level == RiskLevel.MEDIUM and max_risk_level == RiskLevel.LOW:
                max_risk_level = RiskLevel.MEDIUM
            
            # Track minimum confidence
            min_confidence = min(min_confidence, assessment.confidence)
            
            # Apply quantity adjustments
            if assessment.action == PolicyAction.RESIZE and "quantity" in assessment.adjustments:
                new_quantity = assessment.adjustments["quantity"]
                if new_quantity < final_quantity:
                    final_quantity = new_quantity
                    has_resize = True
            
            # Apply delays
            if assessment.action == PolicyAction.DELAY and "delay_minutes" in assessment.adjustments:
                delay_minutes = max(delay_minutes, assessment.adjustments["delay_minutes"])
                has_delay = True
            
            # Collect reasoning
            all_reasoning.extend([f"{policy_id}: {reason}" for reason in assessment.reasoning])
        
        # Determine final action
        if has_delay:
            final_action = PolicyAction.DELAY
        elif has_resize:
            final_action = PolicyAction.RESIZE
        else:
            final_action = PolicyAction.ALLOW
        
        # Build final adjustments
        final_adjustments = {}
        if final_quantity != original_request.quantity:
            final_adjustments["quantity"] = final_quantity
        if delay_minutes > 0:
            final_adjustments["delay_minutes"] = delay_minutes
        
        return RiskAssessment(
            risk_level=max_risk_level,
            action=final_action,
            confidence=min_confidence,
            reasoning=all_reasoning[:5],  # Limit to top 5 reasons
            adjustments=final_adjustments
        )
    
    def _log_decision(self, trade_request: TradeRequest, 
                     final_assessment: RiskAssessment,
                     policy_assessments: List[Dict]):
        """Log risk decision for audit trail"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "trade_request": trade_request.dict(),
            "final_decision": final_assessment.dict(),
            "policy_evaluations": policy_assessments,
            "policies_triggered": [
                p.policy_id for p in self.policies 
                if p.last_triggered and p.trigger_count > 0
            ]
        }
        
        self.policy_logs.append(log_entry)
        
        # Keep only last 1000 logs
        if len(self.policy_logs) > 1000:
            self.policy_logs = self.policy_logs[-1000:]
    
    def _log_policy_error(self, policy_id: str, error: str):
        """Log policy evaluation error"""
        error_log = {
            "timestamp": datetime.now().isoformat(),
            "policy_id": policy_id,
            "error": error,
            "type": "policy_error"
        }
        self.policy_logs.append(error_log)
    
    def get_policy_stats(self) -> Dict[str, Any]:
        """Get risk firewall statistics"""
        return {
            "total_policies": len(self.policies),
            "enabled_policies": len([p for p in self.policies if p.enabled]),
            "total_evaluations": len(self.policy_logs),
            "policy_triggers": {
                p.policy_id: p.trigger_count for p in self.policies
            },
            "last_updated": datetime.now().isoformat()
        }
    
    def get_policy(self, policy_id: str) -> Optional[BaseRiskPolicy]:
        """Get specific policy by ID"""
        return next((p for p in self.policies if p.policy_id == policy_id), None)
    
    def update_policy_reputation(self, strategy_id: str, trade_outcome: Dict[str, Any]):
        """Update strategy reputation based on trade outcome"""
        reputation_policy = self.get_policy("reputation_logic_v1")
        if reputation_policy and isinstance(reputation_policy, ReputationPolicy):
            reputation_policy.update_reputation(strategy_id, trade_outcome)
    
    def to_dict(self) -> Dict[str, Any]:
        """Export firewall state to dictionary"""
        return {
            "policies": [p.to_dict() for p in self.policies],
            "stats": self.get_policy_stats(),
            "recent_logs": self.policy_logs[-10:]  # Last 10 decisions
        }

# Global firewall instance
risk_firewall = RiskFirewall()