#!/usr/bin/env python3
"""
Startup script for AI Signal Scoring Microservice
Handles dependency installation and service startup
"""

import subprocess
import sys
import os

def install_dependencies():
    """Install required dependencies"""
    print("Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("[OK] Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[FAIL] Failed to install dependencies: {e}")
        return False

def run_tests():
    """Run simple tests"""
    print("\nRunning tests...")
    try:
        subprocess.check_call([sys.executable, "test_simple.py"])
        print("[OK] Tests passed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[FAIL] Tests failed: {e}")
        return False

def start_service():
    """Start the FastAPI service"""
    print("\nStarting AI Signal Scoring Service...")
    print("Service will be available at: http://localhost:8000")
    print("API docs available at: http://localhost:8000/docs")
    print("Press Ctrl+C to stop the service")
    
    try:
        subprocess.check_call([sys.executable, "main.py"])
    except KeyboardInterrupt:
        print("\n[OK] Service stopped")
    except subprocess.CalledProcessError as e:
        print(f"[FAIL] Service failed to start: {e}")

def main():
    print("=== AI Signal Scoring Microservice ===")
    print("Task 7.1: Ensemble AI Signal Scoring")
    
    # Check if we're in the right directory
    if not os.path.exists("main.py"):
        print("[FAIL] Please run this script from the scoring service directory")
        return
    
    # Option to install dependencies
    install_deps = input("\nInstall dependencies? (y/n): ").lower().strip()
    if install_deps == 'y':
        if not install_dependencies():
            return
    
    # Run tests
    run_test = input("\nRun tests? (y/n): ").lower().strip()
    if run_test == 'y':
        if not run_tests():
            print("Tests failed, but you can still start the service")
    
    # Start service
    start_srv = input("\nStart service? (y/n): ").lower().strip()
    if start_srv == 'y':
        start_service()
    
    print("\n=== Service Information ===")
    print("Endpoints:")
    print("  GET  /health - Health check")
    print("  POST /score  - Generate ensemble signal score")
    print("\nExample request:")
    print('  curl -X POST "http://localhost:8000/score" \\')
    print('       -H "Content-Type: application/json" \\')
    print('       -d \'{"symbol": "AAPL", "timeframe": "1d"}\'')

if __name__ == "__main__":
    main()