import numpy as np
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
import json
import base64
from typing import Dict, Any

class SecureAggregator:
    def __init__(self):
        # Generate server key pair for secure aggregation
        self.private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        self.public_key = self.private_key.public_key()
    
    def get_public_key_pem(self) -> str:
        """Get server public key in PEM format for clients"""
        return self.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode()
    
    def decrypt_update(self, encrypted_update: Dict[str, Any]) -> Dict[str, Any]:
        """Decrypt client update using hybrid encryption"""
        try:
            # Extract encrypted symmetric key and payload
            encrypted_key = base64.b64decode(encrypted_update['encrypted_key'])
            encrypted_payload = base64.b64decode(encrypted_update['encrypted_payload'])
            
            # Decrypt symmetric key with server private key
            symmetric_key = self.private_key.decrypt(
                encrypted_key,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            
            # Decrypt payload with symmetric key
            fernet = Fernet(base64.urlsafe_b64encode(symmetric_key[:32]))
            decrypted_payload = fernet.decrypt(encrypted_payload)
            
            # Parse decrypted data
            update_data = json.loads(decrypted_payload.decode())
            
            # Convert delta back to numpy array
            update_data['delta'] = np.array(update_data['delta'])
            
            return update_data
            
        except Exception as e:
            raise ValueError(f"Failed to decrypt update: {str(e)}")
    
    def verify_signature(self, update: Dict[str, Any], client_public_key: str) -> bool:
        """Verify client signature on update"""
        # TODO: Implement signature verification
        # This would verify that the update was signed by the client's private key
        return True
    
    def aggregate_with_masking(self, updates: list) -> np.ndarray:
        """Secure aggregation with pairwise masking (simplified)"""
        if not updates:
            return np.array([])
        
        # In a full implementation, this would use secure multi-party computation
        # For now, we implement a simplified version
        
        total = np.zeros_like(updates[0]['delta'])
        for update in updates:
            total += update['delta']
        
        return total / len(updates)
    
    def add_noise_for_privacy(self, aggregated_delta: np.ndarray, noise_scale: float = 0.1) -> np.ndarray:
        """Add calibrated noise for differential privacy"""
        noise = np.random.normal(0, noise_scale, aggregated_delta.shape)
        return aggregated_delta + noise