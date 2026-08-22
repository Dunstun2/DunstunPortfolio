import CorporateHero from './components/CorporateHero';
import CorporateAbout from './components/CorporateAbout';
import CorporateServices from './components/CorporateServices';
import CorporateProjects from './components/CorporateProjects';
import CorporateEvents from './components/CorporateEvents';
import CorporateReferences from './components/CorporateReferences';
import CorporateTestimonials from './components/CorporateTestimonials';
import CorporateContact from './components/CorporateContact';

export const CORPORATE_SECTIONS: Record<string, any> = {
  hero: CorporateHero,
  about: CorporateAbout,
  services: CorporateServices,
  projects: CorporateProjects,
  events: CorporateEvents,
  referees: CorporateReferences,
  testimonials: CorporateTestimonials,
  contact: CorporateContact,
};
