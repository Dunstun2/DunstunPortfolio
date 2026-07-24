# 🚀 Professional Portfolio - Full Stack Application

> A modern, customizable portfolio platform built with Next.js 16 and Express.js

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black)]()
[![React](https://img.shields.io/badge/React-19.2.4-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

A **production-ready** portfolio application that allows professionals from any field to showcase their work, skills, and experience. Built with modern web technologies and designed for easy customization without touching code.

### ✨ Key Highlights

- 🎨 **Fully Customizable** - All content editable through admin dashboard
- 🚀 **Performance Optimized** - Static generation, code splitting, lazy loading
- 📱 **Fully Responsive** - Beautiful on all devices
- 🔐 **Secure** - JWT authentication, protected routes, input validation
- 🌙 **Dark/Light Mode** - User preference support
- ⚡ **Real-time Updates** - Socket.io for instant content updates
- 📊 **Analytics Ready** - Track visitor behavior
- 📧 **Contact Form** - Email notifications
- 📝 **Blog System** - Built-in blogging with categories and tags
- 🎯 **SEO Optimized** - Meta tags, sitemap, Open Graph support

---

## 🎨 Features

### Public Features

- **Homepage** with multiple sections (Hero, About, Services, Projects, Skills, Experience, Education, Events, Testimonials)
- **Projects Gallery** with detailed project pages
- **Services Showcase** with service detail pages
- **Blog System** with categories, tags, and comments
- **Achievements Timeline**
- **Events Calendar**
- **Skills Display** with proficiency levels
- **Contact Form** with email notifications
- **Responsive Design** for all screen sizes
- **Dark/Light Theme** toggle

### Admin Dashboard

- **Content Management** for all sections
- **Media Library** for file uploads
- **Blog Management** (posts, categories, tags, comments)
- **Settings System** for site-wide customization
- **Contact Messages** inbox with reply functionality
- **User Account** management
- **Real-time Preview** of changes
- **Secure Authentication**

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.2.10 | React framework with App Router |
| React | 19.2.4 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling framework |
| Socket.io Client | 4.8.3 | Real-time updates |
| next-themes | 0.4.6 | Theme management |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | - | REST API framework |
| Sequelize | - | ORM for database |
| SQLite | - | Development database |
| JWT | - | Authentication |
| Multer | - | File uploads |
| Nodemailer | - | Email service |
| Winston | - | Logging |
| Socket.io | - | WebSocket server |
| Swagger | - | API documentation |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/portfolio.git
cd portfolio

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

**Backend** - Create `backend/.env`:

```bash
# Database
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Server
PORT=5000
NODE_ENV=development

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Frontend** - Create `frontend/.env.local` (optional):

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### Access the Application

- **Public Site:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/admin/login
- **API Docs:** http://localhost:5000/api-docs

**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

⚠️ **Change these immediately after first login!**

---

## 📚 Documentation

Comprehensive documentation is available in the project root:

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](./QUICKSTART.md) | Get started in 5 minutes |
| [BUILD_COMPLETE.md](./BUILD_COMPLETE.md) | Detailed build information |
| [BUILD_SUMMARY.txt](./BUILD_SUMMARY.txt) | Quick build reference |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | Production deployment guide |
| [DEVELOPMENT_STANDARDS.md](./DEVELOPMENT_STANDARDS.md) | Coding standards and best practices |

---

## 📁 Project Structure

```
portfolio/
├── backend/                    # Express.js Backend
│   ├── config/                # Configuration files
│   ├── controllers/           # Route handlers
│   ├── middleware/            # Express middleware
│   ├── models/                # Sequelize models
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── migrations/            # Database migrations
│   ├── logs/                  # Application logs
│   ├── uploads/               # User uploaded files
│   ├── server.js              # Entry point
│   └── package.json
│
├── frontend/                  # Next.js Frontend
│   ├── src/
│   │   ├── app/              # Pages (App Router)
│   │   │   ├── (public)/    # Public pages
│   │   │   ├── admin/       # Admin dashboard
│   │   │   ├── layout.tsx   # Root layout
│   │   │   └── page.tsx     # Homepage
│   │   ├── components/       # React components
│   │   │   ├── layout/      # Layout components
│   │   │   └── sections/    # Homepage sections
│   │   └── utils/           # Utilities
│   ├── public/              # Static assets
│   ├── .next/               # Build output
│   └── package.json
│
├── docs/                     # Additional documentation
├── scripts/                  # Utility scripts
├── uploads/                  # Shared upload directory
└── README.md                 # This file
```

---

## 🖼️ Screenshots

### Public Site

**Homepage**
- Modern hero section with call-to-action
- Featured projects and services
- Skills showcase with experience
- Client testimonials

**Project Detail**
- Full project information
- Technology stack
- Screenshots/demos
- Links to GitHub and live demos

**Blog**
- Clean, readable layout
- Category and tag filtering
- Related posts
- Comment system

### Admin Dashboard

**Dashboard Overview**
- Quick stats and recent activity
- Content management shortcuts
- System notifications

**Content Editor**
- Rich text editing
- Media library integration
- Real-time preview
- Drag-and-drop uploads

---

## 🚢 Deployment

### Build Production Version

**Frontend:**
```bash
cd frontend
npm run build
npm run start
```

**Backend:**
```bash
cd backend
NODE_ENV=production npm start
```

### Deployment Options

**Frontend:**
- ✅ **Vercel** (Recommended) - Zero config deployment
- ✅ **Netlify** - Easy setup with CI/CD
- ✅ **AWS Amplify** - AWS integration
- ✅ **Traditional VPS** - Full control with PM2

**Backend:**
- ✅ **Railway** - Simple deployment, free tier
- ✅ **Render** - Easy setup with PostgreSQL
- ✅ **Heroku** - Established platform
- ✅ **Traditional VPS** - Full control with PM2

**Database (Production):**
- ✅ **PostgreSQL** - Recommended
- ✅ **MySQL** - Alternative
- ⚠️ **SQLite** - Development only

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed instructions.

---

## 🎯 Core Principles

### No Hardcoded Content

All user-facing text is stored in the Settings system and editable through the admin dashboard. This makes the portfolio truly universal for any profession.

**Example:**
```typescript
// ✅ Good - Dynamic content
const sectionTitle = settings?.projects_section_title || 'Featured Projects';

// ❌ Bad - Hardcoded
const sectionTitle = 'Featured Projects';
```

See [DEVELOPMENT_STANDARDS.md](./DEVELOPMENT_STANDARDS.md) for complete guidelines.

### Performance First

- Static generation for public pages
- Automatic code splitting
- Lazy loading for dynamic content
- Image optimization
- Minimal JavaScript bundles

### Security Built-In

- JWT authentication
- Protected admin routes
- Input validation
- SQL injection prevention (ORM)
- XSS prevention (React)
- CSRF protection
- Rate limiting

---

## 🧪 Testing

### Run Development Mode
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run dev
```

### Test Production Build
```bash
# Frontend
cd frontend
npm run build
npm run start
```

### Access Points
- Public site: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin
- API documentation: http://localhost:5000/api-docs

---

## 🔧 Customization

### Change Theme Colors

Edit `frontend/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      // Add more custom colors
    }
  }
}
```

### Add New Sections

1. Create component in `frontend/src/components/sections/`
2. Import and use in `frontend/src/app/page.tsx`
3. Add settings in `backend/services/setting.service.js`
4. Add admin UI in `frontend/src/app/admin/settings/page.tsx`

### Modify Admin Dashboard

All admin pages are in `frontend/src/app/admin/`
- Each page follows consistent patterns
- Uses shared components
- Real-time updates via Socket.io

---

## 📊 Features Roadmap

### ✅ Completed

- [x] Full frontend build
- [x] Admin dashboard
- [x] Blog system
- [x] Real-time updates
- [x] Dark/light theme
- [x] Contact form
- [x] Media library
- [x] Settings system
- [x] Authentication
- [x] File uploads

### 🔄 Planned

- [ ] Multi-language support (i18n)
- [ ] Advanced analytics dashboard
- [ ] Newsletter integration
- [ ] Social media integration
- [ ] Payment integration (for services)
- [ ] Calendar booking system
- [ ] Progressive Web App (PWA)
- [ ] Advanced SEO tools

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read [DEVELOPMENT_STANDARDS.md](./DEVELOPMENT_STANDARDS.md) before contributing.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- React team for the UI library
- Tailwind CSS for the styling system
- All open source contributors

---

## 📞 Support

### Documentation
- [Quick Start Guide](./QUICKSTART.md)
- [Build Documentation](./BUILD_COMPLETE.md)
- [Deployment Guide](./DEPLOYMENT_CHECKLIST.md)
- [Development Standards](./DEVELOPMENT_STANDARDS.md)

### Issues
If you encounter any issues, please check:
1. Backend logs in `backend/logs/`
2. Frontend console errors
3. API documentation at `/api-docs`
4. Existing documentation files

---

## 📈 Stats

- **Routes:** 36 total (31 static, 4 dynamic)
- **Components:** 50+
- **Admin Pages:** 24
- **Public Pages:** 12
- **Models:** 20+
- **API Endpoints:** 100+

---

## 🏆 Built With Love

This portfolio platform was built to help professionals showcase their work beautifully and efficiently. We hope it serves you well!

**Happy Building! 🚀**

---

**Version:** 1.0.0  
**Build Date:** July 24, 2026  
**Build Status:** ✅ Production Ready  
**Last Updated:** July 24, 2026
