# 🚀 Production Deployment Checklist

## ✅ REPOSITORY STATUS: PRODUCTION READY

**Git Status:** Initialized and staged (not yet pushed)
**Test Files:** ✅ All excluded via .gitignore
**Seed Scripts:** ✅ All excluded
**Development Docs:** ✅ All excluded
**Secrets:** ✅ .env excluded
**Production Code:** ✅ All included

### Quick Deploy to GitHub:
```powershell
# Option 1: Use the automated script
.\deploy-to-github.ps1

# Option 2: Manual deployment
git commit -m "Initial production-ready commit"
git remote add origin https://github.com/yourusername/portfolio.git
git branch -M main
git push -u origin main
```

### Key Documents:
- 📘 **PRODUCTION_DEPLOYMENT_GUIDE.md** - Complete deployment guide
- 📋 **GIT_COMMIT_SUMMARY.md** - What's included/excluded
- 🚀 **deploy-to-github.ps1** - Automated deployment script
- ✅ **This file** - Full production checklist

---

### New Feature: CV-to-Portfolio Converter

**What it does:**
- Automatically converts traditional CVs (PDF, DOCX, TXT) into complete portfolio content
- Uses AI to enhance descriptions, extract keywords, and optimize content
- Maps CV sections to portfolio modules intelligently
- Provides admin interface for parsing, preview, and selective import

**Dependencies:**
- `mammoth` (DOCX parsing) - ✅ Already installed
- `pdf-parse` (PDF text extraction) - ✅ Already installed  
- `multer` (file uploads) - ✅ Already installed

**Database:**
- New migration: `20260724-create-cv-imports.js` ✅
- New model: `CVImport` with full audit trail ✅

**Files Added:**
- Backend: 4 new services, 1 controller, 1 route, 1 model, 1 migration
- Frontend: 1 new admin page with enhanced UI
- Documentation: 3 comprehensive guides

**Admin Access:**
- New navigation item: "CV Import" under Resume section
- Admin-only functionality (requires authentication)
- Drag-and-drop interface at `/admin/cv-import`

**Production Checklist for CV Import:**
- [ ] Run migration: `npx sequelize-cli db:migrate`
- [ ] Verify file upload directory exists and is writable
- [ ] Test CV upload with sample PDF/DOCX file
- [ ] Confirm admin navigation shows "CV Import" link
- [ ] Validate file size limits (10MB default)
- [ ] Test enhancement and import functionality

## Pre-Deployment Checklist

Use this checklist before deploying your portfolio to production.

---

## 📋 Phase 1: Security & Configuration

### Backend Security

- [ ] **Change JWT_SECRET**
  - File: `backend/.env`
  - Use strong random value (32+ characters)
  - Command: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

- [ ] **Update Admin Credentials**
  - Login to admin dashboard
  - Navigate to Account settings
  - Change email and password
  - Use strong password (12+ characters)

- [ ] **Set Production Environment**
  - File: `backend/.env`
  - Set `NODE_ENV=production`

- [ ] **Configure CORS**
  - File: `backend/server.js`
  - Update CORS origin to your production domain
  ```javascript
  app.use(cors({
    origin: 'https://your-domain.com'
  }));
  ```

- [ ] **Review .gitignore**
  - Ensure `.env` files NOT committed
  - Ensure `node_modules/` ignored
  - Ensure `database.sqlite` not committed (use production DB)

### Frontend Security

- [ ] **Set Production API URL**
  - File: `frontend/.env.production`
  - Set `NEXT_PUBLIC_API_URL=https://api.your-domain.com`

- [ ] **Update metadataBase**
  - File: `frontend/src/app/layout.tsx`
  - Add metadata configuration:
  ```typescript
  export const metadata = {
    metadataBase: new URL('https://your-domain.com'),
    title: 'Your Name - Portfolio',
    description: 'Your portfolio description',
  }
  ```

- [ ] **Configure Security Headers**
  - File: `frontend/next.config.ts`
  - Add security headers (CSP, HSTS, etc.)

---

## 📊 Phase 2: Database Migration

### Switch from SQLite to Production Database

**Why?** SQLite is great for development but not recommended for production.

**Options:**
1. PostgreSQL (recommended)
2. MySQL
3. MongoDB

### PostgreSQL Setup (Recommended)

**1. Install PostgreSQL:**
- Local: https://www.postgresql.org/download/
- Hosted: Heroku, Railway, Supabase, Neon, etc.

**2. Update Backend Configuration:**

File: `backend/.env`
```bash
# Replace SQLite config with PostgreSQL
DB_DIALECT=postgres
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=portfolio_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SSL=true  # For hosted databases

# Remove SQLite config
# DB_STORAGE=./database.sqlite
```

File: `backend/config/database.js`
```javascript
// Add SSL configuration for hosted databases
dialectOptions: {
  ssl: process.env.DB_SSL === 'true' ? {
    require: true,
    rejectUnauthorized: false
  } : false
}
```

**3. Run Migrations:**
```bash
cd backend
npx sequelize-cli db:migrate
```

**4. Create Admin User:**
```bash
node -e "
const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('your_secure_password', 10);
  await User.create({
    name: 'Admin',
    email: 'your-email@example.com',
    password: hashedPassword,
    role: 'admin'
  });
  console.log('Admin user created!');
  process.exit(0);
}

createAdmin();
"
```

**5. Migrate Data from SQLite (if needed):**
```bash
# Export from SQLite
sqlite3 database.sqlite .dump > backup.sql

# Import to PostgreSQL (modify as needed)
psql -h host -U user -d database < backup.sql
```

---

## 📧 Phase 3: Email Configuration

### Configure SMTP for Contact Form

**Option 1: Gmail**
```bash
# backend/.env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SENDER_NAME=Your Name
```

**Generate App Password (Gmail):**
1. Go to Google Account Settings
2. Security → 2-Step Verification → App passwords
3. Generate password for "Mail"
4. Use this password in SMTP_PASS

**Option 2: SendGrid**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

**Option 3: AWS SES**
```bash
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_ses_smtp_username
SMTP_PASS=your_ses_smtp_password
```

### Test Email Configuration

```bash
cd backend
node -e "
const EmailService = require('./services/email.service');
EmailService.sendContactConfirmation({
  to: 'your-email@example.com',
  name: 'Test User',
  subject: 'Test Message'
}).then(() => console.log('Email sent!')).catch(console.error);
"
```

---

## 🚀 Phase 4: Build & Test

### Backend Build

**1. Install Production Dependencies:**
```bash
cd backend
npm ci --only=production
```

**2. Test Backend:**
```bash
NODE_ENV=production npm start
```

**3. Verify Endpoints:**
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/projects
curl http://localhost:5000/api/settings
```

### Frontend Build

**1. Create Production Build:**
```bash
cd frontend
npm run build
```

**2. Test Production Build:**
```bash
npm run start
```

**3. Verify Pages:**
- Homepage: http://localhost:3000
- Admin: http://localhost:3000/admin
- Projects: http://localhost:3000/projects
- Services: http://localhost:3000/services

**4. Check Performance:**
- Run Lighthouse audit in Chrome DevTools
- Target scores: Performance 90+, SEO 90+

---

## 🌐 Phase 5: Domain & Hosting

### Domain Setup

**1. Purchase Domain:**
- Namecheap
- Google Domains
- Cloudflare

**2. Configure DNS:**
```
A Record:  @ → Your Server IP
A Record:  www → Your Server IP
CNAME: api → Your API Server
```

**3. SSL Certificate:**
- Let's Encrypt (free)
- Cloudflare (free with proxy)
- Your hosting provider

### Hosting Options

**Frontend Hosting:**

**Option 1: Vercel (Recommended for Next.js)**
```bash
npm i -g vercel
cd frontend
vercel
```
- Automatic builds from git
- Global CDN
- Automatic HTTPS
- Free tier available

**Option 2: Netlify**
```bash
cd frontend
npm run build
# Upload .next folder via Netlify UI
```

**Option 3: AWS Amplify**
- Connect GitHub repo
- Auto-deploy on push
- Built-in CI/CD

**Option 4: Traditional VPS (DigitalOcean, Linode, etc.)**
```bash
# On server
cd frontend
npm run build
pm2 start npm --name "portfolio-frontend" -- start
pm2 save
pm2 startup
```

**Backend Hosting:**

**Option 1: Railway**
- Connect GitHub repo
- Auto-deploy on push
- Built-in PostgreSQL
- Free tier available

**Option 2: Render**
- Free tier for web services
- Auto-deploy from git
- Built-in PostgreSQL

**Option 3: Heroku**
```bash
heroku create your-portfolio-api
git push heroku main
```

**Option 4: Traditional VPS**
```bash
# On server
cd backend
npm ci --only=production
pm2 start server.js --name "portfolio-api"
pm2 save
pm2 startup
```

---

## 🔒 Phase 6: SSL/HTTPS Setup

### Vercel/Netlify
- Automatic HTTPS ✅

### Traditional Server with Let's Encrypt

**Using Certbot:**
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (runs daily)
sudo systemctl enable certbot.timer
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend (Next.js)
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
}
```

---

## 📊 Phase 7: Monitoring & Logging

### Error Tracking

**Option 1: Sentry**
```bash
npm install @sentry/nextjs @sentry/node
```

**Frontend:** `frontend/sentry.client.config.js`
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

**Backend:** `backend/server.js`
```javascript
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your-sentry-dsn" });
```

**Option 2: LogRocket**
- Frontend session replay
- User analytics
- Error tracking

### Uptime Monitoring

**Free Options:**
- UptimeRobot (https://uptimerobot.com)
- Freshping (https://www.freshworks.com/website-monitoring/)
- StatusCake (https://www.statuscake.com)

**Setup:**
1. Create account
2. Add monitor for your domain
3. Set up alerts (email/SMS)
4. Monitor every 5-10 minutes

### Application Logs

**Backend:**
- Already configured Winston logger
- Logs stored in `backend/logs/`
- Set up log rotation:
```bash
npm install winston-daily-rotate-file
```

**Frontend:**
- Use Vercel Analytics (automatic on Vercel)
- Or Google Analytics
- Or Plausible Analytics (privacy-friendly)

---

## 🔄 Phase 8: Backup Strategy

### Database Backups

**Automated Daily Backups (PostgreSQL):**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U user database > backup_$DATE.sql
find . -name "backup_*.sql" -mtime +7 -delete  # Keep 7 days
```

**Cron Job:**
```bash
crontab -e
# Add: Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

### File Backups

**Upload Folder:**
```bash
# Sync uploads to S3
aws s3 sync backend/uploads/ s3://your-bucket/uploads/
```

**Full Backup:**
```bash
tar -czf portfolio_backup_$(date +%Y%m%d).tar.gz \
  backend/ frontend/ --exclude=node_modules
```

---

## 🧪 Phase 9: Final Testing

### Functional Tests

- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Dynamic pages load (projects, blog posts, etc.)
- [ ] Contact form submits successfully
- [ ] Email notifications received
- [ ] Admin login works
- [ ] CRUD operations work in admin
- [ ] Real-time updates working
- [ ] File uploads working
- [ ] Images display correctly

### Security Tests

- [ ] HTTPS enforced
- [ ] Admin routes protected
- [ ] SQL injection prevented (Sequelize ORM)
- [ ] XSS prevention (React escaping)
- [ ] CSRF protection enabled
- [ ] Rate limiting working
- [ ] No secrets in client-side code
- [ ] Secure headers configured

### Performance Tests

- [ ] Page load < 3 seconds
- [ ] Lighthouse score 90+
- [ ] Images optimized
- [ ] Gzip compression enabled
- [ ] CDN configured (if applicable)
- [ ] Caching headers set
- [ ] No console errors/warnings

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Responsive Design

- [ ] Mobile (320px - 768px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1024px+)
- [ ] Large screens (1920px+)

---

## 📱 Phase 10: SEO Optimization

### Meta Tags

**File:** `frontend/src/app/layout.tsx`
```typescript
export const metadata = {
  metadataBase: new URL('https://your-domain.com'),
  title: {
    default: 'Your Name - Portfolio',
    template: '%s | Your Name'
  },
  description: 'Professional portfolio showcasing projects, services, and experience',
  keywords: ['portfolio', 'web developer', 'your skills'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'Your Name - Portfolio',
    description: 'Professional portfolio',
    url: 'https://your-domain.com',
    siteName: 'Your Portfolio',
    images: ['/og-image.jpg'],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Name - Portfolio',
    description: 'Professional portfolio',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  }
}
```

### Sitemap

**File:** `frontend/src/app/sitemap.ts`
```typescript
export default function sitemap() {
  return [
    {
      url: 'https://your-domain.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://your-domain.com/projects',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Add more URLs...
  ]
}
```

### Robots.txt

**File:** `frontend/public/robots.txt`
```
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://your-domain.com/sitemap.xml
```

### Submit to Search Engines

- [ ] Google Search Console
- [ ] Bing Webmaster Tools
- [ ] Submit sitemap
- [ ] Verify ownership

---

## 🎉 Phase 11: Go Live!

### Pre-Launch Checklist

- [ ] All environment variables set
- [ ] Database migrated and backed up
- [ ] Admin credentials changed
- [ ] Email configuration tested
- [ ] SSL certificate active
- [ ] DNS propagated (check with https://dnschecker.org)
- [ ] All tests passing
- [ ] Monitoring configured
- [ ] Backups scheduled

### Launch Steps

1. **Deploy Backend:**
   ```bash
   git push production main
   # Or manual deployment
   ```

2. **Deploy Frontend:**
   ```bash
   vercel --prod
   # Or manual deployment
   ```

3. **Verify Production:**
   - Visit your domain
   - Test all major features
   - Check error logs

4. **Update Documentation:**
   - Note production URLs
   - Document any deployment-specific configurations
   - Update README if needed

### Post-Launch

- [ ] Announce on social media
- [ ] Update LinkedIn profile
- [ ] Share with network
- [ ] Monitor error logs for 24-48 hours
- [ ] Check analytics setup
- [ ] Verify email notifications

---

## 🔍 Phase 12: Ongoing Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor uptime status
- [ ] Review contact form submissions

### Weekly
- [ ] Review analytics
- [ ] Update content (blog posts, projects)
- [ ] Check backup status
- [ ] Security scan

### Monthly
- [ ] Update dependencies
- [ ] Performance audit
- [ ] SEO review
- [ ] Database optimization

### Quarterly
- [ ] Security audit
- [ ] UX/UI review
- [ ] Feature additions
- [ ] Content refresh

---

## 📞 Emergency Contacts

### Save These for Quick Access

**Hosting Provider Support:**
- Platform: ___________
- Support URL: ___________
- Phone: ___________

**Domain Registrar:**
- Provider: ___________
- Login: ___________

**Database Host:**
- Provider: ___________
- Console URL: ___________

**Email Service:**
- Provider: ___________
- API Dashboard: ___________

---

## 🆘 Troubleshooting Common Issues

### Site is Down

1. Check hosting provider status
2. Verify DNS settings
3. Check server logs
4. Restart services:
   ```bash
   pm2 restart all
   ```

### Database Connection Failed

1. Verify database credentials
2. Check firewall rules
3. Test connection:
   ```bash
   psql -h host -U user -d database
   ```

### Email Not Sending

1. Check SMTP credentials
2. Verify email service status
3. Check spam folder
4. Review backend logs

### SSL Certificate Expired

```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## ✅ Deployment Complete!

**Congratulations! Your portfolio is now live! 🎉**

Remember to:
- Monitor regularly
- Keep dependencies updated
- Back up frequently
- Respond to contact messages
- Update content regularly

---

**Document Version:** 1.0  
**Last Updated:** July 24, 2026  
**Next Review:** Before deployment
