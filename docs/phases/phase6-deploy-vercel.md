# 🚀 Phase 6 – Cloud Deployment & Continuous Automation (BoltzTrader)

## 🎯 Objective
Deploy BoltzTrader to a live production cloud environment (Vercel + optional backend on Render)  
and enable continuous deployment automation via GitHub Actions.

---

## 🧠 Repository Info
**GitHub:** https://github.com/AJNaidu-AJ/BoltzTrader  
**Branch:** master  
**Frontend:** React + TypeScript + Vite  
**Backend (optional):** FastAPI / Python  
**Database:** Supabase  
**AI:** OpenAI GPT-4  

---

## ⚙️ Step 1 – Connect GitHub Repo to Vercel
1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click **"Add New Project"**
3. Select your repo → `AJNaidu-AJ/BoltzTrader`
4. Click **Import**
5. Vercel auto-detects Vite.

---

## 🏗️ Step 2 – Configure Build Settings

| Setting | Value |
|----------|--------|
| Framework Preset | `Vite` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Click **Continue → Deploy**

---

## 🔐 Step 3 – Add Environment Variables
In **Vercel → Project → Settings → Environment Variables**

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
VITE_BACKEND_URL=https://boltz-api.onrender.com   # optional backend
```

---

## 🚀 Step 4 – Deploy
Click **Deploy**  
Vercel will:
- Clone your repo  
- Install dependencies  
- Build  
- Deploy live  

You'll get:
```
https://boltztrader.vercel.app
```

---

## 🌐 Step 5 – Optional Backend Setup (Render)
1. Go to [https://render.com](https://render.com)
2. Click **New → Web Service**
3. Connect same GitHub repo
4. In "Root Directory", set `/services/api`
5. Config:
```
Runtime: Python 3.11
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port 8000
```
6. Add env vars (same as above)

✅ Output:  
`https://boltz-api.onrender.com`

---

## 🔄 Step 6 – Continuous Deployment Automation
After connecting GitHub → add `.github/workflows/deploy.yml` (see below).  
This file automatically triggers a **new build on Vercel** each time you push to GitHub.

---

## 🌍 Step 7 – Add Custom Domain
After you purchase a domain:

1. Go to **Vercel → Project → Settings → Domains**
2. Add your domain name (e.g. `boltztrader.com`)
3. Update your domain's DNS:
```
CNAME → cname.vercel-dns.com
```
4. Wait 5–10 minutes.
5. Visit:  
`https://boltztrader.com`

✅ Domain remains connected even with automation.

---

## ✅ Phase Outcome

| Component | Status |
|------------|---------|
| Frontend | ✅ Live on Vercel |
| Backend | ✅ Optional on Render |
| Supabase | ✅ Connected |
| OpenAI API | ✅ Integrated |
| Auto Deploy | ✅ Configured |
| Custom Domain | 🌍 Optional |
| Monitoring | ✅ Available in Vercel |

---

> ✅ After completion:
> BoltzTrader is **cloud-hosted, automated, and production-ready**.