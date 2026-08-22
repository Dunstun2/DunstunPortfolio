const fs = require('fs');
const path = require('path');

const ivoryDir = path.join(__dirname, 'src', 'templates', 'ivory');
const files = fs.readdirSync(ivoryDir).filter(f => f.endsWith('.tsx'));

const subheadingsMap = {
  'IvoryExperience.tsx': { text: 'Journey', key: 'experience_section_subtitle' },
  'IvoryEducation.tsx': { text: 'Background', key: 'education_section_subtitle' },
  'IvorySkills.tsx': { text: 'Capabilities', key: 'skills_section_subtitle' },
  'IvoryProjects.tsx': { text: 'Portfolio', key: 'projects_section_subtitle' },
  'IvoryServices.tsx': { text: 'Expertise', key: 'services_section_subtitle' },
  'IvoryTestimonials.tsx': { text: 'Endorsements', key: 'testimonials_section_subtitle' },
  'IvoryEvents.tsx': { text: 'Engagements', key: 'events_section_subtitle' },
  'IvoryContact.tsx': { text: 'Inquiries', key: 'contact_section_subtitle' },
  'IvoryBlog.tsx': { text: 'Insights', key: 'blog_section_subtitle' },
  'IvoryAchievements.tsx': { text: 'Recognition', key: 'achievements_section_subtitle' },
  'IvoryAbout.tsx': { text: 'About', key: 'about_section_subtitle' }
};

for (const file of files) {
  const filePath = path.join(ivoryDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  let changed = false;

  // Center the sticky column layout
  if (content.includes('className="sticky top-40"')) {
    content = content.replace('className="sticky top-40"', 'className="sticky top-40 text-center"');
    changed = true;
  }
  
  // Center paragraph max-w-sm
  if (content.includes('className="text-text-light/80 text-lg leading-relaxed max-w-sm"')) {
    content = content.replace('className="text-text-light/80 text-lg leading-relaxed max-w-sm"', 'className="text-text-light/80 text-lg leading-relaxed max-w-sm mx-auto"');
    changed = true;
  }
  
  // Also fix about template left-align
  if (file === 'IvoryAbout.tsx' && content.includes('<div className="lg:w-2/5">')) {
    // IvoryAbout has the title in lg:w-2/5 but not sticky
    // let's just make sure we add text-center to the container
    content = content.replace('<div className="lg:w-2/5">', '<div className="lg:w-2/5 text-center">');
    // and mx-auto for paragraph
    content = content.replace('className="text-text-light/80 text-lg leading-relaxed mb-10"', 'className="text-text-light/80 text-lg leading-relaxed mb-10 mx-auto"');
    changed = true;
  }

  // Make subheading editable
  const sub = subheadingsMap[file];
  if (sub) {
    const spanRegex = new RegExp(`<span className="text-primary font-mono text-sm uppercase tracking-widest block mb-[46]">${sub.text}</span>`);
    if (spanRegex.test(content)) {
      content = content.replace(spanRegex, `<span className="text-primary font-mono text-sm uppercase tracking-widest block mb-4">\n                <InlineText settingKey="${sub.key}" defaultValue="${sub.text}" />\n              </span>`);
      changed = true;
    }
  }

  if (changed) {
    // Add import for InlineText if not present
    if (!content.includes('import InlineText')) {
      const importMatch = content.match(/import.*?from.*?;/g);
      if (importMatch && importMatch.length > 0) {
        const lastImport = importMatch[importMatch.length - 1];
        content = content.replace(lastImport, `${lastImport}\nimport InlineText from '@/templateEngine/components/InlineText';`);
      }
    }
    fs.writeFileSync(filePath, content);
  }
}
console.log('Ivory templates centered and subheadings made editable.');
