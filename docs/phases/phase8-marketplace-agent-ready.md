# 🚀 Phase 8 — Marketplace Layer (Agent-Ready)

**Goal:** Build a marketplace where users can publish, share, sell, rate and install trading strategies.  
This file is a complete, copy-pasteable, agent-run plan (folders, migrations, API skeletons, frontend pages, tests, CI notes) so an autonomous agent can implement Phase 8 end-to-end.

---

## 📁 Folder structure (create exactly)

```
/services/marketplace/
├─ api/
│   ├─ main.py
│   ├─ routes/
│   │   ├─ strategies.py
│   │   ├─ purchases.py
│   │   ├─ creators.py
│   │   └─ webhooks.py
│   └─ deps.py
├─ models/
│   └─ schemas.py
├─ payments/
│   ├─ stripe_adapter.py
│   └─ razorpay_adapter.py
├─ workers/
│   └─ payouts_worker.py
├─ tests/
│   ├─ test_strategies.py
│   └─ test_purchase_flow.py
├─ Dockerfile
└─ README.md

/frontend/src/pages/marketplace/
├─ Explore.tsx
├─ StrategyPage.tsx
├─ CreatorDashboard.tsx
├─ PurchaseModal.tsx
└─ AdminModeration.tsx
```

---

## 🗄️ Database migrations

Create file: `migrations/20250xxxx_marketplace.sql`

```sql
-- marketplace: strategy listings, purchases, payouts, ratings
CREATE TABLE IF NOT EXISTS strategy_marketplace (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id uuid REFERENCES strategies(id) ON DELETE CASCADE,
  creator_id uuid REFERENCES users(id),
  title text NOT NULL,
  description text,
  price numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  is_public boolean DEFAULT true,
  is_paid boolean DEFAULT false,
  tags text[] DEFAULT ARRAY[]::text[],
  avg_rating numeric DEFAULT 0,
  total_reviews int DEFAULT 0,
  total_sales int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS strategy_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES strategy_marketplace(id),
  buyer_id uuid REFERENCES users(id),
  amount numeric,
  currency text,
  payment_provider text,
  payment_reference text,
  status text DEFAULT 'pending', -- pending, completed, refunded, failed
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS creator_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES users(id),
  amount numeric,
  currency text,
  provider text,
  provider_reference text,
  status text DEFAULT 'queued', -- queued, paid, failed
  requested_at timestamptz DEFAULT now(),
  paid_at timestamptz
);

CREATE TABLE IF NOT EXISTS strategy_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES strategy_marketplace(id),
  user_id uuid REFERENCES users(id),
  rating int CHECK (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- simple index for search/filter
CREATE INDEX IF NOT EXISTS idx_strategy_tags ON strategy_marketplace USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_listing_creator ON strategy_marketplace (creator_id);
```

---

## 🔌 API: FastAPI skeleton (agent should create files)

**Install (Python):**

```bash
cd services/marketplace
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn pydantic asyncpg sqlalchemy sqlalchemy[asyncio] aiohttp
```

**File: `services/marketplace/api/main.py`**

```py
from fastapi import FastAPI
from .routes import strategies, purchases, creators, webhooks

app = FastAPI(title="BoltzTrader Marketplace")

app.include_router(strategies.router, prefix="/api/marketplace/strategies", tags=["strategies"])
app.include_router(purchases.router, prefix="/api/marketplace/purchases", tags=["purchases"])
app.include_router(creators.router, prefix="/api/marketplace/creators", tags=["creators"])
app.include_router(webhooks.router, prefix="/api/marketplace/webhooks", tags=["webhooks"])

@app.get("/health")
async def health():
    return {"status": "ok"}
```

**File: `services/marketplace/api/routes/strategies.py`**

```py
from fastapi import APIRouter, Depends, HTTPException
from ...models.schemas import ListingCreateSchema, ListingOutSchema
from typing import List

router = APIRouter()

# NOTE: replace with real DB dependency
@router.post("/", response_model=ListingOutSchema)
async def create_listing(payload: ListingCreateSchema, user=Depends(...)):
    # verify user is creator & has KYC if required (use policyEngine.enforcePolicy)
    # insert into strategy_marketplace
    return {...}

@router.get("/", response_model=List[ListingOutSchema])
async def list_listings(q: str = None, page: int = 1, limit: int = 20):
    # search + pagination
    return []
```

**File: `services/marketplace/api/routes/purchases.py`**

```py
from fastapi import APIRouter, HTTPException
router = APIRouter()

@router.post("/{listing_id}/purchase")
async def purchase_listing(listing_id: str, user=Depends(...)):
    # create purchase record status=pending
    # create payment intent via payment adapter (stripe/razorpay)
    # return client_secret or payment url
    return {"payment_url": "..."}
```

**File: `services/marketplace/api/routes/webhooks.py`**

```py
from fastapi import APIRouter, Request, Header
router = APIRouter()

@router.post("/payment")
async def payment_webhook(request: Request, x_signature: str = Header(None)):
    payload = await request.body()
    # verify signature with adapter -> update purchase status, grant access, log audit
    return {"ok": True}
```

**File: `services/marketplace/models/schemas.py`** (Pydantic)

```py
from pydantic import BaseModel
from typing import List, Optional

class ListingCreateSchema(BaseModel):
    strategy_id: str
    title: str
    description: Optional[str]
    price: float = 0.0
    currency: str = "USD"
    tags: List[str] = []

class ListingOutSchema(ListingCreateSchema):
    id: str
    creator_id: str
    created_at: str
```

---

## 💳 Payments adapters (agent to implement)

Create `payments/stripe_adapter.py` and `payments/razorpay_adapter.py` with:

* `create_payment_intent(listing, buyer)` → returns client secret or payment URL
* `verify_webhook(request)` → validate signature and return event
* `capture_payment(payment_reference)` → optional (for providers requiring capture)
* Use provider SDKs; secrets read from environment vars.

**Security:** never return provider secret to frontend. Use server-side to create intents and webhooks.

---

## 🧾 Key backend behaviors (must implement)

1. **Purchase flow**

   * POST `/purchase` creates `strategy_purchases` row with `status='pending'`
   * Server calls payment adapter; returns client-side token or url.
   * Webhook updates purchase status to `completed` and:

     * increments `total_sales` on listing
     * creates audit entry (`logAudit('marketplace_purchase', ...)`)
     * grants buyer access to strategy (e.g., write to `user_strategy_access` table or issue entitlement)

2. **Granting access**

   * After successful purchase, store entitlement:

     ```
     INSERT INTO user_strategy_access (user_id, strategy_id, listing_id, purchased_at)
     ```
   * Frontend checks this table to enable "Install" button.

3. **Refunds**

   * Admin/manual flow to refund payments. On refund:

     * mark purchase `status='refunded'`
     * decrement `total_sales`
     * revoke entitlement if needed
     * log audit and issue payout reversal

4. **Creator payouts**

   * Periodic worker (Celery/RQ) picks completed purchases, aggregates unpaid amounts, creates `creator_payouts` rows and calls payout provider (Stripe Connect, Razorpay Payouts).
   * Mark payouts `paid` or `failed`, log audit.

5. **Moderation**

   * Admin endpoints to: `approve`, `ban`, `remove` listing; flagged listings go to moderation queue.

---

## 🧩 Frontend pages & interactions

Create React pages/components in `/frontend/src/pages/marketplace/`:

* **Explore.tsx** — list listings with filters (tags, price, rating). Pagination.
* **StrategyPage.tsx** — show listing details, backtest chart (embed), XAI explanation, Install / Purchase button.
* **PurchaseModal.tsx** — payment options: card, UPI (Razorpay), coupons. Use Stripe Elements or provider redirect.
* **CreatorDashboard.tsx** — creator earnings, sales chart, withdraw button (requests payout).
* **AdminModeration.tsx** — list flagged listings, approve/ban, refund support.

**Client behavior:**

* All purchases call `/api/marketplace/purchases/:id/purchase`
* After successful payment, client polls `/api/marketplace/purchases/:id` until `status: completed` then shows "Install" button.

---

## ✅ Tests (automated)

Add tests to `services/marketplace/tests/`:

* `test_create_listing` — create listing as creator, assert DB row.
* `test_purchase_flow` — mock payment adapter (simulate webhook), assert entitlement created, sales incremented.
* `test_payout_worker` — simulate queued payouts, assert payout rows and status changes.

Run with pytest or chosen test runner.

---

## 🛠️ CI / GitHub Actions (simple)

Create `.github/workflows/marketplace-ci.yml`:

```yaml
name: Marketplace CI

on:
  push:
    paths:
      - 'services/marketplace/**'
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install deps
        run: |
          cd services/marketplace
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd services/marketplace
          pytest -q
```

(Agent must create `requirements.txt` with test deps.)

---

## 🔐 Environment variables (required)

Add these to deployment environment (Vercel/Render/GKE secrets):

```
DATABASE_URL=postgres://...
STRIPE_SECRET_KEY=sk_...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
PLATFORM_FEE_PERCENT=30
SUPABASE_SERVICE_KEY=...
PAYMENT_WEBHOOK_SECRET_STRIPE=...
PAYMENT_WEBHOOK_SECRET_RAZORPAY=...
```

---

## 🧭 Run & dev commands (agent-run)

```bash
# from repository root:
# 1. Create migration and run it (example using psql)
psql $DATABASE_URL -f migrations/20250xxxx_marketplace.sql

# 2. Run the API locally
cd services/marketplace
uvicorn api.main:app --reload --port 8005

# 3. Frontend dev (from repo root)
cd frontend
npm install
npm run dev

# 4. Run tests
cd services/marketplace
pytest
```

---

## ✅ Acceptance Criteria (agent must mark done)

* [ ] Listings CRUD implemented & persisted
* [ ] Purchase flow implemented with at least one provider (Stripe or Razorpay) and webhook verified
* [ ] Entitlement granted on successful purchase (buyer can "Install")
* [ ] Creator dashboard shows sales & earnings; can request payout
* [ ] Payout worker enqueues & processes payout requests (mocked in dev)
* [ ] Admin moderation UI & endpoints implemented
* [ ] Unit + integration tests exist and pass in CI
* [ ] Audit logs created for purchases, refunds, payouts using `logAudit(...)` (Phase 7 utility)
* [ ] Documentation updated: `services/marketplace/README.md` and `docs/phases/phase8-marketplace.md`

---

## 🧾 Notes & recommendations (do not skip)

* **Start with Stripe in dev** (easier SDK). Add Razorpay for India later.
* **Use webhooks** for final confirmation; don't trust client success only.
* **Protect files with RLS** where applicable (Supabase RLS policies).
* **Use existing audit + XAI systems** (Phase 7) for all critical operations: purchases, payouts, refunds.
* **Sandbox first:** run payments in test mode, store sandbox credentials separately.
* **Privacy / GDPR:** provide endpoint to erase buyer purchase data on request (with audit trail).
* **Rate-limit** endpoints to prevent abuse (purchase endpoints especially).

---

## Final Deliverables (what agent must commit)

* `services/marketplace/` full service (API, adapters, worker)
* `migrations/20250xxxx_marketplace.sql`
* `frontend/src/pages/marketplace/*` UI pages
* `.github/workflows/marketplace-ci.yml`
* Tests and README

---

> ✅ **Phase 8 Complete – Marketplace Layer Implemented**
> BoltzTrader becomes a **strategy marketplace platform** where creators can monetize AI trading strategies.