import { TemplatePage } from '@/templateEngine';

export const metadata = {
  title: 'Services',
};

export default function ServicesPage() {
  return (
    <div className="pt-6 md:pt-10 pb-16">
      <TemplatePage pageName="services" defaultSection="services" />
    </div>
  );
}

