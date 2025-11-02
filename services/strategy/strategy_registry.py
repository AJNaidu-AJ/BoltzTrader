"""
Strategy Registry - Central store of all strategy modules
"""

from typing import Dict, List, Any
from .strategy_base import BaseStrategy, StrategySignal
from .strategies.momentum_strategy import MomentumStrategy
from .strategies.mean_reversion_strategy import MeanReversionStrategy
from .strategies.breakout_strategy import BreakoutStrategy
from .strategies.sentiment_fusion_strategy import SentimentFusionStrategy
import asyncio
import json
from datetime import datetime

class StrategyRegistry:
    def __init__(self):
        self.strategies: Dict[str, BaseStrategy] = {}
        self.performance_history: Dict[str, List[Dict]] = {}
        self._initialize_strategies()
    
    def _initialize_strategies(self):
        """Initialize all available strategies"""
        strategies = [
            MomentumStrategy(),
            MeanReversionStrategy(),
            BreakoutStrategy(),
            SentimentFusionStrategy()
        ]
        
        for strategy in strategies:
            self.strategies[strategy.strategy_id] = strategy
            self.performance_history[strategy.strategy_id] = []
    
    async def evaluate_all(self, market_data: Dict[str, Any], 
                          indicators: Dict[str, float],
                          sentiment: float,
                          breakouts: List[str]) -> List[StrategySignal]:
        """Evaluate all enabled strategies in parallel"""
        
        tasks = []
        for strategy in self.strategies.values():
            if strategy.enabled:
                task = strategy.evaluate(market_data, indicators, sentiment, breakouts)
                tasks.append(task)
        
        if not tasks:
            return []
            
        signals = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions and return valid signals
        valid_signals = []
        for signal in signals:
            if isinstance(signal, StrategySignal):
                valid_signals.append(signal)
        
        return valid_signals
    
    def get_strategy(self, strategy_id: str) -> BaseStrategy:
        """Get strategy by ID"""
        return self.strategies.get(strategy_id)
    
    def get_enabled_strategies(self) -> List[BaseStrategy]:
        """Get all enabled strategies"""
        return [s for s in self.strategies.values() if s.enabled]
    
    def update_strategy_performance(self, strategy_id: str, trade_result: Dict[str, Any]):
        """Update strategy performance metrics"""
        strategy = self.strategies.get(strategy_id)
        if strategy:
            strategy.update_performance(trade_result)
            
            # Store in history
            self.performance_history[strategy_id].append({
                "timestamp": datetime.now().isoformat(),
                "trade_result": trade_result,
                "metrics": strategy.metrics.dict()
            })
            
            # Keep only last 1000 records
            if len(self.performance_history[strategy_id]) > 1000:
                self.performance_history[strategy_id] = self.performance_history[strategy_id][-1000:]
    
    def get_top_strategies(self, limit: int = 3) -> List[BaseStrategy]:
        """Get top performing strategies by win rate"""
        enabled_strategies = self.get_enabled_strategies()
        
        # Sort by win rate, then by total trades
        sorted_strategies = sorted(
            enabled_strategies,
            key=lambda s: (s.metrics.win_rate, s.metrics.total_trades),
            reverse=True
        )
        
        return sorted_strategies[:limit]
    
    def adjust_strategy_weights(self):
        """Dynamically adjust strategy weights based on performance"""
        strategies = self.get_enabled_strategies()
        
        if not strategies:
            return
        
        # Calculate performance scores
        for strategy in strategies:
            if strategy.metrics.total_trades > 10:
                # Weight based on win rate and Sharpe ratio
                performance_score = (
                    strategy.metrics.win_rate * 0.6 + 
                    min(strategy.metrics.sharpe_ratio / 2, 0.4)
                )
                strategy.weight = max(0.1, min(2.0, performance_score))
            else:
                # Default weight for new strategies
                strategy.weight = 1.0
    
    def get_registry_stats(self) -> Dict[str, Any]:
        """Get overall registry statistics"""
        total_strategies = len(self.strategies)
        enabled_strategies = len(self.get_enabled_strategies())
        
        total_trades = sum(s.metrics.total_trades for s in self.strategies.values())
        avg_win_rate = sum(s.metrics.win_rate for s in self.strategies.values()) / total_strategies if total_strategies > 0 else 0
        
        return {
            "total_strategies": total_strategies,
            "enabled_strategies": enabled_strategies,
            "total_trades": total_trades,
            "avg_win_rate": avg_win_rate,
            "last_updated": datetime.now().isoformat()
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """Export registry to dictionary"""
        return {
            "strategies": {sid: s.to_dict() for sid, s in self.strategies.items()},
            "stats": self.get_registry_stats()
        }

# Global registry instance
strategy_registry = StrategyRegistry()