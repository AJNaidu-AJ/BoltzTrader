import numpy as np
from typing import Dict, Any, List

class WeightingStrategy:
    def __init__(self, trust_weight: float = 0.7, size_weight: float = 0.3):
        self.trust_weight = trust_weight
        self.size_weight = size_weight
    
    def calculate_weight(self, trust_score: float, data_size: int, base_size: int = 1000) -> float:
        """Calculate client weight based on trust score and data size"""
        
        # Normalize trust score (0-1)
        trust_component = max(0.1, min(1.0, trust_score))
        
        # Normalize data size (logarithmic scaling to prevent large clients from dominating)
        size_component = min(1.0, np.log(1 + data_size / base_size))
        
        # Weighted combination
        weight = (self.trust_weight * trust_component + 
                 self.size_weight * size_component)
        
        return weight
    
    def calculate_batch_weights(self, clients: List[Dict[str, Any]]) -> List[float]:
        """Calculate weights for a batch of clients"""
        weights = []
        
        for client in clients:
            weight = self.calculate_weight(
                trust_score=client.get('trust_score', 0.5),
                data_size=client.get('data_size', 1000)
            )
            weights.append(weight)
        
        # Normalize weights to sum to 1
        weights = np.array(weights)
        if np.sum(weights) > 0:
            weights = weights / np.sum(weights)
        else:
            weights = np.ones(len(weights)) / len(weights)
        
        return weights.tolist()
    
    def apply_reputation_decay(self, trust_score: float, rounds_inactive: int, decay_rate: float = 0.05) -> float:
        """Apply reputation decay for inactive clients"""
        decay_factor = np.exp(-decay_rate * rounds_inactive)
        return trust_score * decay_factor
    
    def update_trust_score(self, current_trust: float, performance_metric: float, learning_rate: float = 0.1) -> float:
        """Update client trust score based on performance"""
        # Performance metric should be between -1 (bad) and 1 (good)
        performance_metric = max(-1.0, min(1.0, performance_metric))
        
        # Update trust score with exponential moving average
        new_trust = current_trust + learning_rate * (performance_metric - current_trust)
        
        # Clamp to valid range
        return max(0.1, min(1.0, new_trust))
    
    def detect_outliers(self, updates: List[Dict[str, Any]], threshold: float = 2.0) -> List[str]:
        """Detect outlier updates that might be malicious"""
        if len(updates) < 3:
            return []
        
        # Calculate delta norms
        norms = []
        client_ids = []
        
        for update in updates:
            delta = np.array(update['delta'])
            norms.append(np.linalg.norm(delta))
            client_ids.append(update['client_id'])
        
        norms = np.array(norms)
        mean_norm = np.mean(norms)
        std_norm = np.std(norms)
        
        if std_norm == 0:
            return []
        
        # Find outliers using z-score
        z_scores = np.abs((norms - mean_norm) / std_norm)
        outlier_indices = np.where(z_scores > threshold)[0]
        
        return [client_ids[i] for i in outlier_indices]