#!/usr/bin/env python3
"""
Startup script for Backtest Service
"""

import subprocess
import sys
import os
import time

def start_redis():
    """Start Redis server"""
    print("Starting Redis server...")
    try:
        subprocess.Popen(["redis-server", "--daemonize", "yes"])
        time.sleep(2)
        print("✓ Redis started")
        return True
    except FileNotFoundError:
        print("✗ Redis not found. Install Redis or use Docker.")
        return False

def start_celery_worker():
    """Start Celery worker"""
    print("Starting Celery worker...")
    try:
        subprocess.Popen([
            sys.executable, "-m", "celery", 
            "-A", "celery_app", "worker", 
            "--loglevel=info"
        ])
        print("✓ Celery worker started")
        return True
    except Exception as e:
        print(f"✗ Failed to start Celery worker: {e}")
        return False

def start_fastapi():
    """Start FastAPI server"""
    print("Starting FastAPI server...")
    try:
        subprocess.run([sys.executable, "main.py"])
    except KeyboardInterrupt:
        print("\n✓ Server stopped")

def main():
    print("=== Backtest Service Startup ===")
    
    # Check if running with Docker
    if os.getenv("DOCKER_ENV"):
        print("Running in Docker mode")
        start_fastapi()
        return
    
    # Local development mode
    print("Starting in local development mode...")
    
    # Start Redis (optional - can use Docker)
    redis_ok = start_redis()
    if not redis_ok:
        print("Consider using: docker run -d -p 6379:6379 redis:alpine")
    
    # Start Celery worker
    celery_ok = start_celery_worker()
    if not celery_ok:
        print("Celery worker failed to start")
        return
    
    print("\n=== Services Started ===")
    print("FastAPI: http://localhost:8000")
    print("Docs: http://localhost:8000/docs")
    print("Redis: localhost:6379")
    print("\nPress Ctrl+C to stop all services")
    
    # Start FastAPI (blocking)
    start_fastapi()

if __name__ == "__main__":
    main()