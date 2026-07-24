# Production Deployment Guide

## Files EXCLUDED from GitHub (Development Only)

### Backend Test/Seed Scripts
These files were used to populate test data and should NOT be deployed:

**Root level scripts:**
- `backfill-projects.js`
- `populateAbout.js`
- `seed-biomedical.js`
- `seed-experience-v2.js`
- `seed-more-projects.js`
- `seedCertifications.js`
- `update-experiences.js`
- `hero.json` (test data file)

**Scripts directory:**
- `scripts/migrate-greeting.js`
- `scripts/migrate-hero-styles.js`
- `scripts/migrate-hero.js`
- `scripts/seed-admin.js`
- `scripts/seed-blog-data.js`
- `scripts/seed-comrades360-blog.js`
- `scripts/seed-services.js`
- `scripts/seed-three-experiences.js`
- `scripts/sync-analytics.js`
- `scripts/sync-blog.js`
- `scripts/update-draft-educations.js`
- `scripts/verify.js`

**Seeders directory:**
- `seeders/20260724-demo-achievements.js`

**Scratch directory (test files):**
- `scratch/test-parser.js`
- `scratch/test-pdf-columns.js`

### Development Documentation (Excluded)
These are internal development notes and guides:
- `ACHIEVEMENT_MODULE_ENHANCEMENTS.md`
- `ADMIN_DYNAMIC_SETTINGS_GUIDE.md`
- `BUILD_COMPLETE.md`
- `BUILD_SUMMARY.txt`
- `CONTACT_CMS_STRUCTURE.md`
- `CONTACT_UNIFICATION_SUMMARY.md`
- `CONTACT_UNIFIED_COMPLETE.md`
- `CONTENT_MANAGER_ROADMAP.md`
- `DEVELOPMENT_STANDARDS.md`
- `HOW_TO_EDIT_SETTINGS.md`
- `LOCKABLE_FORMS_GUIDE.md`
- `PAGES_EXTENSION_COMPLETE.md`
- `SERVICES_ADMIN_COMPLETE.md`
- `SERVICES_COMPLETE.md`
- `SERVICES_NO_HARDCODED_DATA.md`
- `SERVICES_QUICK_GUIDE.md`
- `SETTINGS_FIX_SUMMARY.md`
- `TEST_SETTINGS.md`
- `UNIVERSAL_CONTENT_IMPLEMENTATION.md`
- `backend/CHANGELOG.md`
- `backend/IMPROVEMENTS.md`
- `backend/SERVICES_GUIDE.md`
- `backend/SERVICES_SUMMARY.md`

### Always Excluded (Sensitive/Generated)
- `.env` files (contains secrets)
- `node_modules/` (dependencies - installed via package.json)
- `*.sqlite`, `*.db` (development database)
- `logs/` (runtime logs)
- `uploads/` (user-generated content - handle separately)
- `token.txt` (temporary auth token)

## Files TO INCLUDE in Production

### Configuration Files
✅ `.env.example` - Template for environment variables
✅ `package.json` & `package-lock.json` - Dependencies
✅ `.sequelizerc` - Sequelize configuration

### Core Application Files
✅ `server.js` - Main entry point
✅ `socketManager.js` - WebSocket manager
✅ `sync.js` - Database sync script

### Directories
✅ `config/` - Application configuration
✅ `controllers/` - API controllers
✅ `middleware/` - Express middleware
✅ `models/` - Database models
✅ `routes/` - API routes
✅ `services/` - Business logic
✅ `utils/` - Utility functions
✅ `validators/` - Request validators
✅ `migrations/` - Database migrations

### Frontend
✅ All frontend source code
✅ `package.json` - Dependencies
✅ Next.js configuration files

### Documentation (User-Facing)
✅ `README.md` - Project overview and setup
✅ `QUICKSTART.md` - Quick start guide
✅ `DEPLOYMENT_CHECKLIST.md` - This deployment guide

## Pre-Deployment Checklist

### 1. Database Setup
- [ ] Remove/backup development SQLite database
- [ ] Set up production database (PostgreSQL/MySQL recommended)
- [ ] Update `backend/config/database.js` for production
- [ ] Run migrations: `npm run migrate`
- [ ] **DO NOT run seed scripts in production**

### 2. Environment Variables
- [ ] Create production `.env` file based on `.env.example`
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database connection
- [ ] Set secure `JWT_SECRET`
- [ ] Configure CORS origins
- [ ] Set up email service credentials (if used)
- [ ] Configure Redis (if used for caching)

### 3. Security
- [ ] Review and update CORS settings
- [ ] Enable rate limiting
- [ ] Set secure session secrets
- [ ] Configure proper file upload limits
- [ ] Review authentication middleware

### 4. File Cleanup
- [ ] Verify `.gitignore` excludes all test/seed files
- [ ] Remove any `token.txt` or temporary files
- [ ] Clear `logs/` directory
- [ ] Remove `uploads/` if not needed or handle separately

### 5. Dependencies
- [ ] Run `npm ci` for clean install (both backend and frontend)
- [ ] Audit dependencies: `npm audit`
- [ ] Update vulnerable packages if any

### 6. Build Process
**Backend:**
```bash
cd backend
npm ci --production
```

**Frontend:**
```bash
cd frontend
npm ci
npm run build
```

### 7. Testing
- [ ] Test all API endpoints
- [ ] Verify authentication works
- [ ] Test file upload functionality
- [ ] Check error handling
- [ ] Verify frontend builds successfully

### 8. Git Repository
```bash
# Verify what will be committed
git status

# Check ignored files
git status --ignored

# Add files
git add .

# Review what's staged
git diff --cached

# Commit
git commit -m "Production-ready deployment"

# Push to repository
git push origin main
```

## Production Environment Setup

### Database
1. Use PostgreSQL or MySQL (not SQLite)
2. Run migrations only: `npm run migrate`
3. Create admin user manually or through secure admin creation endpoint

### Process Management
Use PM2 or similar:
```bash
npm install -g pm2
pm2 start server.js --name portfolio-api
pm2 startup
pm2 save
```

### Reverse Proxy
Configure Nginx or Apache to proxy to Node.js backend

### SSL/HTTPS
Use Let's Encrypt or your hosting provider's SSL

### File Uploads
- Configure permanent storage (S3, Cloud Storage)
- Or ensure `uploads/` directory is persistent and backed up

## Post-Deployment Verification

- [ ] API health check endpoint responds
- [ ] Frontend loads correctly
- [ ] Authentication works
- [ ] Database connections are stable
- [ ] Logs are being written correctly
- [ ] Error handling works as expected

## What to Keep for Production Admin

If you need to create initial data in production:
1. Use the admin dashboard (recommended)
2. Or create a dedicated, secure seeding endpoint
3. **Never** commit production data to Git

## Monitoring

Set up monitoring for:
- Server uptime
- API response times
- Error rates
- Database performance
- Disk space (especially for uploads and logs)

---

**Remember:** This is a clean production system. All test data, seed scripts, and development documentation have been excluded. You'll need to create your actual portfolio content through the admin interface.
