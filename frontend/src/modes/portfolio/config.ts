import PortfolioHero from './components/PortfolioHero';
import PortfolioAbout from './components/PortfolioAbout';
import PortfolioProjects from './components/PortfolioProjects';
import PortfolioServices from './components/PortfolioServices';
import PortfolioSkills from './components/PortfolioSkills';
import PortfolioExperience from './components/PortfolioExperience';
import PortfolioEducation from './components/PortfolioEducation';
import PortfolioAchievements from './components/PortfolioAchievements';
import PortfolioTestimonials from './components/PortfolioTestimonials';
import PortfolioReferees from './components/PortfolioReferees';
import PortfolioContact from './components/PortfolioContact';

export const PORTFOLIO_SECTIONS: Record<string, any> = {
  hero: PortfolioHero,
  about: PortfolioAbout,
  projects: PortfolioProjects,
  services: PortfolioServices,
  skills: PortfolioSkills,
  experience: PortfolioExperience,
  education: PortfolioEducation,
  achievements: PortfolioAchievements,
  testimonials: PortfolioTestimonials,
  referees: PortfolioReferees,
  contact: PortfolioContact,
};
