# 🚀 Quick Start Guide - Portfolio Application

## ⚡ Get Started in 5 Minutes

This guide will get your portfolio application running locally.

---

## ✅ Prerequisites

- **Node.js** 20+ installed
- **npm** or **yarn** package manager
- **Git** (for version control)

---

## 📥 Step 1: Installation

If not already installed dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 🔧 Step 2: Configuration

### Backend Configuration

Create `.env` file in `backend/` directory:

```bash
# backend/.env

# Database (SQLite - no setup needed)
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# JWT Secret (change in production!)
JWT_SECRET=your_super_secret_jwt_key_here

# Server Port
PORT=5000
NODE_ENV=development

# Email Configuration (Optional - for contact form)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SENDER_NAME=Your Name

# Redis (Optional - for caching)
# REDIS_HOST=localhost
# REDIS_PORT=6379
```

### Frontend Configuration (Optional)

Create `.env.local` in `frontend/` directory (optional - has sensible defaults):

```bash
# frontend/.env.local

# API URL (defaults to http://localhost:5000)
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🗄️ Step 3: Database Setup

The database will be automatically created on first run. If you want to initialize it manually:

```bash
cd backend
npm start
```

The SQLite database will be created at `backend/database.sqlite` with all tables.

---

## 🎬 Step 4: Start the Application

You need **TWO terminal windows** running simultaneously:

### Terminal 1: Start Backend

```bash
cd backend
npm start
```

**Expected output:**
```
Backend server is running on http://localhost:5000
Environment: development
API Documentation: http://localhost:5000/api-docs
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

**Expected output:**
```
▲ Next.js 16.2.10
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

---

## 🌐 Step 5: Access the Application

### Public Site
**URL:** http://localhost:3000

Browse:
- Homepage with all sections
- Projects page
- Services page
- Blog page
- Contact form
- And more...

### Admin Dashboard
**URL:** http://localhost:3000/admin/login

**Default Credentials:**
- **Email:** admin@example.com
- **Password:** admin123

**⚠️ IMPORTANT:** Change these credentials immediately after first login via Account settings!

### API Documentation
**URL:** http://localhost:5000/api-docs

Interactive Swagger documentation for all backend endpoints.

---

## 🎨 Step 6: Customize Your Portfolio

### 1. Change Admin Password
- Login to admin dashboard
- Go to Account settings
- Update password

### 2. Update Site Settings
- Navigate to **Admin → Settings**
- Update:
  - Site title & tagline
  - Contact information
  - Social media links
  - Section titles and descriptions

### 3. Add Hero Section Content
- Navigate to **Admin → Hero**
- Update your name, title, tagline
- Upload profile image
- Add resume link

### 4. Populate Content
- **Admin → Projects** - Add your projects
- **Admin → Services** - Add your services
- **Admin → Education** - Add education history
- **Admin → Experience** - Add work experience
- **Admin → Skills** - Add your skills
- **Admin → Blog** - Write blog posts
- **Admin → Testimonials** - Add client reviews

---

## 🎯 Common Tasks

### Add a New Project

1. Go to http://localhost:3000/admin/projects
2. Click "Add New Project"
3. Fill in details:
   - Title
   - Description
   - Technologies used
   - Upload images
   - Add GitHub/demo links
4. Click "Save"
5. View on http://localhost:3000/projects

### Write a Blog Post

1. Go to http://localhost:3000/admin/blog
2. Click "New Post"
3. Write content (supports rich text)
4. Add categories and tags
5. Upload featured image
6. Publish or save as draft
7. View on http://localhost:3000/blog

### Manage Contact Messages

1. Visitors submit via http://localhost:3000/contact
2. View messages at http://localhost:3000/admin/contact
3. Mark as read/unread
4. Reply directly from dashboard
5. Archive old messages

---

## 🔍 Verify Installation

### Check Backend Health
```bash
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-24T03:09:00.000Z"
}
```

### Check Frontend
Visit http://localhost:3000 - should see homepage with hero section.

### Check Database
```bash
cd backend
ls -la database.sqlite
```

Should see the SQLite database file.

---

## 🛠️ Development Workflow

### Making Code Changes

**Frontend changes:**
- Edit files in `frontend/src/`
- Hot reload automatically updates browser
- No need to restart server

**Backend changes:**
- Edit files in `backend/`
- Restart backend server (Ctrl+C, then `npm start`)
- Or use nodemon for auto-restart:
  ```bash
  npm install -g nodemon
  nodemon server.js
  ```

### Viewing Logs

**Backend logs:**
```bash
cd backend
tail -f logs/combined.log  # All logs
tail -f logs/error.log     # Errors only
```

**Frontend logs:**
Check terminal where `npm run dev` is running.

---

## 📱 Testing Responsive Design

### Browser DevTools
1. Open http://localhost:3000
2. Press F12 (open DevTools)
3. Click device toolbar icon (Ctrl+Shift+M)
4. Test different screen sizes

### Test on Mobile Device
1. Find your computer's local IP:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```
2. On mobile, visit: http://YOUR_IP:3000
3. Make sure both devices on same network

---

## 🔧 Troubleshooting

### Issue: Port Already in Use

**Backend (Port 5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**Frontend (Port 3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: Cannot Connect to Backend

1. Verify backend is running (check Terminal 1)
2. Check backend URL in `frontend/src/utils/api.ts`
3. Ensure no firewall blocking port 5000

### Issue: Database Errors

```bash
cd backend
rm database.sqlite  # Delete old database
npm start           # Will recreate automatically
```

### Issue: Module Not Found

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json .next
npm install
```

### Issue: Admin Login Not Working

1. Check backend logs for errors
2. Verify database exists: `backend/database.sqlite`
3. Try resetting admin user:
   ```bash
   cd backend
   node -e "
   const { User } = require('./models');
   User.findOne({ where: { email: 'admin@example.com' } })
     .then(u => u ? console.log('Admin exists') : console.log('Admin missing'))
   "
   ```

---

## 📊 Project Structure

```
Portfolio/
├── backend/              # Express.js API
│   ├── config/          # Configuration files
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── logs/            # Application logs
│   └── database.sqlite  # SQLite database
│
├── frontend/            # Next.js application
│   ├── src/
│   │   ├── app/        # Pages (App Router)
│   │   ├── components/ # React components
│   │   └── utils/      # Utilities
│   ├── public/         # Static files
│   └── .next/          # Build output
│
└── docs/               # Documentation
```

---

## 🎓 Learning Resources

### Understanding the Stack

**Next.js (Frontend Framework):**
- [Official Docs](https://nextjs.org/docs)
- App Router pattern
- Server/Client Components
- File-based routing

**Express.js (Backend Framework):**
- [Official Docs](https://expressjs.com)
- REST API design
- Middleware pattern
- Route handling

**Sequelize (ORM):**
- [Official Docs](https://sequelize.org)
- Models and migrations
- Associations
- Queries

---

## 🚀 Production Deployment

### Build for Production

**Frontend:**
```bash
cd frontend
npm run build
npm run start  # Serves production build
```

**Backend:**
```bash
cd backend
NODE_ENV=production npm start
```

### Deployment Platforms

**Frontend Options:**
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Traditional VPS with PM2

**Backend Options:**
- Railway
- Render
- Heroku
- AWS EC2
- DigitalOcean
- Traditional VPS with PM2

**Database:**
- For production, consider:
  - PostgreSQL (recommended)
  - MySQL
  - MongoDB
  - Instead of SQLite

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change default admin credentials
- [ ] Update JWT_SECRET to strong random value
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for your domain
- [ ] Enable HTTPS (SSL certificates)
- [ ] Set secure cookie flags
- [ ] Review .env files (don't commit secrets!)
- [ ] Enable rate limiting
- [ ] Set up backup strategy
- [ ] Configure monitoring/logging

---

## 📈 Performance Tips

### Frontend
- Images: Use Next.js Image component
- Fonts: Use next/font for optimization
- Code splitting: Automatic with Next.js
- Caching: Configure in production

### Backend
- Enable Redis caching (optional)
- Use connection pooling
- Optimize database queries
- Enable gzip compression
- Set up CDN for static assets

---

## 🆘 Getting Help

### Check Logs First
```bash
# Backend logs
cat backend/logs/error.log

# Frontend logs
Check terminal output
```

### Common Issues
1. Port conflicts → Kill process using port
2. Database errors → Delete and recreate database
3. Module errors → Reinstall node_modules
4. API errors → Check backend logs
5. Build errors → Clear .next and rebuild

### Documentation
- `BUILD_COMPLETE.md` - Build details
- `DEVELOPMENT_STANDARDS.md` - Coding standards
- `README.md` - Project overview

---

## ✅ Success Checklist

Your setup is working when:

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Can access homepage
- [ ] Can login to admin dashboard
- [ ] Can create/edit content
- [ ] Changes reflect on public pages
- [ ] Real-time updates working
- [ ] No console errors
- [ ] Database created successfully

---

## 🎉 You're All Set!

Your portfolio is now running locally. Start customizing and adding your content!

**Next Steps:**
1. Change admin password ⚠️
2. Update hero section with your info
3. Add your first project
4. Customize settings and colors
5. Deploy to production when ready

**Happy Building! 🚀**

---

**Last Updated:** July 24, 2026  
**Version:** 1.0  
**Status:** Production Ready
