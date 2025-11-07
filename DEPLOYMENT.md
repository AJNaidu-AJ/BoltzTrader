# 🚀 BoltzTrader Deployment Guide

## 📋 Quick Setup Checklist

### 1. Vercel Deployment
- [ ] Connect GitHub repo to Vercel
- [ ] Configure build settings (Vite framework)
- [ ] Add environment variables
- [ ] Deploy and get live URL

### 2. GitHub Secrets Required
Add these in **GitHub → Settings → Secrets → Actions**:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id  
VERCEL_PROJECT_ID=your_project_id
```

### 3. Environment Variables for Vercel
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

## 🔄 Automated Deployment
- Every push to `master` branch triggers automatic deployment
- GitHub Actions workflow handles build and deploy
- Live at: `https://boltztrader.vercel.app`

## 🌐 Custom Domain (Optional)
1. Purchase domain (e.g., boltztrader.com)
2. Add to Vercel project settings
3. Update DNS with CNAME record
4. Domain stays connected with automation

## ✅ Production Ready
- ✅ Automated CI/CD pipeline
- ✅ Environment variables configured
- ✅ SPA routing handled
- ✅ API CORS configured
- ✅ Build optimization enabled