"""
Persistent Shared State Layer - RedisJSON + Supabase Cache
"""

import json
import redis
from supabase import create_client
from typing import Dict, Any, Optional
import os

class SharedStateManager:
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=1, decode_responses=True)
        self.supabase = create_client(
            os.getenv("SUPABASE_URL", ""),
            os.getenv("SUPABASE_ANON_KEY", "")
        )
    
    def set_state(self, key: str, data: Dict[str, Any], ttl: int = 3600):
        """Set state in Redis with TTL"""
        try:
            self.redis_client.setex(f"state:{key}", ttl, json.dumps(data))
        except Exception:
            pass
    
    def get_state(self, key: str) -> Optional[Dict[str, Any]]:
        """Get state from Redis"""
        try:
            data = self.redis_client.get(f"state:{key}")
            return json.loads(data) if data else None
        except Exception:
            return None
    
    def persist_to_supabase(self, symbol: str, state_data: Dict[str, Any]):
        """Persist critical state to Supabase"""
        try:
            self.supabase.table("cognitive_states").upsert({
                "symbol": symbol,
                "state_data": state_data,
                "updated_at": "now()"
            }).execute()
        except Exception:
            pass

shared_state = SharedStateManager()