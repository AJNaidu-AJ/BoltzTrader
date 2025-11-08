"""
Aggregator CLI — run a full aggregation round manually or by cron.
Usage:
  python -m services.federated.aggregation.cli --model boltz-core --round 12
"""
import argparse
import json
import hashlib
import numpy as np
from .aggregator import FederatedAggregator
from ..storage.model_store import ModelStore

def main():
    parser = argparse.ArgumentParser(description="Run federated aggregation round")
    parser.add_argument("--model", required=True, help="Model name")
    parser.add_argument("--round", type=int, default=1, help="Round number")
    parser.add_argument("--storage", default="local", help="Storage type (local/s3)")
    args = parser.parse_args()

    print(f"🧠 Starting aggregation for {args.model} (round {args.round})...")
    
    # Initialize components
    aggregator = FederatedAggregator()
    model_store = ModelStore(storage_type=args.storage)
    
    # TODO: Fetch pending updates from database
    # For now, simulate with mock updates
    mock_updates = [
        {
            'client_id': 'client-1',
            'delta': np.random.randn(10) * 0.1,
            'trust_score': 0.8,
            'size_bytes': 1000
        },
        {
            'client_id': 'client-2', 
            'delta': np.random.randn(10) * 0.1,
            'trust_score': 0.6,
            'size_bytes': 1500
        }
    ]
    
    print(f"📊 Processing {len(mock_updates)} client updates...")
    
    try:
        # Mock the secure aggregator for CLI demo
        aggregator.secure_aggregator.decrypt_update = lambda x: x
        
        # Run aggregation
        result = aggregator.aggregate_round(args.model, args.round, mock_updates)
        
        # Create new model (mock)
        base_model = np.random.randn(10)
        aggregated_delta = np.array(result['aggregated_delta'])
        new_model = aggregator.apply_delta_to_model(base_model, aggregated_delta)
        
        # Save new model
        artifact_url = model_store.save_model(
            args.model, 
            new_model, 
            args.round,
            metadata={
                'round_number': args.round,
                'client_count': result['client_count'],
                'audit_hash': result['audit_hash']
            }
        )
        
        print(f"✅ Aggregation complete!")
        print(f"   - Model: {args.model}")
        print(f"   - Round: {args.round}")
        print(f"   - Clients: {result['client_count']}")
        print(f"   - Artifact: {artifact_url}")
        print(f"   - Audit hash: {result['audit_hash'][:16]}...")
        
        # TODO: Update database with new model version and aggregation log
        
    except Exception as e:
        print(f"❌ Aggregation failed: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())