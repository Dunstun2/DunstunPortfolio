const fs = require('fs');
const path = require('path');

const sectionsDir = path.join(__dirname, 'src', 'components', 'sections');
const files = fs.readdirSync(sectionsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(sectionsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace import
  content = content.replace(
    /import SectionTitle from '@\/components\/SectionTitle';/,
    "import ColoredTitle from '@/templateEngine/components/ColoredTitle';"
  );

  // Replace <InlineText ...><SectionTitle ... /></InlineText>
  const regex = /<InlineText\s+settingKey="([^"]+)"\s*defaultValue="([^"]+)">\s*<SectionTitle\s+title=\{([^}]+)\}\s*\/>\s*<\/InlineText>/g;
  content = content.replace(regex, (match, settingKey, defaultValue, titleVar) => {
    return `<ColoredTitle settingKey="${settingKey}" title={${titleVar}} />`;
  });

  // EventsSection hardcodes title in SectionTitle
  const regexHardcoded = /<InlineText\s+settingKey="([^"]+)"\s*defaultValue="([^"]+)">\s*<SectionTitle\s+title="([^"]+)"\s*\/>\s*<\/InlineText>/g;
  content = content.replace(regexHardcoded, (match, settingKey, defaultValue, titleVar) => {
    return `<ColoredTitle settingKey="${settingKey}" title="${titleVar}" />`;
  });

  fs.writeFileSync(filePath, content);
}
console.log('Sections patched.');
