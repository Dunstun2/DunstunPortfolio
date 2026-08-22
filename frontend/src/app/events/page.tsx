import { TemplatePage } from '@/templateEngine';

export const metadata = {
  title: 'Events & Talks',
};

export default function EventsPage() {
  return (
    <div className="pt-6 md:pt-10 pb-16">
      <TemplatePage pageName="events" defaultSection="events" />
    </div>
  );
}

