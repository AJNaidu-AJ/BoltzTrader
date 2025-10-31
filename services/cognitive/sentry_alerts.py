"""
Sentry Alerts + Dead Letter Queue (DLQ) Retry System
"""

import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.redis import RedisIntegration
import os
from celery import Celery
import json
import time

# Initialize Sentry
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[CeleryIntegration(), RedisIntegration()],
    traces_sample_rate=0.1,
    profiles_sample_rate=0.1,
)

# DLQ Redis client
import redis
dlq_redis = redis.Redis(host='localhost', port=6379, db=2)

class DLQManager:
    @staticmethod
    def send_to_dlq(task_name: str, args: list, kwargs: dict, error: str):
        """Send failed task to Dead Letter Queue"""
        dlq_item = {
            "task": task_name,
            "args": args,
            "kwargs": kwargs,
            "error": error,
            "timestamp": time.time(),
            "retry_count": 0
        }
        
        dlq_redis.lpush("dlq:cognitive_tasks", json.dumps(dlq_item))
        
        # Alert via Sentry
        sentry_sdk.capture_message(
            f"Task {task_name} sent to DLQ: {error}",
            level="error",
            extra={"task_args": args, "task_kwargs": kwargs}
        )
    
    @staticmethod
    def retry_dlq_tasks():
        """Retry tasks from DLQ with exponential backoff"""
        while True:
            item_data = dlq_redis.brpop("dlq:cognitive_tasks", timeout=1)
            if not item_data:
                continue
                
            try:
                item = json.loads(item_data[1])
                
                # Exponential backoff
                if item["retry_count"] < 3:
                    wait_time = 2 ** item["retry_count"]
                    time.sleep(wait_time)
                    
                    # Retry the task
                    from cognitive_tasks import celery_app
                    celery_app.send_task(
                        item["task"],
                        args=item["args"],
                        kwargs=item["kwargs"]
                    )
                    
                    item["retry_count"] += 1
                    dlq_redis.lpush("dlq:cognitive_tasks", json.dumps(item))
                else:
                    # Max retries reached - permanent failure
                    sentry_sdk.capture_message(
                        f"Task {item['task']} permanently failed after 3 retries",
                        level="critical"
                    )
                    
            except Exception as e:
                sentry_sdk.capture_exception(e)