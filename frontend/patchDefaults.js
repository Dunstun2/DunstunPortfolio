const fs = require('fs');
const path = require('path');

function replaceFileContent(filePath, regex, replacement) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

const baseDir = path.join(__dirname, 'src');

// 1. Experience default to 'Professional Journey'
const expPaths = [
  path.join(baseDir, 'components', 'sections', 'ExperienceSection.tsx'),
  path.join(baseDir, 'templates', 'ivory', 'IvoryExperience.tsx'),
  path.join(baseDir, 'templates', 'obsidian', 'ObsidianExperience.tsx')
];
for (const p of expPaths) {
  replaceFileContent(p, /settings(\??)\.experience_section_title\s*\|\|\s*'[^']+'/g, "settings$1.experience_section_title || 'Professional Journey'");
}

// 2. Education default to 'Education & Learning'
const eduPaths = [
  path.join(baseDir, 'components', 'sections', 'EducationSection.tsx'),
  path.join(baseDir, 'templates', 'ivory', 'IvoryEducation.tsx'),
  path.join(baseDir, 'templates', 'obsidian', 'ObsidianEducation.tsx')
];
for (const p of eduPaths) {
  replaceFileContent(p, /settings(\??)\.education_section_title\s*\|\|\s*'[^']+'/g, "settings$1.education_section_title || 'Education & Learning'");
}

// 3. Skills default to 'Skills & Expertise'
const skillPaths = [
  path.join(baseDir, 'components', 'sections', 'SkillsSection.tsx'),
  path.join(baseDir, 'templates', 'ivory', 'IvorySkills.tsx'),
  path.join(baseDir, 'templates', 'obsidian', 'ObsidianSkills.tsx')
];
for (const p of skillPaths) {
  replaceFileContent(p, /settings(\??)\.skills_section_title\s*\|\|\s*'[^']+'/g, "settings$1.skills_section_title || 'Skills & Expertise'");
}

// 4. Center Testimonials
const testSection = path.join(baseDir, 'components', 'sections', 'TestimonialsSection.tsx');
replaceFileContent(testSection, /className="text-center md:text-left mb-12 flex flex-col md:flex-row justify-between items-center gap-6"/g, 'className="text-center mb-12 flex flex-col items-center justify-center gap-6"');
replaceFileContent(testSection, /className="text-center md:text-left"/g, 'className="text-center"');

// 5. Center Blog (if it has left alignment)
const blogSection = path.join(baseDir, 'components', 'sections', 'BlogSection.tsx');
if (fs.existsSync(blogSection)) {
  replaceFileContent(blogSection, /text-center md:text-left/g, 'text-center');
  replaceFileContent(blogSection, /className="[^"]*mb-12 flex flex-col md:flex-row justify-between items-center gap-6"/g, 'className="text-center mb-12 flex flex-col items-center justify-center gap-6"');
}
const ivoryBlog = path.join(baseDir, 'templates', 'ivory', 'IvoryBlog.tsx');
replaceFileContent(ivoryBlog, /text-center md:text-left/g, 'text-center');

const obsidianBlog = path.join(baseDir, 'templates', 'obsidian', 'ObsidianBlog.tsx');
replaceFileContent(obsidianBlog, /text-center md:text-left/g, 'text-center');

console.log('Done patching defaults and centering.');
