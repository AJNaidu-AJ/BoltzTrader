"""
Strategy Fusion Engine - Combines multiple strategy outputs
"""

from typing import List, Dict, Any, Optional
from .strategy_base import StrategySignal
from .strategy_registry import strategy_registry
import numpy as np
from datetime import datetime

class StrategyFusionEngine:
    def __init__(self):
        self.fusion_methods = {
            "weighted_average": self._weighted_average_fusion,
            "bayesian_voting": self._bayesian_voting_fusion,
            "confidence_threshold": self._confidence_threshold_fusion
        }
        self.default_method = "weighted_average"
    
    async def fuse_signals(self, signals: List[StrategySignal], 
                          method: str = None) -> Optional[StrategySignal]:
        """Fuse multiple strategy signals into one optimal signal"""
        
        if not signals:
            return None
        
        # Filter out HOLD signals for fusion
        active_signals = [s for s in signals if s.action != "HOLD"]
        
        if not active_signals:
            return self._create_hold_signal()
        
        if len(active_signals) == 1:
            return active_signals[0]
        
        fusion_method = method or self.default_method
        fusion_func = self.fusion_methods.get(fusion_method, self._weighted_average_fusion)
        
        return fusion_func(active_signals)
    
    def _weighted_average_fusion(self, signals: List[StrategySignal]) -> StrategySignal:
        """Weighted average fusion based on confidence and strategy weights"""
        
        buy_signals = [s for s in signals if s.action == "BUY"]
        sell_signals = [s for s in signals if s.action == "SELL"]
        
        # Calculate weighted scores
        buy_score = self._calculate_weighted_score(buy_signals)
        sell_score = self._calculate_weighted_score(sell_signals)
        
        # Determine final action
        if buy_score > sell_score and buy_score > 0.5:
            action = "BUY"
            confidence = min(0.95, buy_score)
            reasoning = self._merge_reasoning(buy_signals)
            risk_level = self._determine_risk_level(buy_signals)
            target_price = np.mean([s.target_price for s in buy_signals if s.target_price])
            stop_loss = np.mean([s.stop_loss for s in buy_signals if s.stop_loss])
        elif sell_score > buy_score and sell_score > 0.5:
            action = "SELL"
            confidence = min(0.95, sell_score)
            reasoning = self._merge_reasoning(sell_signals)
            risk_level = self._determine_risk_level(sell_signals)
            target_price = np.mean([s.target_price for s in sell_signals if s.target_price])
            stop_loss = np.mean([s.stop_loss for s in sell_signals if s.stop_loss])
        else:
            return self._create_hold_signal()
        
        return StrategySignal(
            strategy_id="fusion_engine",
            action=action,
            confidence=confidence,
            reasoning=reasoning,
            risk_level=risk_level,
            target_price=target_price,
            stop_loss=stop_loss
        )
    
    def _bayesian_voting_fusion(self, signals: List[StrategySignal]) -> StrategySignal:
        """Bayesian voting fusion considering strategy historical performance"""
        
        buy_votes = []
        sell_votes = []
        
        for signal in signals:
            strategy = strategy_registry.get_strategy(signal.strategy_id)
            if not strategy:
                continue
                
            # Weight by historical win rate
            weight = strategy.metrics.win_rate if strategy.metrics.total_trades > 5 else 0.5
            vote_strength = signal.confidence * weight
            
            if signal.action == "BUY":
                buy_votes.append(vote_strength)
            elif signal.action == "SELL":
                sell_votes.append(vote_strength)
        
        buy_total = sum(buy_votes)
        sell_total = sum(sell_votes)
        total_votes = buy_total + sell_total
        
        if total_votes == 0:
            return self._create_hold_signal()
        
        # Bayesian probability
        buy_prob = buy_total / total_votes
        sell_prob = sell_total / total_votes
        
        if buy_prob > 0.6:
            action = "BUY"
            confidence = min(0.95, buy_prob)
            relevant_signals = [s for s in signals if s.action == "BUY"]
        elif sell_prob > 0.6:
            action = "SELL"
            confidence = min(0.95, sell_prob)
            relevant_signals = [s for s in signals if s.action == "SELL"]
        else:
            return self._create_hold_signal()
        
        return StrategySignal(
            strategy_id="bayesian_fusion",
            action=action,
            confidence=confidence,
            reasoning=self._merge_reasoning(relevant_signals),
            risk_level=self._determine_risk_level(relevant_signals),
            target_price=np.mean([s.target_price for s in relevant_signals if s.target_price]),
            stop_loss=np.mean([s.stop_loss for s in relevant_signals if s.stop_loss])
        )
    
    def _confidence_threshold_fusion(self, signals: List[StrategySignal]) -> StrategySignal:
        """Select highest confidence signal above threshold"""
        
        # Filter signals above confidence threshold
        high_confidence_signals = [s for s in signals if s.confidence > 0.7]
        
        if not high_confidence_signals:
            return self._create_hold_signal()
        
        # Return highest confidence signal
        best_signal = max(high_confidence_signals, key=lambda s: s.confidence)
        
        # Enhance reasoning with fusion info
        best_signal.reasoning.append(f"Selected from {len(signals)} strategies")
        best_signal.strategy_id = "confidence_fusion"
        
        return best_signal
    
    def _calculate_weighted_score(self, signals: List[StrategySignal]) -> float:
        """Calculate weighted score for signals"""
        if not signals:
            return 0.0
        
        total_weight = 0.0
        weighted_sum = 0.0
        
        for signal in signals:
            strategy = strategy_registry.get_strategy(signal.strategy_id)
            weight = strategy.weight if strategy else 1.0
            
            weighted_sum += signal.confidence * weight
            total_weight += weight
        
        return weighted_sum / total_weight if total_weight > 0 else 0.0
    
    def _merge_reasoning(self, signals: List[StrategySignal]) -> List[str]:
        """Merge reasoning from multiple signals"""
        all_reasoning = []
        strategy_names = []
        
        for signal in signals:
            strategy = strategy_registry.get_strategy(signal.strategy_id)
            if strategy:
                strategy_names.append(strategy.name)
            all_reasoning.extend(signal.reasoning)
        
        # Add fusion summary
        fusion_summary = f"Consensus from {len(signals)} strategies: {', '.join(strategy_names)}"
        return [fusion_summary] + list(set(all_reasoning))[:5]  # Limit to 5 unique reasons
    
    def _determine_risk_level(self, signals: List[StrategySignal]) -> str:
        """Determine overall risk level from signals"""
        risk_levels = [s.risk_level for s in signals]
        
        if "HIGH" in risk_levels:
            return "HIGH"
        elif "MEDIUM" in risk_levels:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _create_hold_signal(self) -> StrategySignal:
        """Create a default HOLD signal"""
        return StrategySignal(
            strategy_id="fusion_engine",
            action="HOLD",
            confidence=0.5,
            reasoning=["No clear consensus from strategies"],
            risk_level="MEDIUM"
        )
    
    def get_fusion_stats(self) -> Dict[str, Any]:
        """Get fusion engine statistics"""
        return {
            "available_methods": list(self.fusion_methods.keys()),
            "default_method": self.default_method,
            "last_updated": datetime.now().isoformat()
        }

# Global fusion engine instance
fusion_engine = StrategyFusionEngine()