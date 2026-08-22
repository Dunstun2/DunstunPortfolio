'use client';
import ColoredTitle from '@/templateEngine/components/ColoredTitle';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from '@/components/PreviewLink';
import InlineText from '@/templateEngine/components/InlineText';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import InlineResourceImage from '@/templateEngine/components/InlineResourceImage';
import InlineEditableList from '@/templateEngine/components/InlineEditableList';
import { useInlineEdit } from '@/templateEngine/InlineEditContext';
import InlineButtonLink from '@/templateEngine/components/InlineButtonLink';

export default function AboutSection({ variant = 'highlights' }: { variant?: 'full' | 'highlights' }) {
  const [about, setAbout] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const { isInlineEditing, getResourceFieldValue } = useInlineEdit();
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
      try {
        const parsed = JSON.parse(about.statistics);
        statistics = Array.isArray(parsed) ? parsed : [];
      } catch {
        statistics = [];
      }
    } else if (Array.isArray(about.statistics)) {
      statistics = about.statistics;
    }
  }
  if (!Array.isArray(statistics)) {
    statistics = [];
  }

  // Parse interests - filter out empty entries
  let interests: string[] = [];
  if (about.interests) {
    if (typeof about.interests === 'string') {
      try {
        const parsed = JSON.parse(about.interests);
        interests = Array.isArray(parsed) ? parsed : [];
      } catch {
        interests = [];
      }
    } else if (Array.isArray(about.interests)) {
      interests = about.interests;
    }
  }
  if (!Array.isArray(interests)) {
    interests = [];
  }
  interests = interests.filter((i: any) => i && typeof i === 'string' && i.trim() !== '');

  // Filter out empty statistics
  statistics = statistics.filter((s: any) => s && typeof s === 'object' && s.label?.trim() && s.value?.trim());

  // Draft statistics/interests for editing
  const draftStats: { label: string; value: string }[] = getResourceFieldValue('about', 'active', 'statistics', statistics) ?? statistics;
  const draftInterests: string[] = getResourceFieldValue('about', 'active', 'interests', interests) ?? interests;

  const fullContentText = stripHtml(about.content) || stripHtml(about.personal_introduction) || '';

  return (
    <section id="about" className="py-10 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-2xl md:text-5xl font-bold text-heading-light mb-8 md:mb-16 text-center">
          <ColoredTitle settingKey="about_section_title" title={sectionTitle} />
        </h2>

        <div className="glass p-4 sm:p-8 md:p-12 rounded-2xl md:rounded-3xl">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
            
            {/* Profile Image */}
            <div className={`${about.image_url || isInlineEditing ? 'hidden md:flex' : 'hidden'} flex-col items-center gap-4 flex-shrink-0`}>
              <div className="w-56 h-56 lg:w-64 lg:h-64 rounded-2xl overflow-hidden border-4 border-primary/30 shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.2)] rotate-3 hover:rotate-0 transition-transform duration-500">
                <InlineResourceImage
                  resource="about" id="active" field="image_url"
                  currentSrc={about.image_url} alt="Profile"
                  className="w-full h-full object-cover"
                  wrapperClassName="w-full h-full"
                  width={800}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 w-full text-left">
              {/* Professional Title Badge */}
              {about.professional_title && (
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                  <InlineResourceText resource="about" id="active" field="professional_title" defaultValue={about.professional_title} />
                </span>
              )}

              {/* Introduction Text / Full Content */}
              <div className={`text-text-light text-sm sm:text-base md:text-lg leading-relaxed mb-6 max-w-none whitespace-pre-line ${variant === 'full' ? '' : 'line-clamp-5'}`}>
                {variant === 'full' ? (
                  <InlineResourceText resource="about" id="active" field="content" multiline defaultValue={fullContentText} />
                ) : (
                  <InlineResourceText resource="about" id="active" field="personal_introduction" multiline defaultValue={introText} />
                )}
              </div>

              {/* Statistics Row */}
              {(statistics.length > 0 || isInlineEditing) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-4 md:gap-8 mb-8">
                  {(isInlineEditing ? draftStats : statistics).slice(0, 4).map((stat, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-0 md:bg-transparent md:border-0 md:rounded-none text-center md:text-left">
                      <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-primary leading-none">
                        <InlineResourceText resource="about" id={`stat_${idx}`} field="value" defaultValue={stat.value} />
                      </div>
                      <div className="text-[10px] sm:text-xs md:text-sm text-text-light/60 mt-1 font-medium uppercase tracking-wider">
                        <InlineResourceText resource="about" id={`stat_${idx}`} field="label" defaultValue={stat.label} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Interests Tags */}
              {(interests.length > 0 || isInlineEditing) && (
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-text-light/40 font-semibold mb-2">Interests & Hobbies</p>
                  <div className="flex flex-wrap gap-2 justify-start">
                    <InlineEditableList
                      resource="about"
                      id="active"
                      field="interests"
                      items={interests}
                      placeholder="Add interest"
                      renderItem={(text, _idx) => (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-text-light/70 hover:border-primary/30 hover:text-primary transition-colors duration-300">
                          {text}
                        </span>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* CTA Button */}
              {variant !== 'full' && (
                <div className="flex flex-wrap gap-4 justify-start">
                  <InlineButtonLink
                    href="/about"
                    className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-primary/20 hover:-translate-y-1"
                  >
                    <InlineText settingKey="about_section_button_text" defaultValue="Discover My Journey">
                      {buttonText}
                    </InlineText>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </InlineButtonLink>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Page Details: Narratives, Values, Highlights, Explorations */}
        {variant === 'full' && (
          <div className="mt-16 space-y-16 text-left">
            {/* Professional Summary */}
            {(about.professional_summary || isInlineEditing) && (
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-heading-light mb-6 pb-2 border-b border-white/10">
                  📄 Professional Profile
                </h3>
                <div className="glass p-6 md:p-8 rounded-2xl border border-white/10 leading-relaxed text-text-light/90 whitespace-pre-line text-sm sm:text-base">
                  <InlineResourceText resource="about" id="active" field="professional_summary" multiline defaultValue={about.professional_summary || 'Detailed professional profile summary goes here...'} />
                </div>
              </div>
            )}

            {/* Mission & Vision */}
            {((about.mission_statement || about.vision_statement) || isInlineEditing) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(about.mission_statement || isInlineEditing) && (
                  <div className="glass p-6 md:p-8 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-bold text-heading-light mb-4 flex items-center gap-2">
                      🎯 Our Mission
                    </h3>
                    <p className="text-text-light/90 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      <InlineResourceText resource="about" id="active" field="mission_statement" multiline defaultValue={about.mission_statement || 'Mission statement...'} />
                    </p>
                  </div>
                )}
                {(about.vision_statement || isInlineEditing) && (
                  <div className="glass p-6 md:p-8 rounded-2xl border border-white/10">
                    <h3 className="text-xl font-bold text-heading-light mb-4 flex items-center gap-2">
                      👁️ Our Vision
                    </h3>
                    <p className="text-text-light/90 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      <InlineResourceText resource="about" id="active" field="vision_statement" multiline defaultValue={about.vision_statement || 'Vision statement...'} />
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Core Values */}
            {about.values && about.values.length > 0 && (
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-heading-light mb-8 pb-2 border-b border-white/10">
                  ❤️ Core Values
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {about.values.map((val: any) => (
                    <div key={val.id} className="glass p-6 rounded-2xl border border-white/10 hover:border-primary/30 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 font-bold text-lg">
                        {val.icon_name ? "✨" : "💎"}
                      </div>
                      <h4 className="text-lg font-bold text-heading-light mb-2">
                        <InlineResourceText resource="about/values" id={val.id} field="title" defaultValue={val.title} />
                      </h4>
                      <p className="text-text-light/80 text-sm leading-relaxed">
                        <InlineResourceText resource="about/values" id={val.id} field="description" multiline defaultValue={val.description} />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explorations */}
            {about.explorations && about.explorations.length > 0 && (
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-heading-light mb-8 pb-2 border-b border-white/10">
                  🚀 Areas of Exploration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from(new Set(about.explorations.map((e: any) => e.category))).map((cat: any) => (
                    <div key={cat} className="glass p-6 rounded-2xl border border-white/10">
                      <h4 className="text-xs uppercase tracking-widest text-primary font-bold mb-4">{cat}</h4>
                      <div className="flex flex-wrap gap-2">
                        {about.explorations.filter((e: any) => e.category === cat).map((exp: any) => (
                          <span key={exp.id} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-text-light">
                            <InlineResourceText resource="about/explorations" id={exp.id} field="title" defaultValue={exp.title} />
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Professional Highlights */}
            {about.highlights && about.highlights.length > 0 && (
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-heading-light mb-8 pb-2 border-b border-white/10">
                  🏆 Key Highlights
                </h3>
                <div className="space-y-6">
                  {about.highlights.map((h: any) => (
                    <div key={h.id} className="glass p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-heading-light mb-1">
                          <InlineResourceText resource="about/highlights" id={h.id} field="title" defaultValue={h.title} />
                        </h4>
                        <p className="text-text-light/80 text-sm">
                          <InlineResourceText resource="about/highlights" id={h.id} field="description" multiline defaultValue={h.description} />
                        </p>
                      </div>
                      {h.date && (
                        <span className="px-3 py-1 bg-primary/15 border border-primary/30 text-primary text-xs font-bold rounded-full w-fit">
                          <InlineResourceText resource="about/highlights" id={h.id} field="date" defaultValue={h.date} />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
