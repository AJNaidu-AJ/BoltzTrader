"""
Celery tasks for distributed cognitive processing
"""

from celery import Celery
import os
import asyncio
from cognitive_engine import CognitiveEngine

# Initialize Celery
redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
celery_app = Celery('cognitive_tasks', broker=redis_url, backend=redis_url)

# Configure Celery
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_routes={
        'cognitive_tasks.process_symbol_batch': {'queue': 'batch'},
        'cognitive_tasks.process_symbol_realtime': {'queue': 'realtime'},
    }
)

cognitive_engine = CognitiveEngine()

@celery_app.task(bind=True, max_retries=3)
def process_symbol_realtime(self, symbol: str):
    """Process single symbol in real-time queue"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(cognitive_engine.process_symbol(symbol))
        loop.close()
        return result
    except Exception as e:
        self.retry(countdown=60, exc=e)

@celery_app.task(bind=True)
def process_symbol_batch(self, symbols: list):
    """Process multiple symbols in batch"""
    results = []
    for symbol in symbols:
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(cognitive_engine.process_symbol(symbol))
            results.append(result)
            loop.close()
        except Exception as e:
            results.append({"symbol": symbol, "error": str(e)})
    return results

@celery_app.task
def health_check():
    """Health check task"""
    return {"status": "healthy", "service": "cognitive_worker"}