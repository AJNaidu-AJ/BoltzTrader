import numpy as np
import hashlib
import json
from typing import List, Dict, Any
from .secure_aggregation import SecureAggregator
from .weighting import WeightingStrategy
from ..privacy.differential_privacy import apply_dp_noise

class FederatedAggregator:
    def __init__(self):
        self.secure_aggregator = SecureAggregator()
        self.weighting = WeightingStrategy()
    
    def aggregate_round(self, model_id: str, round_number: int, client_updates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate client updates into new global model"""
        
        if not client_updates:
            raise ValueError("No client updates to aggregate")
        
        # 1. Verify signatures and decrypt updates
        decrypted_updates = []
        for update in client_updates:
            try:
                decrypted = self.secure_aggregator.decrypt_update(update)
                decrypted_updates.append(decrypted)
            except Exception as e:
                print(f"Failed to decrypt update from {update.get('client_id')}: {e}")
                continue
        
        if not decrypted_updates:
            raise ValueError("No valid updates after decryption")
        
        # 2. Calculate client weights
        weights = []
        deltas = []
        
        for update in decrypted_updates:
            weight = self.weighting.calculate_weight(
                trust_score=update.get('trust_score', 0.5),
                data_size=update.get('size_bytes', 1000)
            )
            weights.append(weight)
            deltas.append(update['delta'])
        
        # 3. Weighted aggregation
        weights = np.array(weights)
        weights = weights / np.sum(weights)  # Normalize
        
        aggregated_delta = np.zeros_like(deltas[0])
        for i, delta in enumerate(deltas):
            aggregated_delta += weights[i] * delta
        
        # 4. Apply differential privacy noise
        noisy_delta = apply_dp_noise(aggregated_delta, epsilon=1.0, sensitivity=0.1)
        
        # 5. Create aggregation result
        result = {
            'model_id': model_id,
            'round_number': round_number,
            'aggregated_delta': noisy_delta.tolist(),
            'client_count': len(decrypted_updates),
            'weights': weights.tolist(),
            'metrics': {
                'avg_weight': float(np.mean(weights)),
                'delta_norm': float(np.linalg.norm(noisy_delta))
            }
        }
        
        # 6. Generate audit hash
        audit_data = {
            'model_id': model_id,
            'round_number': round_number,
            'client_count': len(decrypted_updates),
            'delta_hash': hashlib.sha256(noisy_delta.tobytes()).hexdigest()
        }
        result['audit_hash'] = hashlib.sha256(json.dumps(audit_data, sort_keys=True).encode()).hexdigest()
        
        return result
    
    def apply_delta_to_model(self, base_model: np.ndarray, delta: np.ndarray, learning_rate: float = 0.1) -> np.ndarray:
        """Apply aggregated delta to base model"""
        return base_model + learning_rate * delta
    
    def validate_update(self, update: Dict[str, Any]) -> bool:
        """Validate client update format and constraints"""
        required_fields = ['client_id', 'model_id', 'round_number', 'delta']
        
        for field in required_fields:
            if field not in update:
                return False
        
        # Check delta size constraints
        delta = np.array(update['delta'])
        if delta.size > 10000:  # Max delta size
            return False
        
        # Check delta magnitude
        if np.linalg.norm(delta) > 10.0:  # Max delta norm
            return False
        
        return True