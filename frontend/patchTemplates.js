const fs = require('fs');
const path = require('path');

const baseDirs = [
  path.join(__dirname, 'src', 'templates', 'ivory'),
  path.join(__dirname, 'src', 'templates', 'obsidian')
];

for (const dir of baseDirs) {
  if (!fs.existsSync(dir)) continue;
  
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
  for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    let changed = false;

    // We're looking for {settings.something_section_title || 'Something'}
    // and replacing it with <ColoredTitle settingKey="something_section_title" title={settings.something_section_title || 'Something'} />
    const regex = /\{settings\.([a-z_]+_section_title)\s*\|\|\s*'([^']+)'\}/g;
    
    if (regex.test(content)) {
      content = content.replace(regex, (match, key, defaultVal) => {
        return `<ColoredTitle settingKey="${key}" title={settings.${key} || '${defaultVal}'} />`;
      });
      changed = true;
    }

    if (changed) {
      // Add import for ColoredTitle if not present
      if (!content.includes('ColoredTitle')) {
        const importMatch = content.match(/import.*?from.*?;/g);
        if (importMatch && importMatch.length > 0) {
          const lastImport = importMatch[importMatch.length - 1];
          content = content.replace(lastImport, `${lastImport}\nimport ColoredTitle from '@/templateEngine/components/ColoredTitle';`);
        }
      }
      fs.writeFileSync(filePath, content);
    }
  }
}
console.log('Templates patched.');
