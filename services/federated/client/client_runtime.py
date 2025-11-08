import requests
import numpy as np
import joblib
import tempfile
import json
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from typing import Dict, Any, Optional
import os

class FederatedClient:
    def __init__(self, client_id: str, aggregator_url: str, client_private_key: Optional[str] = None):
        self.client_id = client_id
        self.aggregator_url = aggregator_url.rstrip('/')
        
        # Generate or load client key pair
        if client_private_key:
            self.private_key = serialization.load_pem_private_key(
                client_private_key.encode(),
                password=None
            )
        else:
            self.private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048
            )
        
        self.public_key = self.private_key.public_key()
        self.server_public_key = None
    
    def register(self, region: Optional[str] = None) -> Dict[str, Any]:
        """Register client with aggregator"""
        public_key_pem = self.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode()
        
        payload = {
            "client_name": self.client_id,
            "region": region,
            "public_key": public_key_pem
        }
        
        response = requests.post(f"{self.aggregator_url}/api/federated/clients/register", json=payload)
        response.raise_for_status()
        return response.json()
    
    def pull_model(self, model_name: str) -> Dict[str, Any]:
        """Pull latest global model from aggregator"""
        response = requests.get(f"{self.aggregator_url}/api/federated/models/latest/{model_name}")
        response.raise_for_status()
        return response.json()
    
    def local_train(self, model, training_data: Dict[str, Any], epochs: int = 1) -> np.ndarray:
        """Perform local training and return model delta"""
        # Save original model weights
        original_weights = model.coef_.copy() if hasattr(model, 'coef_') else np.random.randn(10)
        
        # Simulate local training
        X = np.array(training_data.get('X', np.random.randn(100, len(original_weights))))
        y = np.array(training_data.get('y', np.random.randn(100)))
        
        # Train for specified epochs
        for _ in range(epochs):
            if hasattr(model, 'partial_fit'):
                model.partial_fit(X, y)
            else:
                # Simulate training with gradient update
                gradient = np.random.randn(*original_weights.shape) * 0.01
                if hasattr(model, 'coef_'):
                    model.coef_ += gradient
        
        # Calculate delta
        new_weights = model.coef_ if hasattr(model, 'coef_') else original_weights + np.random.randn(*original_weights.shape) * 0.01
        delta = new_weights - original_weights
        
        return delta
    
    def encrypt_update(self, delta: np.ndarray, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Encrypt model update for secure transmission"""
        # Get server public key if not cached
        if not self.server_public_key:
            # TODO: Fetch server public key from aggregator
            pass
        
        # Prepare update payload
        update_data = {
            'client_id': self.client_id,
            'delta': delta.tolist(),
            'metadata': metadata
        }
        
        # Generate symmetric key for payload encryption
        symmetric_key = Fernet.generate_key()
        fernet = Fernet(symmetric_key)
        
        # Encrypt payload with symmetric key
        payload_json = json.dumps(update_data).encode()
        encrypted_payload = fernet.encrypt(payload_json)
        
        # Encrypt symmetric key with server public key (mock for now)
        # In production, use server's actual public key
        mock_server_key = rsa.generate_private_key(public_exponent=65537, key_size=2048).public_key()
        encrypted_key = mock_server_key.encrypt(
            base64.urlsafe_b64decode(symmetric_key),
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        return {
            'encrypted_key': base64.b64encode(encrypted_key).decode(),
            'encrypted_payload': base64.b64encode(encrypted_payload).decode(),
            'client_id': self.client_id
        }
    
    def upload_update(self, model_id: str, round_number: int, encrypted_update: Dict[str, Any]) -> Dict[str, Any]:
        """Upload encrypted update to aggregator"""
        
        # Create temporary file with encrypted data
        with tempfile.NamedTemporaryFile(mode='w+b', delete=False, suffix='.bin') as tmp_file:
            # Write encrypted data as JSON
            json_data = json.dumps(encrypted_update).encode()
            tmp_file.write(json_data)
            tmp_path = tmp_file.name
        
        try:
            # Upload file
            with open(tmp_path, 'rb') as f:
                files = {'file': f}
                url = f"{self.aggregator_url}/api/federated/updates/submit/{self.client_id}/{model_id}/{round_number}"
                response = requests.post(url, files=files)
                response.raise_for_status()
                return response.json()
        
        finally:
            # Clean up temporary file
            os.unlink(tmp_path)
    
    def participate_in_round(self, model_name: str, training_data: Dict[str, Any], round_number: int) -> Dict[str, Any]:
        """Complete participation in a federated learning round"""
        
        # 1. Pull latest model
        model_info = self.pull_model(model_name)
        
        # 2. Load model (mock for now)
        from sklearn.linear_model import SGDRegressor
        model = SGDRegressor()
        
        # 3. Perform local training
        delta = self.local_train(model, training_data)
        
        # 4. Encrypt update
        metadata = {
            'data_size': len(training_data.get('X', [])),
            'training_loss': np.random.random(),  # Mock loss
            'round_number': round_number
        }
        encrypted_update = self.encrypt_update(delta, metadata)
        
        # 5. Upload update
        result = self.upload_update(model_info['version'], round_number, encrypted_update)
        
        return {
            'model_name': model_name,
            'round_number': round_number,
            'delta_norm': float(np.linalg.norm(delta)),
            'upload_result': result
        }