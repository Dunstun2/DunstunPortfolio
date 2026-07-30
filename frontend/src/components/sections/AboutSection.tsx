'use client';
import SectionTitle from '@/components/SectionTitle';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from 'next/link';

export default function AboutSection() {
  const [about, setAbout] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const refreshKey = useRealtimeRefresh('about');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    Promise.all([
      fetchApi('/about/published')
        .then(res => setAbout(res.data))
        .catch(err => {
          console.warn('Could not fetch about section:', err);
          setAbout(null);
        }),
      fetchApi('/settings')
        .then(res => setSettings(res.data))
        .catch(err => {
          console.warn('Could not fetch settings:', err);
          setSettings(null);
        })
    ]);
  }, [refreshKey, refreshKeySettings]);

  if (!about) return null;

  const sectionTitle = settings?.about_section_title || 'About Me';
  const buttonText = settings?.about_section_button_text || 'Discover My Journey';

  return (
    <section id="about" className="py-12 md:py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-heading-light mb-12 text-center">
          <SectionTitle title={sectionTitle} />
        </h2>
        <div className="glass p-8 md:p-12 rounded-3xl">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            {about.image_url && (
              <div className="hidden md:block w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-primary/30 flex-shrink-0 shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.2)]">
                <img src={about.image_url} alt="Profile" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex-1 text-center md:text-left">

              <div
                className="text-text-light leading-relaxed mb-8 prose dark:prose-invert max-w-none line-clamp-6"
                dangerouslySetInnerHTML={{ __html: about.content }}
              />
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20 hover:-translate-y-1"
                >
                  {buttonText} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
