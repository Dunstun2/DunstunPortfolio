const fs = require('fs');
const path = require('path');

const components = [
  'IvoryEducation',
  'IvorySkills',
  'IvoryServices',
  'IvoryContact',
  'IvoryTestimonials',
  'IvoryEvents',
  'IvoryBlog',
  'IvoryAchievements'
];

const dir = path.join(__dirname, 'frontend/src/templates/ivory');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

components.forEach(comp => {
  const name = comp.replace('Ivory', '');
  const content = `'use client';
import type { TemplateSectionProps } from '@/templateEngine/types';

export default function ${comp}(_props: TemplateSectionProps) {
  return (
    <section id="${name.toLowerCase()}" className="py-24 bg-bg-dark border-b border-text-light/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-heading-light mb-8 tracking-tight">${name}</h2>
        <div className="text-text-light">Ivory ${name} placeholder</div>
      </div>
    </section>
  );
}
`;
  fs.writeFileSync(path.join(dir, `${comp}.tsx`), content);
});

// Write index.ts
const indexContent = `import type { TemplateComponentSet } from '@/templateEngine/types';

import IvoryNavbar from './IvoryNavbar';
import IvoryFooter from './IvoryFooter';
import IvoryHero from './IvoryHero';
import IvoryAbout from './IvoryAbout';
import IvoryProjects from './IvoryProjects';
import IvoryExperience from './IvoryExperience';
import IvoryEducation from './IvoryEducation';
import IvorySkills from './IvorySkills';
import IvoryServices from './IvoryServices';
import IvoryBlog from './IvoryBlog';
import IvoryContact from './IvoryContact';
import IvoryTestimonials from './IvoryTestimonials';
import IvoryEvents from './IvoryEvents';
import IvoryAchievements from './IvoryAchievements';

export const IvoryTemplate: TemplateComponentSet = {
  slug: 'ivory',
  Navbar: IvoryNavbar,
  Footer: IvoryFooter,
  Hero: IvoryHero,
  About: IvoryAbout,
  Projects: IvoryProjects,
  Experience: IvoryExperience,
  Education: IvoryEducation,
  Skills: IvorySkills,
  Services: IvoryServices,
  Blog: IvoryBlog,
  Contact: IvoryContact,
  Testimonials: IvoryTestimonials,
  Events: IvoryEvents,
  Achievements: IvoryAchievements,
};
`;
fs.writeFileSync(path.join(dir, 'index.ts'), indexContent);

console.log('Ivory components generated.');
