import type { TemplateComponentSet } from '@/templateEngine/types';

import ObsidianNavbar from './ObsidianNavbar';
import ObsidianFooter from './ObsidianFooter';
import ObsidianHero from './ObsidianHero';
import ObsidianAbout from './ObsidianAbout';
import ObsidianProjects from './ObsidianProjects';
import ObsidianExperience from './ObsidianExperience';
import ObsidianEducation from './ObsidianEducation';
import ObsidianSkills from './ObsidianSkills';
import ObsidianServices from './ObsidianServices';
import ObsidianBlog from './ObsidianBlog';
import ObsidianContact from './ObsidianContact';
import ObsidianTestimonials from './ObsidianTestimonials';
import ObsidianEvents from './ObsidianEvents';
import ObsidianAchievements from './ObsidianAchievements';
import ObsidianReferees from './ObsidianReferees';

export const ObsidianTemplate: TemplateComponentSet = {
  slug: 'obsidian',
  Navbar: ObsidianNavbar,
  Footer: ObsidianFooter,
  Hero: ObsidianHero,
  About: ObsidianAbout,
  Projects: ObsidianProjects,
  Experience: ObsidianExperience,
  Education: ObsidianEducation,
  Skills: ObsidianSkills,
  Services: ObsidianServices,
  Blog: ObsidianBlog,
  Contact: ObsidianContact,
  Testimonials: ObsidianTestimonials,
  Events: ObsidianEvents,
  Achievements: ObsidianAchievements,
  Referees: ObsidianReferees,
};
