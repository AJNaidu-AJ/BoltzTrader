# 🧪 Phase 9.4 — Live Trade Execution Validation Suite

### 🎯 Objective
Ensure that **BoltzTrader's autonomous AI trading system** performs **safe, accurate, and compliant** live executions through Zerodha, Binance, and Alpaca brokers — with correct audit trails, risk guard enforcement, and live data synchronization.

---

## 🧩 Test Scope

| Category | Coverage |
|-----------|-----------|
| 🔧 Broker Connectivity | Zerodha / Binance / Alpaca sandbox APIs |
| 🧠 AI Signal Flow | From Phase 9.3 AI signal → tradeRouter execution |
| 🛡️ Risk Management | Confidence, exposure, daily limits |
| 📜 Audit Logging | Full trade traceability with immutable hash |
| ⚙️ Governance Controls | KYC / 2FA / policyEngine enforcement |
| 🧾 Database Validation | `trade_orders` + `audit_ledger` tables |
| 🚨 Observability | Prometheus, Grafana, Sentry |
| 💬 UI Sync | Frontend live chart → broker status feedback |

---

## 🧱 Environment Setup

Before testing:

```
TRADE_EXECUTION_ENABLED=true
NODE_ENV=staging
ZERODHA_SANDBOX=true
BINANCE_TESTNET=true
ALPACA_SANDBOX=true
LOG_LEVEL=debug
```

Run migrations:

```bash
psql $DATABASE_URL -f migrations/phase9.4_trades.sql
```

Launch backend & frontend:

```bash
npm run dev    # frontend
pnpm run dev   # backend service
```

---

## 🧪 Section 1: Broker Adapters Health Check

**Goal:** Confirm all broker adapters respond correctly via sandbox/testnet.

Run:

```bash
curl -X GET "http://localhost:8083/api/brokers/health"
```

✅ **Expected Response**
```json
{
  "Zerodha": "healthy",
  "Binance": "healthy",
  "Alpaca": "healthy"
}
```

If any show `"unhealthy"`, check API keys, environment variables, or mock service endpoints.

---

## 🧩 Section 2: AI Signal Execution Flow Test

Trigger a simulated AI signal manually:

```bash
curl -X POST "http://localhost:8083/api/trade/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "side": "BUY",
    "qty": 0.01,
    "price": 0,
    "signal_confidence": 0.92,
    "user_region": "GLOBAL",
    "ai_source": "reinforcement_engine"
  }'
```

✅ **Expected Response**
```json
{
  "status": "executed",
  "broker": "Binance",
  "order_id": "mock-1234",
  "audit_id": "a6c2-94f3-92c9"
}
```

Verify DB entry:
```sql
SELECT symbol, side, broker, status FROM trade_orders ORDER BY created_at DESC LIMIT 5;
```

✅ **Should show:**
```
BTCUSDT | BUY | Binance | executed
```

---

## 🛡️ Section 3: Risk Guard & Exposure Check

Test rejection cases:

```bash
# Confidence below 0.7 (should fail)
curl -X POST "http://localhost:8083/api/trade/execute" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTCUSDT","side":"BUY","qty":1,"signal_confidence":0.2}'
```

✅ **Expected Response**
```json
{"error":"Risk Check Failed"}
```

Now simulate exposure > 20%:

```bash
curl -X POST "http://localhost:8083/api/trade/execute" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","side":"BUY","qty":1000,"signal_confidence":0.95}'
```

✅ **Expected:** Trade blocked and audit logged.

Check audit table:
```sql
SELECT action, entity, performed_by FROM audit_ledger WHERE action='trade_blocked' ORDER BY created_at DESC;
```

✅ **Result Example:**
```
trade_blocked | AAPL | RiskGuard
```

---

## 🧾 Section 4: Audit Trail & Hash Verification

Each order should have a valid hash trace:

```sql
SELECT id, symbol, side, hash, created_at
FROM audit_ledger
WHERE action='trade_executed'
ORDER BY created_at DESC
LIMIT 5;
```

✅ Hash column must be **non-null**, 64 characters (SHA-256).  
If missing, check `/utils/auditLogger.ts`.

---

## ⚙️ Section 5: Broker Webhook Simulation

Simulate broker "order filled" callback:

```bash
curl -X POST "http://localhost:8083/api/brokers/webhook" \
  -H "Content-Type: application/json" \
  -d '{"broker":"binance","order_id":"mock-1234","status":"filled"}'
```

✅ **Expected:**  
- DB updates `trade_orders.status` → `filled`
- Audit entry `trade_status_update` added

---

## 📊 Section 6: Monitoring & Observability

Check metrics endpoint:

```bash
curl -s http://localhost:8083/metrics | grep boltz_trade
```

✅ Expected:
```
boltz_trade_executions_total 1
boltz_trade_blocked_total 0
```

---

## 🕓 Section 7: Emergency Stop / Cooldown Test

Trigger emergency stop:
```bash
curl -X POST "http://localhost:8083/api/risk/emergency_stop"
```

Then attempt trade → should fail with message:
```
"Trading temporarily suspended by RiskGuard"
```

To reset:
```bash
curl -X POST "http://localhost:8083/api/risk/clear_cooldown"
```

---

## 🧠 Section 8: AI Feedback Reinforcement Link (Phase 8.3)

Verify learning feedback was logged:

```sql
SELECT decision->>'symbol', confidence_score FROM xai_reasoning ORDER BY created_at DESC LIMIT 5;
```

✅ Expected:
- Entries for executed trades with confidence score and feedback updates.

---

## 🧩 Section 9: UI Verification Steps

1. Open `/global-markets`
2. Wait for an AI signal overlay
3. Click **"Execute Trade"**
4. Watch:
   - Execution spinner → success state
   - "Order Executed" toast
   - Order reflected under "Live Orders" tab

✅ Expected:
- Chart shows execution marker (green arrow for BUY, red for SELL)
- Broker name and timestamp displayed
- Audit and DB sync confirmed via backend queries

---

## 🔒 Section 10: Security & Compliance Checks

| Check | Description | Status |
|-------|--------------|--------|
| Secrets in `.env` only | No plaintext keys in repo | ✅ |
| Supabase RLS active | Data per user isolation | ✅ |
| Audit immutability | SHA-256 verified | ✅ |
| KYC + 2FA enforced pre-trade | From `policyEngine` | ✅ |
| Global cooldown control | Operational | ✅ |
| Sandbox separation | Live vs test endpoints distinct | ✅ |

---

## ✅ Acceptance Criteria

| Feature | Requirement | Result |
|----------|--------------|--------|
| Broker sandbox connectivity | Zerodha / Binance / Alpaca all return healthy | ✅ |
| AI → Router → Broker flow | Order created, executed, and audited | ✅ |
| Risk Guard | Blocks invalid trades | ✅ |
| Audit Hash | 64-char hash logged | ✅ |
| Webhook sync | Status updated properly | ✅ |
| Emergency stop | Working and logged | ✅ |
| Metrics & Alerts | Recorded in Prometheus | ✅ |
| Security & Compliance | Verified across modules | ✅ |

---

## 🚀 Final Outcome

BoltzTrader's **AI Auto-Trading System** is now validated end-to-end with:

- ✅ Autonomous AI → Broker execution loop
- ✅ Sandbox broker verification
- ✅ Comprehensive audit & risk guard checks
- ✅ Full observability & governance
- ✅ AI feedback reinforcement integration

> ✅ **Phase 9.4 Validation Complete**