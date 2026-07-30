const fs = require('fs');
const path = require('path');
const dir = 'frontend/src/components/sections';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Section.tsx') && f !== 'HeroSection.tsx');

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('import SectionTitle')) {
    content = content.replace(/'use client';\r?\n/, "'use client';\nimport SectionTitle from '@/components/SectionTitle';\n");
    fs.writeFileSync(filePath, content);
    console.log('Added import to ' + file);
  }
}
