@echo off
echo Starting Celery Worker...
cd /d "%~dp0"
celery -A celery_app worker --loglevel=info --queues=orders,retries