import type { TemplateComponentSet } from '@/templateEngine/types';

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
import IvoryReferees from './IvoryReferees';

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
  Referees: IvoryReferees,
};
