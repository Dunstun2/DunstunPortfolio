'use client';
import Link from '@/components/PreviewLink';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import InlineText from '@/templateEngine/components/InlineText';
import { useInlineEdit } from '@/templateEngine/InlineEditContext';
import InlineButtonLink from '@/templateEngine/components/InlineButtonLink';

export default function ContactCTA() {
  const pathname = usePathname();
  const { isInlineEditing } = useInlineEdit();
  const [settings, setSettings] = useState<any>(null);
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    fetchApi('/settings')
      .then(res => setSettings(res.data || {}))
      .catch(() => {});
  }, [refreshKeySettings]);

  // Hide on admin pages, login, contact, about, and education pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login') || pathname === '/contact' || pathname === '/about' || pathname === '/education') return null;

  // Determine setting keys and fallback values based on path
  let titleKey = 'cta_title';
  let descKey = 'cta_description';
  let btnKey = 'cta_button_text';

  let defaultTitle = "Let's Work Together";
  let defaultDesc = "Have a project in mind or want to collaborate? I'd love to hear from you. Let's create something amazing together.";
  let defaultBtn = "Get In Touch";

  if (pathname === '/projects' || pathname?.startsWith('/projects/')) {
    titleKey = 'projects_cta_title';
    descKey = 'projects_cta_description';
    btnKey = 'projects_cta_button_text';
    defaultTitle = "Start a Project";
    defaultDesc = "Like what you see in my portfolio? Let's build your next big idea together and turn your vision into reality.";
    defaultBtn = "Start a Project";
  } else if (pathname === '/experience' || pathname === '/education') {
    titleKey = 'experience_cta_title';
    descKey = 'experience_cta_description';
    btnKey = 'experience_cta_button_text';
    defaultTitle = "Looking for Talent?";
    defaultDesc = "Looking for someone with my background and experience? I'm always open to discussing new opportunities.";
    defaultBtn = "Hire Me";
  } else if (pathname === '/skills') {
    titleKey = 'skills_cta_title';
    descKey = 'skills_cta_description';
    btnKey = 'skills_cta_button_text';
    defaultTitle = "Need these Skills?";
    defaultDesc = "Need technical expertise for your next project? Let's collaborate and build something great.";
    defaultBtn = "Let's Collaborate";
  } else if (pathname === '/events') {
    titleKey = 'cta_title'; // Fallback to general CTA for events
    descKey = 'cta_description';
    btnKey = 'cta_button_text';
    defaultTitle = "Book a Speaker";
    defaultDesc = "Want me to speak at your next event, host a workshop, or collaborate on a tech meetup? I'd love to participate.";
    defaultBtn = "Book Me";
  } else if (pathname === '/blog' || pathname?.startsWith('/blog/')) {
    titleKey = 'cta_title';
    descKey = 'cta_description';
    btnKey = 'cta_button_text';
    defaultTitle = "Enjoy my Writing?";
    defaultDesc = "Subscribe for updates or reach out if you'd like me to write a guest post or collaborate on an article.";
    defaultBtn = "Get In Touch";
  }

  const titleVal = settings?.[titleKey] || defaultTitle;
  const descVal = settings?.[descKey] || defaultDesc;
  const btnVal = settings?.[btnKey] || defaultBtn;

  // For title styling, we want to color the words if possible
  const renderTitle = (text: string) => {
    const words = text.trim().split(/\s+/);
    if (words.length >= 2) {
      const mid = Math.ceil(words.length / 2);
      return (
        <>
          <span className="text-primary">{words.slice(0, mid).join(' ')}</span>{' '}
          <span className="text-secondary">{words.slice(mid).join(' ')}</span>
        </>
      );
    }
    return <span className="text-primary">{text}</span>;
  };

  return (
    <section className="w-full pt-0 pb-4 sm:pt-6 sm:pb-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 border border-primary/20 backdrop-blur-xl p-8 sm:p-12 md:p-16">
          {/* Background Glow Effects */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              <InlineText settingKey={titleKey} defaultValue={defaultTitle}>
                {renderTitle(titleVal)}
              </InlineText>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              <InlineText settingKey={descKey} defaultValue={defaultDesc}>
                {descVal}
              </InlineText>
            </p>
            <InlineButtonLink
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <InlineText settingKey={btnKey} defaultValue={defaultBtn}>
                {btnVal}
              </InlineText>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </InlineButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
