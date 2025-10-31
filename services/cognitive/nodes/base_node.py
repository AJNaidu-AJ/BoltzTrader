"""
Base Node Class for BoltzTrader Cognitive Network
"""

from abc import ABC, abstractmethod
from typing import Dict, Any
from pydantic import BaseModel
import redis
import json
import logging
import time
from datetime import datetime
import asyncio

class NodeMessage(BaseModel):
    node_id: str
    data: Dict[str, Any]
    timestamp: str
    priority: int = 1

class BaseNode(ABC):
    def __init__(self, node_id: str, redis_host: str = "localhost", redis_port: int = 6379):
        self.node_id = node_id
        self.redis_client = redis.Redis(host=redis_host, port=redis_port, db=0)
        self.logger = logging.getLogger(f"Node-{node_id}")
        
    @abstractmethod
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process incoming data and return results"""
        pass
    
    async def send_message(self, target_node: str, data: Dict[str, Any], priority: int = 1):
        """Send message to another node with retry logic"""
        try:
            message = NodeMessage(
                node_id=self.node_id,
                data=data,
                timestamp=datetime.now().isoformat(),
                priority=priority
            )
            
            channel = f"node:{target_node}"
            
            # Retry logic for Redis failures
            for attempt in range(3):
                try:
                    self.redis_client.publish(channel, message.json())
                    self.logger.info(f"Sent message to {target_node}")
                    break
                except redis.ConnectionError as e:
                    if attempt == 2:
                        raise e
                    await asyncio.sleep(0.1 * (attempt + 1))
                    
        except Exception as e:
            self.logger.error(f"Failed to send message to {target_node}: {e}")
    
    async def listen_for_messages(self, callback):
        """Listen for incoming messages"""
        pubsub = self.redis_client.pubsub()
        pubsub.subscribe(f"node:{self.node_id}")
        
        for message in pubsub.listen():
            if message['type'] == 'message':
                try:
                    node_message = NodeMessage.parse_raw(message['data'])
                    await callback(node_message)
                except Exception as e:
                    self.logger.error(f"Error processing message: {e}")
    
    def get_state(self, key: str) -> Any:
        """Get node state from Redis"""
        data = self.redis_client.get(f"state:{self.node_id}:{key}")
        return json.loads(data) if data else None
    
    def set_state(self, key: str, value: Any):
        """Set node state in Redis"""
        self.redis_client.set(f"state:{self.node_id}:{key}", json.dumps(value))
    
    def log_performance(self, metric: str, value: float):
        """Log performance metrics with error handling"""
        try:
            timestamp = time.time()
            self.redis_client.zadd(f"metrics:{self.node_id}:{metric}", {timestamp: value})
            
            # Keep only last 1000 metrics
            self.redis_client.zremrangebyrank(f"metrics:{self.node_id}:{metric}", 0, -1001)
            
        except Exception as e:
            self.logger.error(f"Failed to log performance metric {metric}: {e}")
    
    async def process_with_monitoring(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process data with performance monitoring"""
        start_time = time.time()
        
        try:
            result = await self.process(data)
            processing_time = time.time() - start_time
            
            self.log_performance("processing_time", processing_time)
            self.log_performance("success_count", 1)
            
            return result
            
        except Exception as e:
            processing_time = time.time() - start_time
            self.log_performance("error_count", 1)
            self.log_performance("processing_time", processing_time)
            
            self.logger.error(f"Node {self.node_id} processing failed: {e}")
            raise e