# 🔐 BoltzTrader Login Setup & Verification

## 🎯 Objective
Ensure the BoltzTrader authentication system (Supabase) is properly connected, the login UI is accessible, and user sessions redirect correctly into the terminal.

---

## 🧩 1️⃣ Prerequisites
- Node.js v18+
- Supabase account (free tier is fine)
- Your BoltzTrader repo cloned and working

---

## 🧠 2️⃣ Supabase Configuration
Edit the file:
```
src/lib/supabaseClient.ts
```

Replace with your **actual project credentials** from [https://app.supabase.com](https://app.supabase.com):

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://YOUR_SUPABASE_PROJECT_URL";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

✅ Make sure both values are wrapped in quotes (`" "`).

---

## ⚙️ 3️⃣ Start the Application

Run this from your project root:

```bash
npm run dev
```

You should see:

```
VITE v5.0.0  ready in 2.3s
➜  Local: http://localhost:5173/
```

---

## 🌐 4️⃣ Access the Login UI

Open your browser and visit:

👉 [http://localhost:5173/login](http://localhost:5173/login)

### Expected:

* You'll see the **BoltzTrader Login Page**
* Fields for **Email / Password**
* Button for **Login / Sign Up**
* Optional: social login (Google, GitHub, etc.)

---

## 🔄 5️⃣ Test the Auth Flow

| Step | Action                        | Expected Result                    |
| ---- | ----------------------------- | ---------------------------------- |
| 1    | Click "Sign Up"               | Account creation form appears      |
| 2    | Enter valid email/password    | Account created in Supabase        |
| 3    | App redirects to `/dashboard` | Shows BoltzTerminal layout         |
| 4    | Refresh browser               | Session persists (still signed in) |
| 5    | Log out                       | Redirects to `/login` again        |

---

## 🧪 6️⃣ Verify Auth Events (Debug)

Open browser console → you'll see logs from:

```
AuthContext.tsx
Auth state changed: SIGNED_IN
Auth state changed: INITIAL_SESSION
```

✅ This means Supabase authentication is working perfectly.

---

## 🧰 7️⃣ Common Fixes

| Issue                                       | Fix                                                   |
| ------------------------------------------- | ----------------------------------------------------- |
| `Auth state changed: SIGNED_OUT` repeatedly | Check Supabase keys or redirect URL                   |
| Login page not found                        | Make sure `AuthRoutes` are included in `App.tsx`      |
| "Multiple GoTrueClient instances detected"  | Ensure only one `supabaseClient` is imported globally |

---

## 🧭 8️⃣ Next Step

Once login is working, you can access:

* `/dashboard` → User overview
* `/terminal` → Full trading terminal
* `/learning` → AI training progress

---

✅ **Result:**
You have a fully functional, Supabase-backed authentication system integrated with BoltzTrader's autonomous trading terminal.

🧩 **Phase Dependency:**
This setup is required before proceeding to **Phase 6 – Deployment & Cloud Integration**.