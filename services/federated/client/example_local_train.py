"""
Example Federated Client Script
Runs on a broker/edge node or developer machine.

Simulates:
  1️⃣ Pull latest global model from aggregator
  2️⃣ Local fine-tuning on private data
  3️⃣ Delta computation
  4️⃣ Encryption + upload of update
"""

import os
import numpy as np
from client_runtime import FederatedClient

# Configuration
AGGREGATOR_URL = os.getenv("AGGREGATOR_URL", "http://localhost:8010")
MODEL_NAME = "boltz-core"
CLIENT_ID = os.getenv("CLIENT_ID", "demo-client")
ROUND = int(os.getenv("ROUND", "1"))

def main():
    print("🚀 Starting Federated Learning Client")
    
    # Initialize client
    client = FederatedClient(CLIENT_ID, AGGREGATOR_URL)
    
    # Register client (first time only)
    try:
        registration = client.register(region="us-east-1")
        print(f"✅ Client registered: {registration}")
    except Exception as e:
        print(f"⚠️  Registration failed (may already be registered): {e}")
    
    # Generate mock training data
    print("📊 Generating local training data...")
    training_data = {
        'X': np.random.randn(100, 10),  # 100 samples, 10 features
        'y': np.random.randn(100)       # Target values
    }
    
    # Participate in federated round
    print(f"🔄 Participating in round {ROUND}...")
    try:
        result = client.participate_in_round(MODEL_NAME, training_data, ROUND)
        print(f"✅ Round participation complete:")
        print(f"   - Model: {result['model_name']}")
        print(f"   - Round: {result['round_number']}")
        print(f"   - Delta norm: {result['delta_norm']:.4f}")
        print(f"   - Upload status: {result['upload_result']['status']}")
        
    except Exception as e:
        print(f"❌ Round participation failed: {e}")

if __name__ == "__main__":
    main()