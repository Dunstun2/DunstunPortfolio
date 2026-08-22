const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'src', 'app');
const sections = ['about', 'achievements', 'blog', 'contact', 'education', 'events', 'experience', 'projects', 'services', 'skills', 'testimonials'];

sections.forEach(section => {
  const filePath = path.join(appDir, section, 'page.tsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(`<TemplateSection name="${section}" />`, `<TemplateSection name="${section}" variant="full" />`);
    fs.writeFileSync(filePath, content);
  }
});
console.log('Done!');
