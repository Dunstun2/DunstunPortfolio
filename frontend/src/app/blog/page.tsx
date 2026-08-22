import { TemplatePage } from '@/templateEngine';

export const metadata = {
  title: 'Blog',
};

export default function BlogPage() {
  return (
    <div className="pt-6 md:pt-10 pb-16">
      <TemplatePage pageName="blog" defaultSection="blog" />
    </div>
  );
}

