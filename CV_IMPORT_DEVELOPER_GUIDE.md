# 🔧 CV Import Developer Guide

## Quick Reference for Developers

### 📁 File Structure
```
backend/
├── services/
│   ├── cvParser.service.js      # Text extraction & parsing
│   ├── cvMapper.service.js      # CV to portfolio mapping  
│   └── cvEnhancer.service.js    # AI content enhancement
├── controllers/
│   └── cvImport.controller.js   # API endpoint handlers
├── routes/
│   └── cvImport.routes.js       # Route definitions
├── models/
│   └── CVImport.js              # Database model
└── migrations/
    └── 20260724-create-cv-imports.js

frontend/
├── src/app/admin/cv-import/
│   └── page.tsx                 # Main import interface
└── src/app/admin/layout.tsx     # Navigation integration
```

### 🚀 API Endpoints

```javascript
// Upload & Parse
POST /api/cv/upload
Content-Type: multipart/form-data
Body: { cv: File }

// Enhance with AI  
POST /api/cv/enhance/:importId
Content-Type: application/json

// Import to Portfolio
POST /api/cv/import/:importId  
Content-Type: application/json
Body: { sections: string[], useEnhanced: boolean }

// Get Preview
GET /api/cv/preview/:importId

// Get History
GET /api/cv/history

// Delete Import
DELETE /api/cv/:importId
```

### 🧠 Service Methods

**CVParserService:**
```javascript
extractText(filePath, fileType) → string
parseCV(text) → { parsed: {}, metadata: {} }
extractPersonalInfo(text) → { name, email, phone, ... }
extractSkills(text) → string[]
extractExperience(text) → Experience[]
```

**CVMapperService:**
```javascript
mapToPortfolio(parsedCV) → PortfolioData
mapToHero(data) → HeroSection
mapToSkills(data) → Skill[]
mapToExperience(data) → Experience[]
```

**CVEnhancerService:**
```javascript
enhanceCV(mappedData) → EnhancedData
enhanceDescription(text, context) → string
extractKeywords(text) → string[]
normalizeSkillName(name) → string
```

### 📊 Database Schema

```sql
CVImports {
  id: INTEGER PRIMARY KEY
  file_name: VARCHAR(255)
  file_size: INTEGER  
  file_type: VARCHAR(100)
  extracted_text: LONGTEXT
  parsed_data: JSON
  mapped_data: JSON
  enhanced_data: JSON
  status: ENUM
  imported_by: INTEGER → Users.id
  created_at: DATETIME
}
```

### 🔄 Processing Flow

```
1. Upload → Validate → Extract Text
2. Parse Text → Structure Sections  
3. Map Sections → Portfolio Format
4. Enhance (Optional) → AI Improvements
5. Import → Create/Update Records
```

### 🎯 Key Features

- **Multi-format Support**: PDF, DOCX, TXT
- **Intelligent Parsing**: Regex + context analysis
- **AI Enhancement**: Professional content improvement
- **Selective Import**: Choose sections to import
- **Real-time Preview**: See results before import

### 🛠️ Dependencies

```json
{
  "mammoth": "^1.12.0",     // DOCX parsing
  "pdf-parse": "^2.4.5",   // PDF text extraction  
  "multer": "^2.2.0",      // File upload handling
  "joi": "^18.2.3"         // Request validation
}
```

### 🔧 Configuration

**File Upload Limits:**
```javascript
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    cb(null, allowed.includes(file.mimetype));
  }
});
```

**Enhancement Settings:**
```javascript
const ENHANCEMENT_CONFIG = {
  maxKeywords: 20,
  skillCategories: ['Technical', 'Professional', 'Tools', 'Soft'],
  actionVerbs: ['Developed', 'Implemented', 'Managed', 'Led'],
  stopWords: ['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by']
};
```

### 🧪 Testing

**Test CV Upload:**
```javascript
const formData = new FormData();
formData.append('cv', testFile);

const response = await fetch('/api/cv/upload', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token },
  body: formData
});
```

**Test Enhancement:**
```javascript
const enhanced = await fetch(`/api/cv/enhance/${importId}`, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token }
});
```

### 🐛 Common Issues

**Parsing Problems:**
- Ensure clear section headers
- Check for special characters
- Validate file encoding

**Enhancement Failures:**  
- Verify data structure
- Check service availability
- Review error logs

**Import Errors:**
- Validate section data
- Check database constraints
- Verify user permissions

### 📈 Performance Tips

- Use streaming for large files
- Implement caching for repeated operations  
- Clean up temporary files promptly
- Monitor memory usage during parsing

### 🔒 Security Notes

- Validate all file uploads
- Sanitize extracted text
- Limit file processing time
- Clean up temporary files
- Admin-only access required

---

**Quick Start:**
1. Run migration: `npx sequelize-cli db:migrate`
2. Test upload endpoint with Postman
3. Check admin panel navigation
4. Upload sample CV and review results

**Troubleshooting:**
- Check logs in `backend/logs/`
- Verify file permissions on `uploads/`
- Test with simple TXT file first
- Ensure all dependencies installed