const fs = require('fs');
const path = require('path');

const dir = 'frontend/src/components/sections';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Section.tsx') && f !== 'HeroSection.tsx');

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add import
  if (!content.includes("import SectionTitle")) {
    content = content.replace(/(import .*;\n)+/, match => match + "import SectionTitle from '@/components/SectionTitle';\n");
  }

  // Replace specific title blocks
  if (file === 'ServicesSection.tsx') {
    // Already correct
  } else if (file === 'AboutSection.tsx') {
    // Already correct because I manually fixed it
  } else if (file === 'TestimonialsSection.tsx') {
    content = content.replace(
      /\{\(settings\?\.testimonials_section_title \|\| 'Client & Peer Feedback'\)\.split\(' '\)\.map\(\(word: string, i: number, arr: string\[\]\) => \([\s\S]*?\}\)\}/,
      "<SectionTitle title={settings?.testimonials_section_title || 'Client & Peer Feedback'} />"
    );
  } else if (file === 'EventsSection.tsx') {
    content = content.replace(
      /Events & <span className="text-primary">Networking<\/span>/,
      "<SectionTitle title=\"Events & Networking\" />"
    );
  } else {
    content = content.replace(
      /\{sectionTitle\.split\(' '\)\.map\(\(word: string, i: number, arr: string\[\]\) => \([\s\S]*?\)\)\}/g,
      "<SectionTitle title={sectionTitle} />"
    );
  }

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
