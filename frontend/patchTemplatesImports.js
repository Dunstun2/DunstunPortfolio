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

    if (content.includes('<ColoredTitle') && !content.includes('import ColoredTitle')) {
      const importMatch = content.match(/import.*?from.*?;/g);
      if (importMatch && importMatch.length > 0) {
        const lastImport = importMatch[importMatch.length - 1];
        content = content.replace(lastImport, `${lastImport}\nimport ColoredTitle from '@/templateEngine/components/ColoredTitle';`);
        fs.writeFileSync(filePath, content);
      }
    }
  }
}
console.log('Imports patched.');
