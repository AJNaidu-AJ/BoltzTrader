# ☁️ BoltzTrader Cloud Deployment Guide

## 🚀 Quick Start

### Local Docker Testing
```bash
# Build and run locally
docker build -t boltztrader .
docker run -p 8080:8080 boltztrader

# Or use docker-compose
docker-compose up -d
```

### Kubernetes Deployment
```bash
# Apply all manifests
kubectl apply -f k8s/

# Create secrets
kubectl create secret generic boltztrader-secrets \
  --from-literal=VITE_SUPABASE_URL=your_supabase_url \
  --from-literal=VITE_SUPABASE_ANON_KEY=your_supabase_anon_key \
  --from-literal=VITE_OPENAI_API_KEY=your_openai_api_key

# Check deployment
kubectl get pods
kubectl get services
```

## 🌐 Cloud Providers

### Google Kubernetes Engine (GKE)
```bash
# Create cluster
gcloud container clusters create boltztrader-cluster \
  --region=asia-south1 \
  --num-nodes=3 \
  --enable-autoscaling --min-nodes=3 --max-nodes=10

# Get credentials
gcloud container clusters get-credentials boltztrader-cluster --region=asia-south1
```

### Amazon EKS
```bash
# Create cluster
eksctl create cluster --name boltztrader --region ap-south-1

# Update kubeconfig
aws eks update-kubeconfig --region ap-south-1 --name boltztrader
```

## 📊 Monitoring Setup

### Install Prometheus & Grafana
```bash
# Add Helm repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack

# Install Grafana
helm install grafana grafana/grafana

# Get Grafana password
kubectl get secret --namespace default grafana -o jsonpath="{.data.admin-password}" | base64 --decode
```

### Access Dashboards
```bash
# Prometheus
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090

# Grafana
kubectl port-forward svc/grafana 3000:80
```

## 🔐 SSL/TLS Setup

### Install cert-manager
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### Create ClusterIssuer
```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

## 🔄 Auto-Scaling Configuration

### Metrics Server (if not installed)
```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### Verify HPA
```bash
kubectl get hpa
kubectl describe hpa boltztrader-hpa
```

## 📈 Production Checklist

- [ ] Docker image built and pushed to registry
- [ ] Kubernetes cluster created and configured
- [ ] Secrets created with production values
- [ ] Ingress configured with SSL certificates
- [ ] Monitoring stack deployed (Prometheus + Grafana)
- [ ] Auto-scaling configured and tested
- [ ] Backup strategy implemented
- [ ] Domain DNS configured
- [ ] Load testing completed

## 🚨 Troubleshooting

### Common Issues
```bash
# Check pod logs
kubectl logs -f deployment/boltztrader

# Check service endpoints
kubectl get endpoints

# Check ingress status
kubectl describe ingress boltztrader-ingress

# Check HPA metrics
kubectl top pods
kubectl top nodes
```

## 🌍 Multi-Region Setup

For global deployment, repeat the cluster setup in multiple regions:
- `asia-south1` (Mumbai)
- `us-central1` (Iowa)
- `europe-west1` (Belgium)

Use a global load balancer to route traffic to the nearest region.

## ✅ Result

BoltzTrader running as a **globally distributed, auto-scaling, monitored cloud application** ready for institutional-grade trading workloads.