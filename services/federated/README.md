# BoltzTrader Federated Learning Mesh

## Overview
Privacy-preserving federated learning system that enables BoltzTrader models to improve from decentralized client data without centralizing sensitive trade information.

## Features
- **Privacy-Preserving**: Only model weight deltas are shared, never raw trade data
- **Secure Aggregation**: Hybrid encryption with RSA + AES for secure communication
- **Differential Privacy**: Configurable noise injection to protect individual contributions
- **Trust-Based Weighting**: Client contributions weighted by trust score and data quality
- **Audit Trail**: Complete cryptographic audit trail for compliance

## Architecture

### Core Components
- **Aggregator**: Securely combines client model updates
- **Client Runtime**: SDK for edge nodes to participate in federated learning
- **Secure Communication**: Hybrid encryption for update transmission
- **Model Storage**: Versioned model artifacts with metadata
- **Privacy Protection**: Differential privacy and secure aggregation

### Client Types
- **Broker Adapters**: Trading platform integrations
- **Edge Nodes**: Local trading systems
- **Partner Firms**: Collaborative learning partners
- **User Devices**: Individual trader contributions

## Setup

### Database Migration
```bash
psql $DATABASE_URL -f migrations/20250104_federated.sql
```

### Python Environment
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Run API Server
```bash
uvicorn api.main:app --reload --port 8010
```

## Client Usage

### Register Client
```python
from client.client_runtime import FederatedClient

client = FederatedClient("my-client", "http://localhost:8010")
client.register(region="us-east-1")
```

### Participate in Learning Round
```python
training_data = {
    'X': your_feature_data,
    'y': your_target_data
}

result = client.participate_in_round("boltz-core", training_data, round_number=1)
```

### Run Example Client
```bash
cd services/federated/client
python example_local_train.py
```

## Aggregation

### Manual Aggregation
```bash
python -m services.federated.aggregation.cli --model boltz-core --round 1
```

### Scheduled Aggregation
Deploy the Kubernetes CronJob for automated aggregation every 6 hours.

## Security Features

### Encryption
- **Hybrid Encryption**: RSA for key exchange, AES for payload
- **Key Management**: Secure key generation and storage
- **Signature Verification**: Client authentication via digital signatures

### Privacy Protection
- **Differential Privacy**: Gaussian/Laplace noise injection
- **Secure Aggregation**: Masked aggregation protocols
- **Data Minimization**: Only gradients transmitted, never raw data

### Trust & Reputation
- **Trust Scoring**: Performance-based client reliability
- **Outlier Detection**: Automatic detection of malicious updates
- **Reputation Decay**: Trust degradation for inactive clients

## Testing
```bash
pytest -q --cov=. --cov-report=html
```

## Monitoring
- Client participation rates
- Aggregation success metrics
- Model performance tracking
- Privacy budget consumption
- Security event logging

## Compliance
- GDPR-compliant data handling
- Audit trail for all operations
- Cryptographic verification
- Privacy budget accounting
- Secure key management