import { TemplatePage } from '@/templateEngine';

export const metadata = {
  title: 'Experience',
};

export default function ExperiencePage() {
  return (
    <div className="pt-6 md:pt-10 pb-16">
      <TemplatePage pageName="experience" defaultSection="experience" />
    </div>
  );
}

