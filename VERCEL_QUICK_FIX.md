# ⚡ Quick Fix: Vercel Environment Variables

## The Problem
`/dev/set-token` works locally but not on Vercel because environment variables aren't deployed automatically.

## The Solution (5 Minutes)

### 1. Login to Vercel
Go to: https://vercel.com/dashboard

### 2. Navigate to Your Project
- Click on your project (riidl-lms or learning-management-system)
- Click **"Settings"** tab
- Click **"Environment Variables"** in sidebar

### 3. Add These Variables

**Variable 1:**
- Key: `EXTERNAL_JWT_SECRET`
- Value: `test-secret-key-change-in-production`
- Environments: ✅ Production ✅ Preview ✅ Development

**Variable 2:**
- Key: `NEXT_PUBLIC_LOGIN_URL`  
- Value: `https://YOUR-APP.vercel.app/dev/set-token`
  - ⚠️ Replace `YOUR-APP` with your actual Vercel URL!

**Variable 3-5:** (If not already added)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Redeploy
- Go to **"Deployments"** tab
- Click **"..."** on latest deployment
- Click **"Redeploy"**

### 5. Test
Visit: `https://YOUR-APP.vercel.app/dev/set-token`

---

## 🔒 Security Warning

The dev token page is currently accessible in production! Add this protection:

**Option A: Block in Production**
Add to Vercel env vars:
- Key: `NODE_ENV`
- Value: `production`

The page will auto-block in production mode.

**Option B: Password Protect**
Add to Vercel env vars:
- Key: `NEXT_PUBLIC_ALLOW_DEV_TOOLS`
- Value: `true` (only if you want to allow access)

---

## 📋 Checklist

- [ ] Added `EXTERNAL_JWT_SECRET` to Vercel
- [ ] Added `NEXT_PUBLIC_LOGIN_URL` with correct URL
- [ ] Added Supabase variables
- [ ] Redeployed application
- [ ] Tested `/dev/set-token` on live site
- [ ] Added production protection

---

## 🐛 Still Not Working?

1. **Check Vercel Build Logs**
   - Deployments → Click deployment → View logs
   - Look for environment variable errors

2. **Verify Variables Are Set**
   - Settings → Environment Variables
   - Should see all 5 variables listed

3. **Clear Browser Cache**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

4. **Check Middleware**
   - Make sure `middleware.ts` is deployed
   - Check for any build errors
