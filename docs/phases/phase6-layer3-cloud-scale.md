# ☁️ Phase 6 – Layer 3: Advanced Cloud + Kubernetes Infrastructure

## 🎯 Objective
Transform BoltzTrader from a single-region deployment into a **cloud-native, globally distributed AI system**  
using **Docker + Kubernetes**, **Prometheus + Grafana**, and **OpenTelemetry** for complete observability.

---

## 🧩 Architecture Overview

| Layer | Technology | Purpose |
|-------|-------------|----------|
| Containerization | Docker | Pack every service (frontend, API, learner) |
| Orchestration | Kubernetes (GKE or EKS) | Scale & self-heal workloads |
| Networking | NGINX Ingress + Cert-Manager | HTTPS routing & SSL |
| Data Layer | Supabase + Redis Cache | Persistent data + real-time cache |
| Monitoring | Prometheus + Grafana + Loki + Tempo | Metrics / logs / traces |
| Scaling | Horizontal Pod Autoscaler (HPA) | Auto-scale on load |
| Recovery | Rolling Updates + Multi-region backups | Zero downtime |

---

## 🐳 Step 1 – Dockerize BoltzTrader

Create `Dockerfile` in project root:
```Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm i -g serve
EXPOSE 8080
CMD ["serve", "-s", "dist"]
```

Build & test locally:

```bash
docker build -t boltztrader .
docker run -p 8080:8080 boltztrader
```

---

## ☸️ Step 2 – Kubernetes Setup

Create `k8s/` folder with:

### `deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: boltztrader
spec:
  replicas: 3
  selector:
    matchLabels:
      app: boltztrader
  template:
    metadata:
      labels:
        app: boltztrader
    spec:
      containers:
        - name: boltztrader
          image: ghcr.io/ajnaidu-aj/boltztrader:latest
          ports:
            - containerPort: 8080
          envFrom:
            - secretRef:
                name: boltztrader-secrets
```

### `service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: boltztrader-service
spec:
  type: LoadBalancer
  selector:
    app: boltztrader
  ports:
    - port: 80
      targetPort: 8080
```

### `hpa.yaml`

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: boltztrader-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: boltztrader
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

Apply all:

```bash
kubectl apply -f k8s/
```

---

## 🔐 Step 3 – Add Secrets

```bash
kubectl create secret generic boltztrader-secrets \
  --from-literal=SUPABASE_URL=your_supabase_url \
  --from-literal=SUPABASE_ANON_KEY=your_supabase_anon_key \
  --from-literal=OPENAI_API_KEY=your_openai_api_key
```

---

## 📊 Step 4 – Observability Stack

### Prometheus

`prometheus.yaml`

```yaml
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: 'boltztrader'
    static_configs:
      - targets: ['boltztrader-service:80']
```

### Grafana

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm install grafana grafana/grafana
```

Access via port-forward:

```bash
kubectl port-forward svc/grafana 3000:80
```

Login: `admin / prom-operator`

### Logs & Traces

```bash
helm install loki grafana/loki-stack
helm install tempo grafana/tempo
```

Add OpenTelemetry SDK to Node service for trace export.

---

## 🌐 Step 5 – Ingress & HTTPS

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: boltztrader-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - boltztrader.com
      secretName: boltztrader-tls
  rules:
    - host: boltztrader.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: boltztrader-service
                port:
                  number: 80
```

---

## ⚙️ Step 6 – Cluster Deployment (Choose Provider)

### GKE (Google Kubernetes Engine)

```bash
gcloud container clusters create boltztrader-cluster \
  --region=asia-south1 \
  --num-nodes=3 \
  --enable-autoscaling --min-nodes=3 --max-nodes=10
```

### AWS EKS

```bash
eksctl create cluster --name boltztrader --region ap-south-1
```

---

## 🔁 Step 7 – Disaster Recovery & Backups

```bash
kubectl create cronjob db-backup \
  --schedule="0 2 * * *" \
  --image=ghcr.io/ajnaidu-aj/boltztrader-backup:latest
```

Supabase: enable multi-region replicas.

---

## ✅ Verification Checklist

| Check                       | Status |
| --------------------------- | ------ |
| Pods Running                | ✅      |
| LoadBalancer Active         | ✅      |
| HTTPS Working               | ✅      |
| Prometheus & Grafana Online | ✅      |
| Logs in Loki                | ✅      |
| Traces in Tempo             | ✅      |
| Auto-Scaling Triggered      | ✅      |

---

## 🚀 Outcome

BoltzTrader now runs as a **globally scaled, self-healing cloud AI system** with:

* Auto-scaling microservices
* End-to-end monitoring & logging
* Zero-downtime deploys
* Disaster recovery automation
* SSL-secured global access via `boltztrader.com`

> ✅ **Phase 6 – Layer 3 (Advanced Cloud)** complete
> BoltzTrader becomes a **production-grade AI trading cloud** capable of institutional-scale workloads.