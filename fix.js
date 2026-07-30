const fs = require('fs');
const path = require('path');

const dir = 'frontend/src/components/sections';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Section.tsx'));

for (const file of files) {
  if (file === 'HeroSection.tsx' || file === 'ServicesSection.tsx') continue;
  
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import
  if (!content.includes("import SectionTitle")) {
    content = content.replace(/(import .*;\n)+/, match => match + "import SectionTitle from '@/components/SectionTitle';\n");
  }

  if (file === 'TestimonialsSection.tsx') {
    content = content.replace(
      /\{\(settings\?\.testimonials_section_title[\s\S]*?\}\)\}\n/m,
      "<SectionTitle title={settings?.testimonials_section_title || 'Client & Peer Feedback'} />\n"
    );
  } else if (file === 'EventsSection.tsx') {
    content = content.replace(
      /Events & <span className="text-primary">Networking<\/span>/,
      "<SectionTitle title=\"Events & Networking\" />"
    );
  } else {
    // For the rest, they have a pattern like:
    // {sectionTitle.split(' ').map((word: string, i: number, arr: string[]) => (
    //   i === arr.length - 1 ? <span key={i} className="text-primary">{word}</span> : word + ' '
    // ))}
    content = content.replace(
      /\{sectionTitle\.split\(' '\)[\s\S]*?\}\)\}/m,
      "<SectionTitle title={sectionTitle} />"
    );
  }

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
