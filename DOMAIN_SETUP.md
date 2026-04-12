# Custom Domain Setup

**Status: ✅ COMPLETE — calcheq.com is live**

Domain registered via Cloudflare. All steps below are complete as of April 2026.

---

## What Was Done

- ✅ Domain registered: calcheq.com (Cloudflare Registrar, ~$8.99 USD/year, auto-renew)
- ✅ Custom domain added in Railway → caltrack-pro project → Settings → Domains
- ✅ CNAME record configured in Cloudflare DNS (CNAME flattening at apex)
- ✅ SSL certificate auto-provisioned by Railway
- ✅ `APP_URL` Railway env var set to `https://calcheq.com`
- ✅ Supabase Site URL updated to `https://calcheq.com`
- ✅ Supabase redirect URLs updated (see below)
- ✅ Microsoft 365 email: info@calcheq.com active (MX, SPF, DKIM verified)

---

## Supabase Auth URL Configuration

Location: Supabase Dashboard → Authentication → URL Configuration

- **Site URL:** https://calcheq.com
- **Redirect URLs (all three must remain):**
  - https://calcheq.com/auth/reset-password
  - https://caltrack-pro-production.up.railway.app/auth/reset-password *(keep until confirmed no longer needed)*
  - http://localhost:5173/auth/reset-password *(local dev)*

---

## Railway Environment Variables (current)

| Variable                  | Value                                              |
|---------------------------|----------------------------------------------------|
| APP_URL                   | https://calcheq.com                                |
| SUPABASE_URL              | https://qdrgjjndwgrmmjvzzdhg.supabase.co           |
| VITE_SUPABASE_URL         | https://qdrgjjndwgrmmjvzzdhg.supabase.co           |
| VITE_SUPABASE_ANON_KEY    | (set in Railway)                                   |
| VITE_DEMO_EMAIL           | demo@calcheq.com                                   |
| VITE_DEMO_PASSWORD        | CalcheqDemo2026                                    |
| SUPABASE_SERVICE_ROLE_KEY | (set in Railway — keep secret, bypasses RLS)       |
| RESEND_API_KEY            | (set in Railway)                                   |
| RESEND_FROM_EMAIL         | info@calcheq.com                                   |

---

## Troubleshooting Reference

**Domain not resolving:** DNS propagation is usually < 1 min on Cloudflare. Force-clear browser cache.

**SSL not issuing:** Wait 5–10 min. Railway provisions automatically once DNS resolves.

**Reset email links point to railway.app:** Verify both `APP_URL` (Railway) and Site URL (Supabase) are updated to calcheq.com.

**API calls failing with CORS errors:** Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Railway. Clear browser cache.

---

## Optional Future

Register `calcheq.com.au` (Australian ccTLD) and redirect to `.com` — not urgent.
