import { TemplatePage } from '@/templateEngine';

export const metadata = {
  title: 'Projects',
};

export default function ProjectsPage() {
  return (
    <div className="pt-6 md:pt-10 pb-16">
      <TemplatePage pageName="projects" defaultSection="projects" />
    </div>
  );
}

