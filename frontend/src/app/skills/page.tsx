import { TemplatePage } from '@/templateEngine';

export const metadata = {
  title: 'Skills',
};

export default function SkillsPage() {
  return (
    <div className="pt-6 md:pt-10 pb-16">
      <TemplatePage pageName="skills" defaultSection="skills" />
    </div>
  );
}

