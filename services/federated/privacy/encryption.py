from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os
from typing import Tuple, bytes

class HybridEncryption:
    """Hybrid encryption using RSA + AES for federated learning"""
    
    def __init__(self):
        self.private_key = None
        self.public_key = None
    
    def generate_key_pair(self) -> Tuple[bytes, bytes]:
        """Generate RSA key pair"""
        self.private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        self.public_key = self.private_key.public_key()
        
        private_pem = self.private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        public_pem = self.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        return private_pem, public_pem
    
    def load_public_key(self, public_key_pem: bytes):
        """Load public key from PEM format"""
        self.public_key = serialization.load_pem_public_key(public_key_pem)
    
    def load_private_key(self, private_key_pem: bytes):
        """Load private key from PEM format"""
        self.private_key = serialization.load_pem_private_key(
            private_key_pem,
            password=None
        )
    
    def encrypt(self, data: bytes, recipient_public_key: bytes = None) -> dict:
        """Encrypt data using hybrid encryption"""
        
        # Use provided public key or instance public key
        if recipient_public_key:
            public_key = serialization.load_pem_public_key(recipient_public_key)
        else:
            public_key = self.public_key
        
        if not public_key:
            raise ValueError("No public key available for encryption")
        
        # Generate symmetric key
        symmetric_key = Fernet.generate_key()
        fernet = Fernet(symmetric_key)
        
        # Encrypt data with symmetric key
        encrypted_data = fernet.encrypt(data)
        
        # Encrypt symmetric key with public key
        encrypted_key = public_key.encrypt(
            base64.urlsafe_b64decode(symmetric_key),
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        return {
            'encrypted_key': base64.b64encode(encrypted_key).decode(),
            'encrypted_data': base64.b64encode(encrypted_data).decode()
        }
    
    def decrypt(self, encrypted_package: dict) -> bytes:
        """Decrypt data using hybrid decryption"""
        
        if not self.private_key:
            raise ValueError("No private key available for decryption")
        
        # Decode encrypted components
        encrypted_key = base64.b64decode(encrypted_package['encrypted_key'])
        encrypted_data = base64.b64decode(encrypted_package['encrypted_data'])
        
        # Decrypt symmetric key with private key
        symmetric_key = self.private_key.decrypt(
            encrypted_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        # Decrypt data with symmetric key
        fernet = Fernet(base64.urlsafe_b64encode(symmetric_key))
        decrypted_data = fernet.decrypt(encrypted_data)
        
        return decrypted_data

class SecureKeyManager:
    """Manage encryption keys securely"""
    
    def __init__(self, key_storage_path: str = None):
        self.key_storage_path = key_storage_path or os.path.expanduser("~/.boltztrader/keys")
        os.makedirs(self.key_storage_path, exist_ok=True)
    
    def generate_and_store_keys(self, key_name: str) -> Tuple[str, str]:
        """Generate and securely store key pair"""
        
        hybrid_enc = HybridEncryption()
        private_pem, public_pem = hybrid_enc.generate_key_pair()
        
        # Store keys securely
        private_path = os.path.join(self.key_storage_path, f"{key_name}_private.pem")
        public_path = os.path.join(self.key_storage_path, f"{key_name}_public.pem")
        
        # Set restrictive permissions for private key
        with open(private_path, 'wb') as f:
            f.write(private_pem)
        os.chmod(private_path, 0o600)  # Read/write for owner only
        
        with open(public_path, 'wb') as f:
            f.write(public_pem)
        
        return private_path, public_path
    
    def load_key(self, key_path: str) -> bytes:
        """Load key from file"""
        with open(key_path, 'rb') as f:
            return f.read()
    
    def derive_key_from_password(self, password: str, salt: bytes = None) -> bytes:
        """Derive encryption key from password"""
        if salt is None:
            salt = os.urandom(16)
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return key