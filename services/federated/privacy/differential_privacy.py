import numpy as np
from typing import Union

def apply_dp_noise(data: np.ndarray, epsilon: float, sensitivity: float, mechanism: str = 'gaussian') -> np.ndarray:
    """Apply differential privacy noise to data"""
    
    if epsilon <= 0:
        raise ValueError("Epsilon must be positive")
    
    if mechanism == 'gaussian':
        return _gaussian_mechanism(data, epsilon, sensitivity)
    elif mechanism == 'laplace':
        return _laplace_mechanism(data, epsilon, sensitivity)
    else:
        raise ValueError(f"Unknown mechanism: {mechanism}")

def _gaussian_mechanism(data: np.ndarray, epsilon: float, sensitivity: float, delta: float = 1e-5) -> np.ndarray:
    """Gaussian mechanism for differential privacy"""
    
    # Calculate noise scale for Gaussian mechanism
    # sigma = sqrt(2 * ln(1.25/delta)) * sensitivity / epsilon
    sigma = np.sqrt(2 * np.log(1.25 / delta)) * sensitivity / epsilon
    
    # Generate Gaussian noise
    noise = np.random.normal(0, sigma, data.shape)
    
    return data + noise

def _laplace_mechanism(data: np.ndarray, epsilon: float, sensitivity: float) -> np.ndarray:
    """Laplace mechanism for differential privacy"""
    
    # Calculate noise scale for Laplace mechanism
    scale = sensitivity / epsilon
    
    # Generate Laplace noise
    noise = np.random.laplace(0, scale, data.shape)
    
    return data + noise

def calculate_privacy_budget(epsilon_per_round: float, num_rounds: int, composition: str = 'basic') -> float:
    """Calculate total privacy budget consumption"""
    
    if composition == 'basic':
        # Basic composition: total epsilon = sum of individual epsilons
        return epsilon_per_round * num_rounds
    
    elif composition == 'advanced':
        # Advanced composition (simplified)
        # More sophisticated bounds exist in practice
        return epsilon_per_round * np.sqrt(num_rounds * np.log(1/1e-5))
    
    else:
        raise ValueError(f"Unknown composition method: {composition}")

def clip_gradients(gradients: np.ndarray, clip_norm: float) -> np.ndarray:
    """Clip gradients to bound sensitivity"""
    
    grad_norm = np.linalg.norm(gradients)
    
    if grad_norm > clip_norm:
        return gradients * (clip_norm / grad_norm)
    else:
        return gradients

class DPAccountant:
    """Track privacy budget consumption across rounds"""
    
    def __init__(self, total_epsilon: float, total_delta: float = 1e-5):
        self.total_epsilon = total_epsilon
        self.total_delta = total_delta
        self.consumed_epsilon = 0.0
        self.consumed_delta = 0.0
        self.rounds = []
    
    def spend_budget(self, epsilon: float, delta: float = 0.0, round_info: str = ""):
        """Record privacy budget expenditure"""
        
        if self.consumed_epsilon + epsilon > self.total_epsilon:
            raise ValueError(f"Privacy budget exceeded: {self.consumed_epsilon + epsilon} > {self.total_epsilon}")
        
        if self.consumed_delta + delta > self.total_delta:
            raise ValueError(f"Delta budget exceeded: {self.consumed_delta + delta} > {self.total_delta}")
        
        self.consumed_epsilon += epsilon
        self.consumed_delta += delta
        
        self.rounds.append({
            'epsilon': epsilon,
            'delta': delta,
            'round_info': round_info,
            'total_epsilon': self.consumed_epsilon,
            'total_delta': self.consumed_delta
        })
    
    def remaining_budget(self) -> tuple:
        """Get remaining privacy budget"""
        return (
            self.total_epsilon - self.consumed_epsilon,
            self.total_delta - self.consumed_delta
        )
    
    def can_afford(self, epsilon: float, delta: float = 0.0) -> bool:
        """Check if we can afford to spend this much budget"""
        return (self.consumed_epsilon + epsilon <= self.total_epsilon and
                self.consumed_delta + delta <= self.total_delta)