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

  // Strip HTML tags for plain text display
  const stripHtml = (html: string) => {
    if (!html) return '';
    return html
      .replace(/<\/p>\s*<p>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
  };

  // Use personal_introduction as the catchy teaser, fall back to content
  const introText = stripHtml(about.personal_introduction) || stripHtml(about.content) || '';

  // Parse statistics
  let statistics: { label: string; value: string }[] = [];
  if (about.statistics) {
    if (typeof about.statistics === 'string') {
      try { statistics = JSON.parse(about.statistics); } catch { statistics = []; }
    } else if (Array.isArray(about.statistics)) {
      statistics = about.statistics;
    }
  }

  // Parse interests - filter out empty entries
  let interests: string[] = [];
  if (about.interests) {
    if (typeof about.interests === 'string') {
      try { interests = JSON.parse(about.interests); } catch { interests = []; }
    } else if (Array.isArray(about.interests)) {
      interests = about.interests;
    }
  }
  interests = interests.filter((i: string) => i && i.trim() !== '');

  // Filter out empty statistics
  statistics = statistics.filter((s: { label: string; value: string }) => s.label?.trim() && s.value?.trim());

  return (
    <section id="about" className="py-10 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-2xl md:text-5xl font-bold text-heading-light mb-8 md:mb-16 text-center">
          <SectionTitle title={sectionTitle} />
        </h2>

        <div className="glass p-4 sm:p-8 md:p-12 rounded-2xl md:rounded-3xl">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
            
            {/* Profile Image - hidden on small screens */}
            {about.image_url && (
              <div className="hidden md:flex flex-col items-center gap-4 flex-shrink-0">
                <div className="w-56 h-56 lg:w-64 lg:h-64 rounded-2xl overflow-hidden border-4 border-primary/30 shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.2)] rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img src={about.image_url} alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 w-full text-left">
              {/* Professional Title Badge */}
              {about.professional_title && (
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                  {about.professional_title}
                </span>
              )}

              {/* Introduction Text */}
              <p className="text-text-light text-sm sm:text-base md:text-lg leading-relaxed mb-6 max-w-none line-clamp-5 whitespace-pre-line">
                {introText}
              </p>

              {/* Statistics Row */}
              {statistics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-4 md:gap-8 mb-8">
                  {statistics.slice(0, 4).map((stat, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-0 md:bg-transparent md:border-0 md:rounded-none text-center md:text-left">
                      <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-primary leading-none">
                        {stat.value}
                      </div>
                      <div className="text-[10px] sm:text-xs md:text-sm text-text-light/60 mt-1 font-medium uppercase tracking-wider">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Interests Tags */}
              {interests.length > 0 && (
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-text-light/40 font-semibold mb-2">Interests & Hobbies</p>
                  <div className="flex flex-wrap gap-2 justify-start">
                  {interests.slice(0, 6).map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-text-light/70 hover:border-primary/30 hover:text-primary transition-colors duration-300"
                    >
                      {interest}
                    </span>
                  ))}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <div className="flex flex-wrap gap-4 justify-start">
                <Link
                  href="/about"
                  className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-primary/20 hover:-translate-y-1"
                >
                  {buttonText}
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
