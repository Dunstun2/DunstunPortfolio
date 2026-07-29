import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import ServicesSection from '@/components/sections/ServicesSection';
import EventsSection from '@/components/sections/EventsSection';
import ExperienceSection from '@/components/sections/ExperienceSection';
import EducationSection from '@/components/sections/EducationSection';
import SkillsSection from '@/components/sections/SkillsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import SectionErrorBoundary from '@/components/SectionErrorBoundary';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <SectionErrorBoundary sectionName="Hero">
        <HeroSection />
      </SectionErrorBoundary>
      <SectionErrorBoundary sectionName="About">
        <AboutSection />
      </SectionErrorBoundary>
      <SectionErrorBoundary sectionName="Services">
        <ServicesSection />
      </SectionErrorBoundary>
      <SectionErrorBoundary sectionName="Education">
        <EducationSection variant="highlights" />
      </SectionErrorBoundary>
      <SectionErrorBoundary sectionName="Experience">
        <ExperienceSection variant="highlights" />
      </SectionErrorBoundary>
      <SectionErrorBoundary sectionName="Skills">
        <SkillsSection variant="highlights" />
      </SectionErrorBoundary>
      <SectionErrorBoundary sectionName="Projects">
        <ProjectsSection />
      </SectionErrorBoundary>
      <SectionErrorBoundary sectionName="Events">
        <EventsSection />
      </SectionErrorBoundary>
      <SectionErrorBoundary sectionName="Testimonials">
        <TestimonialsSection />
      </SectionErrorBoundary>
    </div>
  );
}
