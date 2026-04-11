# Custom Domain Setup — Step-by-Step Instructions

**Status:** ✅ Domain registered — pending Railway + Supabase configuration

**Current Production URL:** https://caltrack-pro-production.up.railway.app

---

## What's Completed (April 2026)

Code changes are already done:
- ✅ `backend/notifications.py` updated with `APP_URL = "https://calcheq.com"`
- ✅ `frontend/index.html` has correct OG tags, meta description, canonical URL
- ✅ Railway env vars set: SUPABASE_JWT_SECRET, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_DEMO_EMAIL, VITE_DEMO_PASSWORD

---

## Steps to Complete After Domain Purchase

### Step 1: Add Custom Domain in Railway

**Location:** https://railway.app/project → [Caltrack-pro project] → **Settings** → **Domains**

1. Click **"Add custom domain"**
2. Enter: `calcheq.com`
3. Railway will show you a **CNAME target** (looks like `something.up.railway.app`)
4. **Copy this value** — you'll need it for Step 2

**Example:**
```
Domain: calcheq.com
CNAME target: caltrack-pro-production.up.railway.app
```

---

### Step 2: Configure DNS at Cloudflare

**Location:** https://dash.cloudflare.com → Domains → calcheq.com → DNS

1. Go to **DNS Records**
2. Click **"Add record"**
3. Select **Type: CNAME**
4. **Name:** `@` (or leave blank — this is the apex/root domain)
5. **Content:** Paste the CNAME target from Step 1
6. Click **Save**

**If Cloudflare gives you an error** ("CNAME cannot be at root"):
- Cloudflare **supports CNAME flattening** — it will handle this automatically
- Alternatively, add a CNAME for `www` and set up a redirect from bare domain to www

**SSL is automatic:** Railway provisions an SSL certificate automatically once DNS propagates (usually < 5 minutes on Cloudflare).

---

### Step 3: Update Railway Environment Variable

**Location:** https://railway.app/project → [Caltrack-pro project] → **Variables**

1. Find `APP_URL` variable (should currently be `https://caltrack-pro-production.up.railway.app`)
2. Change it to: `https://calcheq.com`
3. Click **Save** — Railway will auto-redeploy

---

### Step 4: Update Supabase Auth URL Configuration

**Location:** https://supabase.com → [Caltrack-pro project] → **Authentication** → **URL Configuration**

Update **three fields:**

1. **Site URL:**
   - Change from: `https://caltrack-pro-production.up.railway.app`
   - Change to: `https://calcheq.com`

2. **Redirect URLs:** Add the new reset-password URL:
   - Add: `https://calcheq.com/auth/reset-password`
   - Keep: `https://caltrack-pro-production.up.railway.app/auth/reset-password` (for now, until you confirm the new domain works)
   - Keep: `http://localhost:5173/auth/reset-password` (local dev)

3. Click **Save**

---

## Step 5: Smoke Test (Verify Everything Works)

Once all steps above are complete:

1. **Open a fresh browser tab** and go to https://calcheq.com
   - Should load the landing page (no "Not Secure" warning)
   - Page should be fully styled (no missing assets)

2. **Sign in:** Go to https://calcheq.com/auth/sign-in
   - Try logging in with a test account
   - Session should persist (JWT should work correctly)

3. **Try Demo mode:**
   - If you see a "Try Demo" button, click it
   - Should sign you in as demo@calcheq.com automatically

4. **Password reset email:**
   - Go to https://calcheq.com/auth/forgot-password
   - Enter your email
   - Check for reset email
   - **Critical:** The reset link should use `calcheq.com`, NOT the railway.app URL

5. **API calls:**
   - Open browser DevTools (F12) → Network tab
   - Do an action that triggers an API call (e.g., sign in, visit /app/instruments)
   - Verify that `Authorization: Bearer <JWT>` header is present on requests
   - Verify requests go to https://calcheq.com/api/*, not the railway.app URL

---

## Troubleshooting

**Domain not resolving:**
- DNS propagation can take 5–15 minutes on Cloudflare, but usually < 1 minute
- Force-clear your browser cache (Ctrl+Shift+Delete) and try again
- Check that the CNAME record was saved correctly in Cloudflare DNS dashboard

**SSL certificate not issuing:**
- Wait 5–10 minutes and reload
- SSL typically provisions automatically once DNS resolves
- If it persists, check Railway dashboard for warnings

**Reset email links still point to railway.app:**
- Verify you updated both Railway's `APP_URL` variable AND Supabase's Site URL
- After updating, allow 2–3 minutes for changes to propagate to Supabase Auth
- Check that Supabase has saved the changes (look for a green checkmark)

**API calls failing with CORS errors:**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correctly set in Railway Variables
- Verify Supabase Auth redirect URLs include the new domain
- Clear browser cache completely (Ctrl+Shift+Delete, or use private/incognito window)

---

## Final Checklist

- [x] Domain registered — calcheq.com ✅
- [ ] Custom domain added in Railway
- [ ] CNAME record created in Cloudflare DNS
- [ ] Railway `APP_URL` variable updated
- [ ] Supabase Site URL updated
- [ ] Supabase redirect URLs updated
- [ ] Landing page loads on new domain
- [ ] Sign-in works on new domain
- [ ] JWT session persists
- [ ] Password reset email links use new domain
- [ ] API requests include Authorization header

---

## Domain Registration Details

**Domain:** calcheq.com  
**Registrar:** Cloudflare  
**Cost:** ~$8.99 USD/year  
**Renewal:** Automatic (unless disabled)  
**Status:** ✅ Registered  

Optional: Register `calcheq.com.au` (Australian ccTLD) and redirect to `.com`.

---

**Estimated time to complete all steps:** 15–30 minutes (mostly waiting for DNS propagation)
