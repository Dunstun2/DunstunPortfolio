# 🚀 Deploy Now - Quick Action Guide

**Your portfolio is production-ready!** Follow these steps to deploy.

---

## ⚡ Super Quick Deploy (15 minutes)

### Step 1: Generate Secrets (2 minutes)

Open PowerShell and run:

```powershell
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Copy the output** - you'll need it in Step 3.

---

### Step 2: Setup Gmail for Email (5 minutes)

1. **Enable 2-Factor Authentication:**
   - Go to: https://myaccount.google.com/security
   - Turn on "2-Step Verification"

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" + "Other (Custom)"
   - Name it "Portfolio Backend"
   - **Copy the 16-character password** (no spaces)

---

### Step 3: Deploy to Railway + Vercel (8 minutes)

#### Deploy Backend to Railway

1. **Create Railway Account:**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub (free)

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your portfolio repository
   - Select `backend` as root directory (if asked)

3. **Add PostgreSQL Database:**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically connects it to your backend

4. **Set Environment Variables:**
   - Click your backend service
   - Go to "Variables" tab
   - Click "Raw Editor" and paste:

   ```
   NODE_ENV=production
   JWT_SECRET=<paste-the-secret-from-step-1>
   CORS_ORIGIN=https://your-username.vercel.app
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=<paste-16-char-password-from-step-2>
   SENDER_NAME=Your Full Name
   CONTACT_EMAIL=your-email@gmail.com
   ```

5. **Deploy:**
   - Railway auto-deploys
   - Wait 2-3 minutes for build
   - Click "Settings" → "Generate Domain"
   - **Copy your backend URL:** `https://your-app.railway.app`

#### Deploy Frontend to Vercel

1. **Install Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

2. **Deploy:**
   ```powershell
   cd frontend
   vercel login
   vercel
   ```

3. **Set Environment Variables:**
   ```powershell
   # Set API URL (use your Railway URL)
   vercel env add NEXT_PUBLIC_API_URL production
   # When prompted, enter: https://your-app.railway.app/api
   
   vercel env add NEXT_PUBLIC_WS_URL production
   # When prompted, enter: wss://your-app.railway.app
   
   vercel env add NEXT_PUBLIC_SITE_URL production
   # When prompted, enter: https://your-username.vercel.app
   ```

4. **Production Deploy:**
   ```powershell
   vercel --prod
   ```

5. **Get Your URL:**
   - Vercel shows: `https://your-portfolio.vercel.app`
   - **This is your live site!**

#### Update CORS (Important!)

1. Go back to Railway dashboard
2. Click your backend service → "Variables"
3. Find `CORS_ORIGIN`
4. Update with your actual Vercel URL:
   ```
   CORS_ORIGIN=https://your-portfolio.vercel.app
   ```
5. Railway auto-redeploys with new CORS setting

---

### Step 4: Create Admin Account (1 minute)

1. **Using Railway CLI:**
   ```powershell
   railway login
   cd backend
   railway run node create-admin.js
   ```

2. **Or manually:**
   - Railway Dashboard → Your backend service
   - Click "..." → "Terminal"
   - Run: `node create-admin.js`
   - Follow prompts

---

### Step 5: Test Your Live Site (1 minute)

1. **Visit your Vercel URL**
2. **Test these features:**
   - [ ] Homepage loads
   - [ ] Projects page loads
   - [ ] Contact form works
   - [ ] Go to `/admin` and login
   - [ ] Make a change in admin
   - [ ] See it update on frontend

**🎉 If everything works, you're LIVE!**

---

## 🔄 Alternative: Deploy to Render.com

**Even easier - one platform for everything:**

1. **Push to GitHub:**
   ```powershell
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Deploy to Render:**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Click "New" → "Blueprint"
   - Connect your repository
   - Render detects `render.yaml`
   - Click "Apply"

3. **Set Environment Variables:**
   - Go to your backend service
   - "Environment" tab
   - Add variables from Step 1 & 2 above

4. **Done!** Render provides URLs for both frontend and backend

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [x] Production config files created ✅
- [x] PostgreSQL drivers installed ✅
- [ ] JWT_SECRET generated (Step 1)
- [ ] Gmail App Password created (Step 2)
- [ ] Platform account created (Railway/Vercel/Render)

---

## 🆘 Troubleshooting Quick Fixes

### Backend Won't Start
**Check Railway logs:**
- Railway Dashboard → Service → "Logs" tab
- Look for error messages
- Usually: missing environment variable

### CORS Error in Browser
**Fix:**
1. Railway → Backend → Variables
2. Update `CORS_ORIGIN` to match your Vercel URL exactly
3. Must include `https://`

### Email Not Sending
**Check:**
1. SMTP_PASS has no spaces (16 characters only)
2. You're using App Password, not Gmail password
3. Check Railway logs for email errors

### Database Connection Failed
**Fix:**
- Railway automatically sets DATABASE_URL
- If using manual DB, check all DB_ variables are set
- Verify DB_SSL=true for hosted databases

### Admin Login Not Working
**Fix:**
1. Make sure you created admin user (Step 4)
2. Check if migrations ran (Railway logs)
3. Try resetting admin password via Railway terminal

---

## 📞 Get Help

### Documentation
- **Complete Guide:** `PRODUCTION_SETUP_GUIDE.md`
- **Environment Variables:** `ENVIRONMENT_VARIABLES_QUICK_REF.md`
- **Config Summary:** `PRODUCTION_CONFIG_SUMMARY.md`

### Platform Support
- **Railway:** https://discord.gg/railway
- **Vercel:** https://vercel.com/help
- **Render:** https://render.com/docs

---

## 🎯 What Happens After Deploy

### Automatic Features
- ✅ SSL/HTTPS enabled automatically
- ✅ Auto-deploy on git push (after initial setup)
- ✅ Database backups (on Railway/Render)
- ✅ Uptime monitoring (check platform dashboards)

### You Should Do
1. **Change admin password** after first login
2. **Add content** via admin panel
3. **Test contact form** thoroughly
4. **Setup custom domain** (optional, $10-15/year)
5. **Share your portfolio!** 🎉

---

## 🔒 Security Checklist

After deployment, verify:

- [ ] Admin password is strong and changed from default
- [ ] JWT_SECRET is not a test/example value
- [ ] HTTPS is enabled (should be automatic)
- [ ] .env files are NOT in git repository
- [ ] Database has strong password (Railway/Render handle this)

---

## 💰 Cost Breakdown

### Free Tier (Good for Starting)

**Railway:**
- $5 credit/month (free)
- PostgreSQL included
- Covers backend + database

**Vercel:**
- 100GB bandwidth/month (free)
- Unlimited deployments
- Covers frontend

**Total: FREE** for small to medium traffic

### Paid Tier (If Needed)

**Railway:**
- $5/month after free credit
- ~100k requests/month

**Vercel:**
- Free tier usually sufficient
- Pro: $20/month (only if needed)

**Custom Domain:**
- $10-15/year (Namecheap, Google Domains)

**Total: ~$5-25/month** depending on traffic

---

## ✅ You're All Set!

**Follow Step 1-5 above and you'll be live in 15 minutes!**

### Need More Detail?

**Read:** `PRODUCTION_SETUP_GUIDE.md` for comprehensive instructions.

### Ready to Deploy?

**Start with Step 1** above! 🚀

---

**Good luck! Your portfolio will be live soon! 🎉**

**Last Updated:** July 24, 2026
