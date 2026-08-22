'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import type { TemplateSectionProps } from '@/templateEngine/types';
import InlineText from '@/templateEngine/components/InlineText';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import InlineResourceImage from '@/templateEngine/components/InlineResourceImage';
import InlineEditableList from '@/templateEngine/components/InlineEditableList';
import CorporateAbout from '@/modes/corporate/components/CorporateAbout';
import { useInlineEdit } from '@/templateEngine/InlineEditContext';
import { getOptimizedImageUrl } from '@/utils/urls';

export default function IvoryAbout({ config }: TemplateSectionProps) {
  const [aboutData, setAboutData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const { isInlineEditing, getResourceFieldValue } = useInlineEdit();
  const refreshKey = useRealtimeRefresh('about');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    Promise.all([
      fetchApi('/about/published').then(res => setAboutData(res.data)).catch(() => {}),
      fetchApi('/settings').then(res => setSettings(res.data)).catch(() => {})
    ]);
  }, [refreshKey, refreshKeySettings]);

  if (settings?.site_mode === 'corporate') {
    return <CorporateAbout variant="highlights" />;
  }

  if (!aboutData) return null;

  // Parse statistics
  let statistics: { label: string; value: string }[] = [];
  if (aboutData.statistics) {
    if (typeof aboutData.statistics === 'string') {
      try {
        const parsed = JSON.parse(aboutData.statistics);
        statistics = Array.isArray(parsed) ? parsed : [];
      } catch {
        statistics = [];
      }
    } else if (Array.isArray(aboutData.statistics)) {
      statistics = aboutData.statistics;
    }
  }
  if (!Array.isArray(statistics)) {
    statistics = [];
  }

  // Parse interests
  let interests: string[] = [];
  if (aboutData.interests) {
    if (typeof aboutData.interests === 'string') {
      try {
        const parsed = JSON.parse(aboutData.interests);
        interests = Array.isArray(parsed) ? parsed : [];
      } catch {
        interests = [];
      }
    } else if (Array.isArray(aboutData.interests)) {
      interests = aboutData.interests;
    }
  }
  if (!Array.isArray(interests)) {
    interests = [];
  }
  interests = interests.filter((i: any) => i && typeof i === 'string' && i.trim() !== '');
  statistics = statistics.filter((s: any) => s && typeof s === 'object' && s.label?.trim() && s.value?.trim());

  // Draft statistics and interests
  const draftStats: { label: string; value: string }[] = getResourceFieldValue('about', 'active', 'statistics', statistics) ?? statistics;
  const draftInterests: string[] = getResourceFieldValue('about', 'active', 'interests', interests) ?? interests;

  return (
    <section id="about" className="py-32 bg-bg-dark">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-24">
        
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
          
          <div className="lg:w-1/2 w-full">
            <span className="text-primary font-mono text-sm uppercase tracking-widest block mb-4">
              <InlineText settingKey="about_section_subtitle" defaultValue="About" />
            </span>
            
            {(aboutData.professional_title || isInlineEditing) && (
              <div className="inline-block px-4 py-2 bg-text-light/5 border border-text-light/10 text-text-light rounded-full text-sm font-medium tracking-wide mb-6 uppercase">
                <InlineResourceText resource="about" id="active" field="professional_title" defaultValue={aboutData.professional_title || 'Professional Title'} />
              </div>
            )}
            
            <h2 className="text-5xl md:text-6xl font-heading font-black text-heading-light tracking-tighter leading-tight mb-8">
              <InlineResourceText resource="about" id="active" field="title" defaultValue={aboutData.title || 'A brief introduction.'} />
            </h2>
            
            <div className="prose prose-lg prose-invert max-w-none text-text-light/80 mb-10 whitespace-pre-line">
              <InlineResourceText resource="about" id="active" field="content" multiline defaultValue={aboutData.content || aboutData.personal_introduction || ''} />
            </div>
            
            {(interests.length > 0 || isInlineEditing) && (
              <div className="mb-10">
                <p className="text-xs uppercase tracking-widest text-muted-light font-mono mb-4">Interests & Hobbies</p>
                <div className="flex flex-wrap gap-3">
                  <InlineEditableList
                    resource="about"
                    id="active"
                    field="interests"
                    items={interests}
                    placeholder="Add interest"
                    renderItem={(interest, _idx) => (
                      <span className="px-4 py-2 rounded-full text-sm bg-text-light/5 border border-text-light/10 text-text-light hover:border-primary hover:text-primary transition-colors">
                        {interest}
                      </span>
                    )}
                  />
                </div>
              </div>
            )}
            
            {aboutData.resume_url && (
              <a 
                href={aboutData.resume_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-8 py-4 bg-text-light/5 hover:bg-primary/10 border border-text-light/10 hover:border-primary/50 text-heading-light hover:text-primary rounded-full transition-all font-medium text-sm tracking-wide uppercase"
              >
                View Resumé <i className="fas fa-arrow-right"></i>
              </a>
            )}
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-text-light/5 mb-10">
              {(aboutData.image_url || isInlineEditing) ? (
                <InlineResourceImage
                  resource="about"
                  id="active"
                  field="image_url"
                  currentSrc={aboutData.image_url}
                  alt={aboutData.title || "About"}
                  className="w-full h-full object-cover transition-all duration-1000"
                  wrapperClassName="w-full h-full"
                  width={800}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-mono text-muted-light uppercase tracking-widest text-sm bg-gradient-to-br from-bg-dark to-text-light/10">
                  Portrait
                </div>
              )}
              <div className="absolute top-8 right-8 w-24 h-24 border border-text-light/20 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite] pointer-events-none">
                <div className="text-[10px] uppercase tracking-widest text-text-light/60">Explore</div>
              </div>
            </div>

            {(statistics.length > 0 || isInlineEditing) && (
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                {(isInlineEditing ? draftStats : statistics).map((stat, idx) => (
                  <div key={idx} className="bg-text-light/5 border border-text-light/10 rounded-2xl p-6 hover:border-primary/30 transition-colors">
                    <div className="text-4xl lg:text-5xl font-black font-heading text-heading-light mb-2">
                      <InlineResourceText resource="about" id={`stat_${idx}`} field="value" defaultValue={stat.value} />
                    </div>
                    <div className="text-sm text-primary font-mono uppercase tracking-widest">
                      <InlineResourceText resource="about" id={`stat_${idx}`} field="label" defaultValue={stat.label} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
          
        </div>
      </div>
    </section>
  );
}
