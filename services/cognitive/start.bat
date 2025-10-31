@echo off
echo Starting BoltzTrader Cognitive Engine...

REM Check if Redis is running
redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo Starting Redis...
    start /B redis-server
    timeout /t 3 >nul
)

REM Start Celery workers
echo Starting Celery workers...
start /B celery -A cognitive_tasks worker --loglevel=info --concurrency=4 --queues=realtime
start /B celery -A cognitive_tasks worker --loglevel=info --concurrency=2 --queues=batch

REM Start the FastAPI server
echo Starting Cognitive Engine API...
uvicorn cognitive_engine:app --host 0.0.0.0 --port 8002 --workers 2 --log-level info