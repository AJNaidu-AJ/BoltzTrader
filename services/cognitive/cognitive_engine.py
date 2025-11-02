"""
BoltzTrader Phase 1 - Core Intelligence
LangGraph Node Network - Autonomous Cognitive Architecture
"""

import asyncio
import json
from typing import Dict, Any, List
from datetime import datetime
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
import redis
import os
import logging
import traceback
from typing import Literal
from dotenv import load_dotenv
from shared_state import shared_state

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# State Model
class CognitiveState(BaseModel):
    symbol: str = "AAPL"
    market_data: Dict[str, Any] = {}
    indicators: Dict[str, float] = {}
    sentiment_score: float = 0.0
    breakout_signals: List[str] = []
    strategy_decision: Dict[str, Any] = {}
    execution_result: Dict[str, Any] = {}
    monitor_feedback: Dict[str, Any] = {}
    timestamp: str = ""
    confidence_threshold: float = 0.6
    risk_tolerance: str = "MEDIUM"
    learning_feedback: Dict[str, Any] = {}
    node_errors: List[str] = []

class CognitiveEngine:
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1)
        self.graph = self._build_cognitive_graph()
        
    def _build_cognitive_graph(self) -> StateGraph:
        """Build the LangGraph cognitive network with conditional edges"""
        workflow = StateGraph(CognitiveState)
        
        # Add nodes
        workflow.add_node("data_node", self.data_node)
        workflow.add_node("indicator_node", self.indicator_node)
        workflow.add_node("sentiment_node", self.sentiment_node)
        workflow.add_node("breakout_node", self.breakout_node)
        workflow.add_node("strategy_node", self.strategy_node)
        workflow.add_node("execution_node", self.execution_node)
        workflow.add_node("monitor_node", self.monitor_node)
        workflow.add_node("adaptive_node", self.adaptive_node)
        workflow.add_node("error_handler", self.error_handler)
        
        # Define conditional routing
        workflow.set_entry_point("data_node")
        workflow.add_edge("data_node", "indicator_node")
        workflow.add_edge("data_node", "sentiment_node")
        workflow.add_edge("indicator_node", "breakout_node")
        workflow.add_edge("sentiment_node", "breakout_node")
        
        # Conditional edge based on confidence
        workflow.add_conditional_edges(
            "strategy_node",
            self.should_execute,
            {
                "execute": "execution_node",
                "skip": "monitor_node",
                "error": "error_handler"
            }
        )
        
        workflow.add_edge("breakout_node", "strategy_node")
        workflow.add_edge("execution_node", "monitor_node")
        
        # Feedback loop: Monitor → Strategy for reinforcement learning
        workflow.add_conditional_edges(
            "monitor_node",
            self.should_feedback,
            {"feedback": "strategy_node", "continue": "adaptive_node"}
        )
        
        workflow.add_edge("adaptive_node", END)
        workflow.add_edge("error_handler", "adaptive_node")
        
        return workflow.compile()
    
    async def data_node(self, state: CognitiveState) -> CognitiveState:
        """Market Data Collector Node with error handling"""
        try:
            # Simulate live market data with validation
            market_data = {
                "price": 150.25,
                "volume": 1000000,
                "high": 152.00,
                "low": 149.50,
                "change": 1.25,
                "change_pct": 0.84
            }
            
            # Validate data
            if market_data["price"] <= 0 or market_data["volume"] < 0:
                raise ValueError("Invalid market data")
            
            state.market_data = market_data
            state.timestamp = datetime.now().isoformat()
            
            # Publish to Redis with error handling
            try:
                self.redis_client.publish(f"market_data:{state.symbol}", json.dumps(market_data))
            except Exception as e:
                logger.warning(f"Redis publish failed: {e}")
            
            logger.info(f"Data node processed {state.symbol}")
            return state
            
        except Exception as e:
            logger.error(f"Data node error: {e}")
            state.node_errors.append(f"data_node: {str(e)}")
            return state
    
    async def indicator_node(self, state: CognitiveState) -> CognitiveState:
        """Technical Processor Node"""
        price = state.market_data.get("price", 150)
        
        # Calculate technical indicators
        indicators = {
            "rsi": min(max(50 + (price - 150) * 2, 0), 100),
            "macd": (price - 150) * 0.1,
            "ema_20": price * 0.98,
            "bollinger_upper": price * 1.02,
            "bollinger_lower": price * 0.98,
            "volatility": abs(state.market_data.get("change_pct", 0)) * 10
        }
        
        state.indicators = indicators
        
        # Publish indicators
        self.redis_client.publish(f"indicators:{state.symbol}", json.dumps(indicators))
        
        return state
    
    async def sentiment_node(self, state: CognitiveState) -> CognitiveState:
        """Context & Emotion Analyzer Node"""
        # Simulate sentiment analysis
        change_pct = state.market_data.get("change_pct", 0)
        volume = state.market_data.get("volume", 0)
        
        # Simple sentiment scoring
        sentiment_score = 0.0
        if change_pct > 1.0:
            sentiment_score = 0.8  # Bullish
        elif change_pct < -1.0:
            sentiment_score = -0.8  # Bearish
        else:
            sentiment_score = change_pct * 0.5  # Neutral
            
        # Volume confirmation
        if volume > 500000:
            sentiment_score *= 1.2
            
        state.sentiment_score = max(min(sentiment_score, 1.0), -1.0)
        
        # Publish sentiment
        self.redis_client.publish(f"sentiment:{state.symbol}", str(sentiment_score))
        
        return state
    
    async def breakout_node(self, state: CognitiveState) -> CognitiveState:
        """Pattern Recognition Engine Node"""
        price = state.market_data.get("price", 150)
        rsi = state.indicators.get("rsi", 50)
        volatility = state.indicators.get("volatility", 5)
        
        breakout_signals = []
        
        # Breakout detection logic
        if rsi > 70 and volatility > 8:
            breakout_signals.append("OVERBOUGHT_BREAKOUT")
        elif rsi < 30 and volatility > 8:
            breakout_signals.append("OVERSOLD_REVERSAL")
        elif 40 < rsi < 60 and volatility < 3:
            breakout_signals.append("CONSOLIDATION")
        elif volatility > 10:
            breakout_signals.append("HIGH_VOLATILITY")
            
        state.breakout_signals = breakout_signals
        
        # Publish breakout signals
        self.redis_client.publish(f"breakouts:{state.symbol}", json.dumps(breakout_signals))
        
        return state
    
    async def strategy_node(self, state: CognitiveState) -> CognitiveState:
        """Decision & Synthesis Core Node - Now uses Strategy Library"""
        try:
            # Call Strategy Engine API
            import aiohttp
            strategy_request = {
                "symbol": state.symbol,
                "market_data": state.market_data,
                "indicators": state.indicators,
                "sentiment": state.sentiment_score,
                "breakouts": state.breakout_signals,
                "fusion_method": "weighted_average"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "http://localhost:8003/evaluate",
                    json=strategy_request
                ) as response:
                    if response.status == 200:
                        strategy_response = await response.json()
                        fused_signal = strategy_response["fused_signal"]
                        
                        strategy_decision = {
                            "action": fused_signal["action"],
                            "confidence": fused_signal["confidence"],
                            "reasoning": fused_signal["reasoning"],
                            "risk_level": fused_signal["risk_level"],
                            "target_price": fused_signal.get("target_price"),
                            "stop_loss": fused_signal.get("stop_loss"),
                            "strategy_count": len(strategy_response["individual_signals"])
                        }
                    else:
                        raise Exception(f"Strategy API error: {response.status}")
                        
        except Exception as e:
            logger.warning(f"Strategy Library unavailable, using fallback: {e}")
            # Fallback to simple logic
            rsi = state.indicators.get("rsi", 50)
            sentiment = state.sentiment_score
            
            if rsi > 70 and sentiment > 0.3:
                strategy_decision = {
                    "action": "SELL", "confidence": 0.6, 
                    "reasoning": ["Fallback: Overbought + positive sentiment"], 
                    "risk_level": "MEDIUM"
                }
            elif rsi < 30 and sentiment < -0.3:
                strategy_decision = {
                    "action": "BUY", "confidence": 0.6,
                    "reasoning": ["Fallback: Oversold + negative sentiment"],
                    "risk_level": "MEDIUM"
                }
            else:
                strategy_decision = {
                    "action": "HOLD", "confidence": 0.5,
                    "reasoning": ["Fallback: No clear signal"],
                    "risk_level": "MEDIUM"
                }
        
        state.strategy_decision = strategy_decision
        
        # Publish strategy
        try:
            self.redis_client.publish(f"strategy:{state.symbol}", json.dumps(strategy_decision))
        except Exception as e:
            sentry_sdk.capture_exception(e)
        
        return state
    
    async def execution_node(self, state: CognitiveState) -> CognitiveState:
        """Trade Placement & Routing Node - Now with Risk Firewall"""
        strategy = state.strategy_decision
        
        execution_result = {
            "order_id": f"ORD_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "status": "PENDING",
            "action": strategy.get("action", "HOLD"),
            "quantity": 0,
            "price": state.market_data.get("price", 0),
            "timestamp": datetime.now().isoformat(),
            "risk_assessment": None
        }
        
        # Only proceed if we have a valid trading signal
        if strategy.get("confidence", 0) > 0.6 and strategy.get("action") != "HOLD":
            try:
                # Call Risk Engine for pre-trade evaluation
                import aiohttp
                
                risk_request = {
                    "trade_request": {
                        "symbol": state.symbol,
                        "action": strategy["action"],
                        "quantity": 100,  # Base quantity
                        "price": state.market_data.get("price", 0),
                        "strategy_id": strategy.get("strategy_id", "unknown"),
                        "confidence": strategy["confidence"],
                        "risk_level": strategy.get("risk_level", "MEDIUM")
                    },
                    "portfolio_state": {
                        "total_value": 100000.0,  # Mock portfolio
                        "cash_available": 50000.0,
                        "positions": {},
                        "daily_pnl": 0.0,
                        "max_drawdown": 0.05,
                        "volatility": 0.15
                    },
                    "market_data": {
                        "vix": 20.0,
                        "sector": "Technology",
                        "volatility": state.indicators.get("volatility", 20)
                    }
                }
                
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        "http://localhost:8004/evaluate",
                        json=risk_request
                    ) as response:
                        if response.status == 200:
                            risk_response = await response.json()
                            risk_assessment = risk_response["assessment"]
                            
                            # Apply risk firewall decision
                            if risk_assessment["action"] == "ALLOW":
                                final_quantity = risk_assessment.get("adjustments", {}).get("quantity", 100)
                                execution_result.update({
                                    "status": "EXECUTED",
                                    "quantity": final_quantity,
                                    "risk_assessment": risk_assessment
                                })
                            elif risk_assessment["action"] == "RESIZE":
                                final_quantity = risk_assessment["adjustments"]["quantity"]
                                execution_result.update({
                                    "status": "EXECUTED",
                                    "quantity": final_quantity,
                                    "risk_assessment": risk_assessment
                                })
                            elif risk_assessment["action"] == "DELAY":
                                execution_result.update({
                                    "status": "DELAYED",
                                    "quantity": 0,
                                    "risk_assessment": risk_assessment,
                                    "delay_reason": risk_assessment["reasoning"]
                                })
                            else:  # BLOCK
                                execution_result.update({
                                    "status": "BLOCKED",
                                    "quantity": 0,
                                    "risk_assessment": risk_assessment,
                                    "block_reason": risk_assessment["reasoning"]
                                })
                        else:
                            raise Exception(f"Risk API error: {response.status}")
                            
            except Exception as e:
                logger.warning(f"Risk Engine unavailable, using fallback: {e}")
                # Fallback execution without risk checks
                execution_result.update({
                    "status": "EXECUTED",
                    "quantity": 50,  # Conservative fallback quantity
                    "risk_assessment": {"action": "FALLBACK", "reasoning": ["Risk engine unavailable"]}
                })
        else:
            execution_result["status"] = "SKIPPED"
            
        state.execution_result = execution_result
        
        # Publish execution
        try:
            self.redis_client.publish(f"execution:{state.symbol}", json.dumps(execution_result))
        except Exception as e:
            sentry_sdk.capture_exception(e)
        
        return state
    
    async def monitor_node(self, state: CognitiveState) -> CognitiveState:
        """Feedback & Supervision Layer Node"""
        execution = state.execution_result
        
        monitor_feedback = {
            "performance_score": 0.0,
            "risk_assessment": "NORMAL",
            "adjustments": [],
            "next_action": "CONTINUE"
        }
        
        # Performance monitoring
        if execution.get("status") == "EXECUTED":
            # Simulate performance tracking
            confidence = state.strategy_decision.get("confidence", 0.5)
            monitor_feedback.update({
                "performance_score": confidence * 0.8,
                "risk_assessment": "ACCEPTABLE" if confidence > 0.7 else "REVIEW",
                "adjustments": ["Increase confidence threshold"] if confidence < 0.7 else []
            })
        
        # Add reinforcement learning
        historical = shared_state.get_state(f"performance:{state.symbol}") or {"wins": 0, "losses": 0}
        
        if execution.get("status") == "EXECUTED":
            confidence = state.strategy_decision.get("confidence", 0.5)
            trade_success = confidence > 0.7
            
            if trade_success:
                historical["wins"] += 1
                monitor_feedback["reinforcement_signal"] = 0.1
            else:
                historical["losses"] += 1
                monitor_feedback["reinforcement_signal"] = -0.1
            
            win_rate = historical["wins"] / max(historical["wins"] + historical["losses"], 1)
            monitor_feedback["performance_score"] = win_rate
            
            shared_state.set_state(f"performance:{state.symbol}", historical)
        
        state.monitor_feedback = monitor_feedback
        
        # Publish monitoring
        self.redis_client.publish(f"monitor:{state.symbol}", json.dumps(monitor_feedback))
        
        return state
    
    def should_feedback(self, state: CognitiveState) -> str:
        """Determine if feedback loop should trigger"""
        performance = state.monitor_feedback.get("performance_score", 0.5)
        return "feedback" if performance < 0.4 else "continue"
    
    def should_execute(self, state: CognitiveState) -> Literal["execute", "skip", "error"]:
        """Conditional routing based on strategy confidence"""
        if state.node_errors:
            return "error"
        
        confidence = state.strategy_decision.get("confidence", 0)
        if confidence >= state.confidence_threshold:
            return "execute"
        return "skip"
    
    async def adaptive_node(self, state: CognitiveState) -> CognitiveState:
        """Adaptive Learning Node - adjusts thresholds based on performance"""
        try:
            performance = state.monitor_feedback.get("performance_score", 0.5)
            
            # Adaptive threshold adjustment
            if performance > 0.8:
                state.confidence_threshold = max(0.5, state.confidence_threshold - 0.05)
            elif performance < 0.4:
                state.confidence_threshold = min(0.9, state.confidence_threshold + 0.05)
            
            # Store learning feedback
            state.learning_feedback = {
                "threshold_adjusted": state.confidence_threshold,
                "performance_trend": "improving" if performance > 0.6 else "declining",
                "adaptation_timestamp": datetime.now().isoformat()
            }
            
            # Persist learning state
            self.redis_client.set(
                f"learning:{state.symbol}", 
                json.dumps(state.learning_feedback)
            )
            
            logger.info(f"Adaptive learning applied for {state.symbol}")
            return state
            
        except Exception as e:
            logger.error(f"Adaptive node error: {e}")
            return state
    
    async def error_handler(self, state: CognitiveState) -> CognitiveState:
        """Error Handler Node for graceful failure recovery"""
        try:
            logger.error(f"Processing errors for {state.symbol}: {state.node_errors}")
            
            # Reset to safe defaults
            state.strategy_decision = {
                "action": "HOLD",
                "confidence": 0.0,
                "reasoning": ["Error recovery mode"],
                "risk_level": "HIGH"
            }
            
            # Log error metrics
            error_count = len(state.node_errors)
            self.redis_client.incr(f"errors:{state.symbol}:count")
            self.redis_client.set(f"errors:{state.symbol}:last", json.dumps(state.node_errors))
            
            return state
            
        except Exception as e:
            logger.critical(f"Error handler failed: {e}")
            return state
    
    async def process_symbol(self, symbol: str) -> Dict[str, Any]:
        """Process a single symbol through the cognitive network"""
        initial_state = CognitiveState(symbol=symbol)
        
        # Run through the cognitive graph
        result = await self.graph.ainvoke(initial_state)
        
        return {
            "symbol": symbol,
            "timestamp": result.timestamp,
            "market_data": result.market_data,
            "indicators": result.indicators,
            "sentiment_score": result.sentiment_score,
            "breakout_signals": result.breakout_signals,
            "strategy_decision": result.strategy_decision,
            "execution_result": result.execution_result,
            "monitor_feedback": result.monitor_feedback,
            "learning_feedback": result.learning_feedback,
            "node_errors": result.node_errors,
            "confidence_threshold": result.confidence_threshold
        }

# FastAPI Integration
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from fastapi.responses import Response
import time

# Prometheus metrics
REQUEST_COUNT = Counter('cognitive_requests_total', 'Total requests', ['symbol', 'status'])
PROCESSING_TIME = Histogram('cognitive_processing_seconds', 'Processing time', ['symbol'])
ACTIVE_NODES = Gauge('cognitive_active_nodes', 'Active nodes', ['node_type'])
ERROR_COUNT = Counter('cognitive_errors_total', 'Total errors', ['node', 'error_type'])

app = FastAPI(title="BoltzTrader Cognitive Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cognitive_engine = CognitiveEngine()

@app.post("/process/{symbol}")
async def process_symbol(symbol: str):
    """Process a symbol through the cognitive network with metrics"""
    start_time = time.time()
    
    try:
        result = await cognitive_engine.process_symbol(symbol)
        
        # Record metrics
        REQUEST_COUNT.labels(symbol=symbol, status='success').inc()
        PROCESSING_TIME.labels(symbol=symbol).observe(time.time() - start_time)
        
        return result
        
    except Exception as e:
        REQUEST_COUNT.labels(symbol=symbol, status='error').inc()
        ERROR_COUNT.labels(node='api', error_type=type(e).__name__).inc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    try:
        # Test Redis connection
        cognitive_engine.redis_client.ping()
        return {"status": "healthy", "service": "cognitive_engine", "redis": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "service": "cognitive_engine", "error": str(e)}

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type="text/plain")

@app.post("/batch/{symbols}")
async def process_batch(symbols: str):
    """Process multiple symbols (comma-separated)"""
    symbol_list = [s.strip() for s in symbols.split(',')]
    results = []
    
    for symbol in symbol_list:
        try:
            result = await cognitive_engine.process_symbol(symbol)
            results.append(result)
        except Exception as e:
            results.append({"symbol": symbol, "error": str(e)})
    
    return {"results": results, "processed": len(results)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8002,
        log_level="info",
        access_log=True
    )