import { TemplatePage } from '@/templateEngine';

export const metadata = {
  title: 'Testimonials',
};

export default function TestimonialsPage() {
  return (
    <div className="pt-6 md:pt-10 pb-16">
      <TemplatePage pageName="testimonials" defaultSection="testimonials" />
    </div>
  );
}

