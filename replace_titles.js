const fs = require('fs');
const path = require('path');

const dir = 'frontend/src/components/sections';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Section.tsx'));

for (const file of files) {
  if (file === 'HeroSection.tsx') continue;
  
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Add import if not exists
  if (!content.includes("import SectionTitle")) {
    content = content.replace(/(import .*;\n)+/, match => match + "import SectionTitle from '@/components/SectionTitle';\n");
  }

  // 2. Replace title logic
  if (file === 'ServicesSection.tsx') {
    content = content.replace(
      /\{sectionTitle\.split\(' '\)\.map\([\s\S]*?\}\)\}\n/,
      "<SectionTitle title={sectionTitle} />\n"
    );
  } else if (file === 'TestimonialsSection.tsx') {
    content = content.replace(
      /\{\(settings\?\.testimonials_section_title \|\| '.*?'\)\.split\(' '\)\.map\([\s\S]*?\}\)\}/,
      "<SectionTitle title={settings?.testimonials_section_title || 'Client & Peer Feedback'} />"
    );
  } else if (file === 'EventsSection.tsx') {
    content = content.replace(
      /Events & <span className="text-primary">Networking<\/span>/,
      "<SectionTitle title=\"Events & Networking\" />"
    );
  } else {
    content = content.replace(
      /\{sectionTitle\.split\(' '\)\.map\([\s\S]*?\}\)\}/,
      "<SectionTitle title={sectionTitle} />"
    );
  }

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
