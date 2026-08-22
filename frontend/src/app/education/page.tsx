import { TemplatePage } from '@/templateEngine';

export const metadata = {
  title: 'Education',
};

export default function EducationPage() {
  return (
    <div className="pt-6 md:pt-10 pb-16">
      <TemplatePage pageName="education" defaultSection="education" />
    </div>
  );
}

