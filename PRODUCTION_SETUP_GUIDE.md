# 🚀 Production Setup Guide

Complete step-by-step guide for deploying your portfolio to production.

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Platform-Specific Setup](#platform-specific-setup)
3. [Environment Variables Configuration](#environment-variables-configuration)
4. [Database Migration](#database-migration)
5. [Testing Production Build](#testing-production-build)
6. [Going Live](#going-live)
7. [Post-Deployment](#post-deployment)

---

## 📝 Pre-Deployment Checklist

### ✅ Files Created

Your project now has production-ready configuration files:

**Backend:**
- ✅ `.env.production` - Production environment variables template
- ✅ `config/database.production.js` - PostgreSQL configuration
- ✅ `config/sequelize-config.js` - Sequelize CLI configuration
- ✅ Updated `config/database.js` - Auto-detects environment
- ✅ Updated `server.js` - Production CORS handling

**Frontend:**
- ✅ `.env.production` - Frontend production variables
- ✅ Updated `next.config.ts` - Security headers & optimizations

**Platform Configs:**
- ✅ `.railway.json` - Railway deployment config
- ✅ `render.yaml` - Render.com blueprint
- ✅ `vercel.json` - Vercel configuration
- ✅ `Procfile` - Heroku deployment config

### 📦 Required Actions Before Deployment

1. **Install PostgreSQL Driver:**
   ```powershell
   cd backend
   npm install pg pg-hstore
   ```

2. **Generate Secure Secrets:**
   ```powershell
   # Generate JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Generate SESSION_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Update .gitignore:**
   Already configured, but verify:
   - ✅ `.env*` files excluded (except `.env.example`)
   - ✅ `database.sqlite` excluded
   - ✅ `node_modules/` excluded

---

## 🎯 Platform-Specific Setup

Choose your deployment platform and follow the guide:

### Option 1: Railway (Recommended) ⭐

**Why Railway?**
- Free PostgreSQL database included
- Auto-deploy from GitHub
- Simple environment variable management
- Great for backend API
- $5/month after free tier

**Setup Steps:**

1. **Create Railway Account:**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend:**
   ```powershell
   # From project root
   cd backend
   railway login
   railway init
   railway link
   ```

3. **Add PostgreSQL Database:**
   - In Railway dashboard: "New" → "Database" → "PostgreSQL"
   - Railway automatically sets `DATABASE_URL` environment variable

4. **Set Environment Variables:**
   Go to your service → "Variables" tab and add:
   ```
   NODE_ENV=production
   JWT_SECRET=<your-generated-secret>
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   
   # Email config
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SENDER_NAME=Your Name
   CONTACT_EMAIL=your-email@gmail.com
   
   # Redis (optional - Railway provides this)
   # Click "New" → "Database" → "Redis" to add
   ```

5. **Deploy:**
   ```powershell
   railway up
   ```

6. **Get Your Backend URL:**
   - Dashboard → Settings → "Generate Domain"
   - Save this URL: `https://your-app.railway.app`

---

### Option 2: Vercel (Frontend) + Railway (Backend)

**Best Combination for Full-Stack:**

**Step 1: Deploy Backend to Railway** (follow Option 1 above)

**Step 2: Deploy Frontend to Vercel:**

1. **Install Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

2. **Deploy from Frontend Directory:**
   ```powershell
   cd frontend
   vercel
   ```

3. **Set Environment Variables in Vercel:**
   ```powershell
   vercel env add NEXT_PUBLIC_API_URL production
   # Enter: https://your-backend.railway.app/api
   
   vercel env add NEXT_PUBLIC_WS_URL production
   # Enter: wss://your-backend.railway.app
   
   vercel env add NEXT_PUBLIC_SITE_URL production
   # Enter: https://your-domain.vercel.app
   ```

4. **Production Deploy:**
   ```powershell
   vercel --prod
   ```

5. **Update Backend CORS:**
   - Go to Railway → Backend service → Variables
   - Update `CORS_ORIGIN` to your Vercel domain:
     ```
     CORS_ORIGIN=https://your-app.vercel.app,https://your-custom-domain.com
     ```

---

### Option 3: Render.com (Backend + Frontend)

**Why Render?**
- Free tier available for both
- PostgreSQL included
- Simple blueprint deployment
- Auto-SSL certificates

**Setup Steps:**

1. **Create Render Account:**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Deploy Using Blueprint:**
   - Dashboard → "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` and set up everything automatically

3. **Manual Setup (Alternative):**

   **Backend Service:**
   - "New" → "Web Service"
   - Connect GitHub repo
   - Settings:
     ```
     Name: portfolio-backend
     Root Directory: backend
     Build Command: npm install && npx sequelize-cli db:migrate
     Start Command: npm start
     ```

   **Database:**
   - "New" → "PostgreSQL"
   - Name: `portfolio-db`
   - Copy the "Internal Database URL"

4. **Set Environment Variables:**
   - Go to service → "Environment" tab
   - Add all variables from `.env.production`
   - Use the database URL from Render

5. **Deploy Frontend:**
   - "New" → "Static Site"
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `.next`

---

### Option 4: Traditional VPS (DigitalOcean, Linode, etc.)

**For Advanced Users - Full Control:**

1. **Create Droplet/Server:**
   - Ubuntu 22.04 LTS
   - Minimum: 1GB RAM, 1 CPU
   - Recommended: 2GB RAM, 2 CPUs

2. **Initial Server Setup:**
   ```bash
   # SSH into server
   ssh root@your-server-ip
   
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs
   
   # Install PostgreSQL
   apt install -y postgresql postgresql-contrib
   
   # Install Nginx
   apt install -y nginx
   
   # Install PM2 (process manager)
   npm install -g pm2
   
   # Install Certbot (SSL certificates)
   apt install -y certbot python3-certbot-nginx
   ```

3. **Setup PostgreSQL:**
   ```bash
   # Switch to postgres user
   sudo -u postgres psql
   
   # Create database and user
   CREATE DATABASE portfolio_production;
   CREATE USER portfolio_user WITH ENCRYPTED PASSWORD 'your-secure-password';
   GRANT ALL PRIVILEGES ON DATABASE portfolio_production TO portfolio_user;
   \q
   ```

4. **Deploy Backend:**
   ```bash
   # Clone your repository
   cd /var/www
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio/backend
   
   # Install dependencies
   npm install --production
   
   # Create .env file
   nano .env
   # Paste your production environment variables
   
   # Run migrations
   NODE_ENV=production npx sequelize-cli db:migrate
   
   # Start with PM2
   pm2 start server.js --name portfolio-backend
   pm2 save
   pm2 startup
   ```

5. **Deploy Frontend:**
   ```bash
   cd /var/www/portfolio/frontend
   
   # Create .env.production
   nano .env.production
   # Add your production variables
   
   # Build
   npm install
   npm run build
   
   # Start with PM2
   pm2 start npm --name portfolio-frontend -- start
   pm2 save
   ```

6. **Configure Nginx:**
   ```bash
   nano /etc/nginx/sites-available/portfolio
   ```
   
   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       # Frontend
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       
       # WebSocket
       location /socket.io {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```
   
   Enable site:
   ```bash
   ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

7. **Setup SSL Certificate:**
   ```bash
   certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

---

## 🔐 Environment Variables Configuration

### Backend Variables (Required)

Copy from `backend/.env.production` and fill in:

```bash
# CRITICAL - Must Change
JWT_SECRET=<generate-with-crypto-command>
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.com

# Database (Railway/Render provides DATABASE_URL automatically)
DATABASE_URL=postgresql://user:password@host:port/database

# OR individual variables:
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=portfolio_production
DB_USER=postgres
DB_PASSWORD=<secure-password>
DB_SSL=true

# Email (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=<16-char-app-password>
SENDER_NAME=Your Name
CONTACT_EMAIL=your-email@gmail.com
```

### Frontend Variables (Required)

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_WS_URL=wss://your-backend-url.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Getting Gmail App Password

1. Enable 2FA on your Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Select "Mail" and your device
4. Copy the 16-character password
5. Use it in `SMTP_PASS` (no spaces)

---

## 💾 Database Migration

### Automatic Migration (Railway/Render)

These platforms run migrations automatically on deployment:

```json
// Already configured in package.json
"postinstall": "npm run migrate:prod || true"
```

### Manual Migration

If you need to run migrations manually:

```bash
# SSH into your server or use platform CLI
cd backend
NODE_ENV=production npx sequelize-cli db:migrate
```

### Create Admin User

After migration, create your admin account:

```bash
cd backend
node create-admin.js
```

Or manually via CLI:

```bash
node -e "
const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('YourSecurePassword123!', 10);
  await User.create({
    name: 'Admin',
    email: 'admin@yourdomain.com',
    password: hashedPassword,
    role: 'admin'
  });
  console.log('✅ Admin user created!');
  process.exit(0);
}

createAdmin().catch(console.error);
"
```

---

## 🧪 Testing Production Build

### Test Backend Locally

1. **Set Production Environment:**
   ```powershell
   cd backend
   $env:NODE_ENV="production"
   ```

2. **Start Server:**
   ```powershell
   npm start
   ```

3. **Test Endpoints:**
   ```powershell
   # Health check
   curl http://localhost:5000/api/health
   
   # Get settings
   curl http://localhost:5000/api/settings
   
   # Get projects
   curl http://localhost:5000/api/projects
   ```

### Test Frontend Locally

1. **Build Frontend:**
   ```powershell
   cd frontend
   npm run build
   ```

2. **Test Production Build:**
   ```powershell
   npm run start
   ```

3. **Test in Browser:**
   - Open: http://localhost:3000
   - Test all pages and features
   - Check browser console for errors

4. **Run Lighthouse Audit:**
   - Open Chrome DevTools
   - Lighthouse tab
   - Generate report
   - Target: Performance 90+, SEO 90+

---

## 🎉 Going Live

### Final Checklist

- [ ] All environment variables set
- [ ] Database migrations completed
- [ ] Admin user created
- [ ] Test endpoints working
- [ ] Frontend builds successfully
- [ ] CORS configured correctly
- [ ] Email sending tested
- [ ] SSL certificate active (HTTPS)
- [ ] Custom domain configured (if applicable)

### Deploy Commands

**Railway:**
```powershell
railway up
```

**Vercel:**
```powershell
vercel --prod
```

**Render:**
- Auto-deploys on git push to main

**Manual (VPS):**
```bash
git pull origin main
cd backend && npm install && pm2 restart portfolio-backend
cd ../frontend && npm install && npm run build && pm2 restart portfolio-frontend
```

---

## 🔍 Post-Deployment

### Immediate Testing

1. **Test All Pages:**
   - [ ] Homepage loads
   - [ ] Projects page loads
   - [ ] Services page loads
   - [ ] Contact form works
   - [ ] Admin login works
   - [ ] Admin CRUD operations work

2. **Test Email:**
   - [ ] Submit contact form
   - [ ] Verify email received
   - [ ] Check spam folder

3. **Test Real-time Features:**
   - [ ] Open admin panel
   - [ ] Make a change
   - [ ] Verify frontend updates instantly

### Monitor Logs

**Railway:**
```powershell
railway logs
```

**Render:**
- Dashboard → Your service → Logs tab

**VPS:**
```bash
pm2 logs portfolio-backend
pm2 logs portfolio-frontend
```

### Setup Monitoring

1. **Uptime Monitoring:**
   - [UptimeRobot](https://uptimerobot.com) - Free
   - [Pingdom](https://www.pingdom.com)
   - Monitor your domain every 5 minutes

2. **Error Tracking:**
   - [Sentry](https://sentry.io) - Error tracking
   - [LogRocket](https://logrocket.com) - Session replay

3. **Analytics:**
   - Vercel Analytics (auto-enabled on Vercel)
   - Google Analytics
   - [Plausible](https://plausible.io) - Privacy-friendly

### Backup Strategy

**Database Backups:**

Railway/Render provide automatic backups, or set up manual:

```bash
# Backup script (save as backup.sh)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
# Upload to S3 or cloud storage
```

Schedule with cron:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## 🆘 Troubleshooting

### Common Issues

**1. Database Connection Failed:**
```
✗ Solution:
- Verify DATABASE_URL is correct
- Check database is running
- Verify SSL settings match database requirements
- Check firewall allows connections
```

**2. CORS Error in Browser:**
```
✗ Solution:
- Update CORS_ORIGIN in backend environment variables
- Include both www and non-www versions
- Restart backend service
```

**3. Email Not Sending:**
```
✗ Solution:
- Verify Gmail App Password (16 chars, no spaces)
- Check SMTP settings
- Enable "Less secure app access" (if not using App Password)
- Check backend logs for errors
```

**4. 502 Bad Gateway:**
```
✗ Solution:
- Check backend is running
- Verify PORT environment variable
- Check backend logs
- Restart service
```

**5. Build Failed:**
```
✗ Solution:
- Check Node version (18+ required)
- Verify all dependencies installed
- Check build logs for specific errors
- Clear build cache and rebuild
```

---

## 📞 Support Resources

### Platform Documentation

- **Railway:** https://docs.railway.app
- **Vercel:** https://vercel.com/docs
- **Render:** https://render.com/docs
- **Next.js:** https://nextjs.org/docs
- **Sequelize:** https://sequelize.org/docs

### Community

- **Railway Discord:** https://discord.gg/railway
- **Vercel Discord:** https://vercel.com/discord
- **Next.js Discord:** https://nextjs.org/discord

---

## ✅ Success!

**Congratulations! Your portfolio is now live in production! 🎉**

### Next Steps

1. Share your portfolio URL
2. Update your resume/LinkedIn with the link
3. Submit to search engines
4. Monitor analytics
5. Keep content updated
6. Regular maintenance (monthly dependency updates)

---

**Document Version:** 1.0  
**Created:** July 24, 2026  
**Platform Support:** Railway, Vercel, Render, VPS
