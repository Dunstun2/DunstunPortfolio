# 🔐 Environment Variables Quick Reference

Quick copy-paste guide for setting up production environment variables.

---

## 🎯 Railway Deployment

### Backend Service Variables

```bash
# Security
NODE_ENV=production
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">

# Database (Railway auto-provides DATABASE_URL)
# No need to set manually if using Railway PostgreSQL

# CORS - Update with your Vercel frontend URL
CORS_ORIGIN=https://your-app.vercel.app

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=<your-gmail-app-password>
SENDER_NAME=Your Full Name
CONTACT_EMAIL=your-email@gmail.com

# Optional: Redis (if you add Railway Redis)
# Railway auto-provides REDIS_URL if you add Redis service
```

### Frontend (Vercel) Variables

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

---

## 🎯 Render.com Deployment

### Backend Web Service Variables

```bash
NODE_ENV=production
JWT_SECRET=<generate-secure-secret>
PORT=5000

# Database - Render provides this
DATABASE_URL=<internal-database-url-from-render>

CORS_ORIGIN=https://your-frontend.onrender.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=<app-password>
SENDER_NAME=Your Name
CONTACT_EMAIL=your-email@gmail.com
```

### Frontend Static Site Variables

```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_WS_URL=wss://your-backend.onrender.com
NEXT_PUBLIC_SITE_URL=https://your-frontend.onrender.com
```

---

## 🎯 Vercel (Full Stack) Deployment

If hosting backend as serverless functions on Vercel:

```bash
# Same variables but all in Vercel
# Run: vercel env add <VARIABLE_NAME> production

DATABASE_URL=<your-postgres-url>
JWT_SECRET=<secure-secret>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=<app-password>

NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

---

## 🎯 VPS/Custom Server

### Backend `.env` file

```bash
# Copy this entire block into: /var/www/portfolio/backend/.env

NODE_ENV=production
PORT=5000

# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_generated_secret_here

# PostgreSQL Database
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portfolio_production
DB_USER=portfolio_user
DB_PASSWORD=your_db_password
DB_SSL=false

# CORS - Your domain
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_password
SENDER_NAME=Your Name
CONTACT_EMAIL=your-email@gmail.com
```

### Frontend `.env.production` file

```bash
# Copy this into: /var/www/portfolio/frontend/.env.production

NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_WS_URL=wss://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## 📧 Gmail App Password Setup

**Step-by-Step:**

1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification" (if not already enabled)
3. Go to: https://myaccount.google.com/apppasswords
4. Select:
   - App: "Mail"
   - Device: "Other (Custom name)" → Type: "Portfolio Backend"
5. Click "Generate"
6. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)
7. Paste into `SMTP_PASS` **without spaces**: `xxxxxxxxxxxxxxxx`

**Alternative Email Providers:**

### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<your_sendgrid_api_key>
```

### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=<your_mailgun_password>
```

### AWS SES
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=<your_ses_smtp_username>
SMTP_PASS=<your_ses_smtp_password>
```

---

## 🔑 Secret Generation Commands

### Generate JWT Secret (64 bytes)
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Generate Session Secret (32 bytes)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Generate Random Password
```bash
node -e "console.log(require('crypto').randomBytes(20).toString('base64'))"
```

---

## 🧪 Test Your Configuration

### Test Backend Connection
```bash
curl https://your-backend-url.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-07-24T..."
}
```

### Test Database Connection
```bash
curl https://your-backend-url.com/api/settings
```

Should return settings data (empty array is OK).

### Test Email (from backend server)
```bash
node -e "
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

transporter.sendMail({
  from: process.env.SMTP_USER,
  to: process.env.CONTACT_EMAIL,
  subject: 'Test Email',
  text: 'If you receive this, email is configured correctly!'
}, (err, info) => {
  if (err) console.error('❌ Error:', err.message);
  else console.log('✅ Email sent:', info.messageId);
  process.exit(0);
});
"
```

---

## 🚨 Security Checklist

Before going live, verify:

- [ ] `JWT_SECRET` is at least 64 characters long
- [ ] `JWT_SECRET` is different from any example/default values
- [ ] All `.env` files are in `.gitignore`
- [ ] `NODE_ENV=production` is set
- [ ] CORS_ORIGIN matches your actual frontend URL(s)
- [ ] Database password is strong (16+ characters)
- [ ] SMTP password is an App Password (not your actual Gmail password)
- [ ] No secrets are hardcoded in source files
- [ ] SSL/HTTPS is enabled
- [ ] Admin password is changed from default

---

## 📋 Platform-Specific Tips

### Railway
- ✅ Automatically sets `DATABASE_URL` when you add PostgreSQL
- ✅ Automatically sets `REDIS_URL` when you add Redis
- ✅ Variables available in app immediately after saving
- ✅ Can set variables via CLI: `railway variables set KEY=value`

### Vercel
- ✅ Variables set per environment (production, preview, development)
- ✅ Can import from `.env` file
- ✅ Automatically encrypts sensitive variables
- ✅ Use Vercel CLI: `vercel env add KEY production`

### Render
- ✅ Can use Blueprint (render.yaml) for auto-setup
- ✅ Supports Environment Groups for shared variables
- ✅ Auto-deploys on git push
- ✅ Free SSL for all services

### VPS
- ✅ Create `.env` file manually
- ✅ Set proper file permissions: `chmod 600 .env`
- ✅ Never commit `.env` to git
- ✅ Keep backups of `.env` in secure location

---

## 🔄 Updating Variables After Deployment

### Railway
```bash
railway variables set VARIABLE_NAME=new_value
```

### Vercel
```bash
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production
```

### Render
- Dashboard → Service → Environment tab → Edit

### VPS
```bash
ssh user@server
nano /var/www/portfolio/backend/.env
# Edit variable
pm2 restart portfolio-backend
```

---

## ✅ Quick Validation

**All variables are set correctly if:**

1. ✅ Backend starts without errors
2. ✅ Database connection succeeds
3. ✅ `/api/health` endpoint returns 200
4. ✅ `/api/settings` returns data
5. ✅ Contact form sends email
6. ✅ Admin login works
7. ✅ Real-time updates work
8. ✅ No CORS errors in browser console

---

**Keep this reference handy during deployment!**

**Last Updated:** July 24, 2026
