const fs = require('fs');
const path = require('path');

const pages = [
  { file: 'projects/page.tsx', section: 'projects' },
  { file: 'about/page.tsx', section: 'about' },
  { file: 'experience/page.tsx', section: 'experience' },
  { file: 'education/page.tsx', section: 'education' },
  { file: 'skills/page.tsx', section: 'skills' },
  { file: 'services/page.tsx', section: 'services' },
  { file: 'blog/page.tsx', section: 'blog' },
  { file: 'contact/page.tsx', section: 'contact' },
  { file: 'testimonials/page.tsx', section: 'testimonials' },
  { file: 'events/page.tsx', section: 'events' },
  { file: 'achievements/page.tsx', section: 'achievements' }
];

const basePath = path.join(__dirname, 'frontend/src/app');

pages.forEach(page => {
  const fullPath = path.join(basePath, page.file);
  if (fs.existsSync(fullPath)) {
    const ComponentName = page.section.charAt(0).toUpperCase() + page.section.slice(1) + 'Page';
    const content = `import { TemplateSection } from '@/templateEngine';

export const metadata = {
  title: '${page.section.charAt(0).toUpperCase() + page.section.slice(1)}',
};

export default function ${ComponentName}() {
  return (
    <div className="pt-24 pb-12">
      <TemplateSection name="${page.section}" />
    </div>
  );
}
`;
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${page.file}`);
  } else {
    console.log(`Skipped ${page.file} (does not exist)`);
  }
});
