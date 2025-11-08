import boto3
import joblib
import hashlib
import json
import tempfile
import os
from typing import Any, Dict, Optional
from datetime import datetime

class ModelStore:
    """Store and retrieve federated models from object storage"""
    
    def __init__(self, storage_type: str = "s3", **config):
        self.storage_type = storage_type
        self.config = config
        
        if storage_type == "s3":
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=config.get('access_key'),
                aws_secret_access_key=config.get('secret_key'),
                region_name=config.get('region', 'us-east-1')
            )
            self.bucket = config.get('bucket', 'boltztrader-federated-models')
        elif storage_type == "local":
            self.local_path = config.get('path', './models')
            os.makedirs(self.local_path, exist_ok=True)
    
    def save_model(self, model_name: str, model: Any, version: int, metadata: Optional[Dict] = None) -> str:
        """Save model to storage and return artifact URL"""
        
        # Serialize model
        with tempfile.NamedTemporaryFile(suffix='.joblib', delete=False) as tmp_file:
            joblib.dump(model, tmp_file.name)
            
            # Calculate model hash
            with open(tmp_file.name, 'rb') as f:
                model_hash = hashlib.sha256(f.read()).hexdigest()
            
            # Create artifact key
            artifact_key = f"{model_name}/v{version}/{model_hash}.joblib"
            
            if self.storage_type == "s3":
                artifact_url = self._save_to_s3(tmp_file.name, artifact_key, metadata)
            elif self.storage_type == "local":
                artifact_url = self._save_to_local(tmp_file.name, artifact_key, metadata)
            else:
                raise ValueError(f"Unsupported storage type: {self.storage_type}")
            
            # Clean up temp file
            os.unlink(tmp_file.name)
            
            return artifact_url
    
    def load_model(self, artifact_url: str) -> Any:
        """Load model from storage"""
        
        if self.storage_type == "s3":
            return self._load_from_s3(artifact_url)
        elif self.storage_type == "local":
            return self._load_from_local(artifact_url)
        else:
            raise ValueError(f"Unsupported storage type: {self.storage_type}")
    
    def _save_to_s3(self, file_path: str, key: str, metadata: Optional[Dict] = None) -> str:
        """Save file to S3"""
        
        extra_args = {}
        if metadata:
            extra_args['Metadata'] = {k: str(v) for k, v in metadata.items()}
        
        self.s3_client.upload_file(file_path, self.bucket, key, ExtraArgs=extra_args)
        
        return f"s3://{self.bucket}/{key}"
    
    def _load_from_s3(self, artifact_url: str) -> Any:
        """Load file from S3"""
        
        # Parse S3 URL
        if not artifact_url.startswith("s3://"):
            raise ValueError("Invalid S3 URL")
        
        parts = artifact_url[5:].split('/', 1)
        bucket = parts[0]
        key = parts[1]
        
        # Download to temp file
        with tempfile.NamedTemporaryFile(suffix='.joblib', delete=False) as tmp_file:
            self.s3_client.download_file(bucket, key, tmp_file.name)
            model = joblib.load(tmp_file.name)
            os.unlink(tmp_file.name)
            
            return model
    
    def _save_to_local(self, file_path: str, key: str, metadata: Optional[Dict] = None) -> str:
        """Save file to local storage"""
        
        local_file_path = os.path.join(self.local_path, key)
        os.makedirs(os.path.dirname(local_file_path), exist_ok=True)
        
        # Copy file
        import shutil
        shutil.copy2(file_path, local_file_path)
        
        # Save metadata if provided
        if metadata:
            metadata_path = local_file_path + '.metadata.json'
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
        
        return f"file://{os.path.abspath(local_file_path)}"
    
    def _load_from_local(self, artifact_url: str) -> Any:
        """Load file from local storage"""
        
        if artifact_url.startswith("file://"):
            file_path = artifact_url[7:]
        else:
            file_path = artifact_url
        
        return joblib.load(file_path)
    
    def list_versions(self, model_name: str) -> list:
        """List all versions of a model"""
        
        if self.storage_type == "s3":
            return self._list_s3_versions(model_name)
        elif self.storage_type == "local":
            return self._list_local_versions(model_name)
        else:
            raise ValueError(f"Unsupported storage type: {self.storage_type}")
    
    def _list_s3_versions(self, model_name: str) -> list:
        """List S3 model versions"""
        
        prefix = f"{model_name}/"
        response = self.s3_client.list_objects_v2(Bucket=self.bucket, Prefix=prefix)
        
        versions = []
        for obj in response.get('Contents', []):
            key = obj['Key']
            if key.endswith('.joblib'):
                # Extract version from path
                parts = key.split('/')
                if len(parts) >= 2 and parts[1].startswith('v'):
                    version = int(parts[1][1:])
                    versions.append({
                        'version': version,
                        'key': key,
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'].isoformat()
                    })
        
        return sorted(versions, key=lambda x: x['version'], reverse=True)
    
    def _list_local_versions(self, model_name: str) -> list:
        """List local model versions"""
        
        model_dir = os.path.join(self.local_path, model_name)
        if not os.path.exists(model_dir):
            return []
        
        versions = []
        for version_dir in os.listdir(model_dir):
            if version_dir.startswith('v'):
                version = int(version_dir[1:])
                version_path = os.path.join(model_dir, version_dir)
                
                for file_name in os.listdir(version_path):
                    if file_name.endswith('.joblib'):
                        file_path = os.path.join(version_path, file_name)
                        stat = os.stat(file_path)
                        
                        versions.append({
                            'version': version,
                            'path': file_path,
                            'size': stat.st_size,
                            'last_modified': datetime.fromtimestamp(stat.st_mtime).isoformat()
                        })
        
        return sorted(versions, key=lambda x: x['version'], reverse=True)