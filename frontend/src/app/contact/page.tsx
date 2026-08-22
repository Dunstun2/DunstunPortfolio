import { TemplatePage } from '@/templateEngine';

export const metadata = {
  title: 'Contact',
};

export default function ContactPage() {
  return (
    <div className="pt-6 md:pt-10 pb-16">
      <TemplatePage pageName="contact" defaultSection="contact" />
    </div>
  );
}

