"""
Load Balancer for Cognitive Engine Horizontal Scaling
"""

import asyncio
import aiohttp
import random
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class CognitiveLoadBalancer:
    def __init__(self, nodes: List[str]):
        self.nodes = nodes
        self.healthy_nodes = set(nodes)
        self.request_counts = {node: 0 for node in nodes}
        
    async def health_check(self):
        """Check health of all nodes"""
        async with aiohttp.ClientSession() as session:
            for node in self.nodes:
                try:
                    async with session.get(f"{node}/health", timeout=5) as response:
                        if response.status == 200:
                            self.healthy_nodes.add(node)
                        else:
                            self.healthy_nodes.discard(node)
                except Exception:
                    self.healthy_nodes.discard(node)
                    
    def get_next_node(self) -> str:
        """Round-robin load balancing"""
        if not self.healthy_nodes:
            raise Exception("No healthy nodes available")
            
        # Find node with least requests
        available_nodes = list(self.healthy_nodes)
        return min(available_nodes, key=lambda n: self.request_counts[n])
        
    async def process_symbol(self, symbol: str) -> Dict[str, Any]:
        """Process symbol with load balancing"""
        node = self.get_next_node()
        self.request_counts[node] += 1
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{node}/process/{symbol}") as response:
                    return await response.json()
        except Exception as e:
            self.healthy_nodes.discard(node)
            logger.error(f"Node {node} failed: {e}")
            # Retry with another node
            if self.healthy_nodes:
                return await self.process_symbol(symbol)
            raise e

# Global load balancer instance
cognitive_lb = CognitiveLoadBalancer([
    "http://cognitive-1:8002",
    "http://cognitive-2:8002", 
    "http://cognitive-3:8002"
])