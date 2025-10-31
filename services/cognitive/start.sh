#!/bin/bash

# Start script for BoltzTrader Cognitive Engine

echo "Starting BoltzTrader Cognitive Engine..."

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "Starting Redis..."
    redis-server --daemonize yes
fi

# Start Celery workers in background
echo "Starting Celery workers..."
celery -A cognitive_tasks worker --loglevel=info --concurrency=4 --queues=realtime &
celery -A cognitive_tasks worker --loglevel=info --concurrency=2 --queues=batch &

# Start the FastAPI server
echo "Starting Cognitive Engine API..."
uvicorn cognitive_engine:app --host 0.0.0.0 --port 8002 --workers 2 --log-level info