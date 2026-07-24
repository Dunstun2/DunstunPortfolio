'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from 'next/link';

export default function SkillsSection({ variant = 'full' }: { variant?: 'highlights' | 'full' }) {
  const [skills, setSkills] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const refreshKey = useRealtimeRefresh('skills');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    Promise.all([
      fetchApi('/skills'),
      fetchApi('/settings')
    ])
      .then(([skillsRes, settingsRes]) => {
        setSkills(skillsRes.data);
        setSettings(settingsRes.data);
      })
      .catch(() => { });
  }, [refreshKey, refreshKeySettings]);

  if (!skills.length) return null;

  // Group skills by category
  const groupedSkills: Record<string, any[]> = skills.reduce((acc: Record<string, any[]>, skill: any) => {
    const cat = skill.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, any[]>);

  const allCategories = Object.entries(groupedSkills);

  // For highlights on homepage: show only the first 3 categories, max 4 skills each
  const isHighlights = variant === 'highlights';
  const displayCategories = isHighlights ? allCategories.slice(0, 3) : allCategories;

  const sectionTitle = settings?.skills_section_title || 'Technical Skills';
  const pageTitle = settings?.skills_page_title || 'Skills & Expertise';
  const pageSubtitle = settings?.skills_page_subtitle || 'Technologies, tools, and capabilities I work with';

  return (
    <section id="skills" className={`bg-bg-dark/50 relative ${isHighlights ? 'py-12 md:py-16' : 'py-8 md:py-12 pb-16 md:pb-24'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isHighlights ? (
          <h2 className="text-3xl md:text-5xl font-bold text-heading-light mb-16 text-center">
            {sectionTitle.split(' ').map((word: string, i: number, arr: string[]) => (
              i === arr.length - 1 ? <span key={i} className="text-secondary">{word}</span> : word + ' '
            ))}
          </h2>
        ) : (
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold text-heading-light mb-4">
              {pageTitle.split(' ').map((word: string, i: number, arr: string[]) => (
                i === arr.length - 1 ? <span key={i} className="text-primary">{word}</span> : word + ' '
              ))}
            </h1>
            <p className="text-text-light text-lg max-w-2xl mx-auto">
              {pageSubtitle}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {displayCategories.map(([category, catSkills]) => {
            const displaySkills = isHighlights ? catSkills.slice(0, 4) : catSkills;
            return (
              <div key={category} className="glass p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-subheading mb-6 border-b border-text-light/15 pb-2">{category}</h3>
                <div className="space-y-6">
                  {displaySkills.map(skill => (
                    <div key={skill.id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-text-light font-medium flex items-center gap-2">
                          {skill.icon_url && <img src={skill.icon_url} alt="" className="w-5 h-5" loading="lazy" decoding="async" />}
                          {skill.name}
                        </span>
                        <span className="text-sm text-secondary font-bold">{skill.proficiency}%</span>
                      </div>
                      <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full transition-all duration-700"
                          style={{ width: `${skill.proficiency}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  {isHighlights && catSkills.length > 4 && (
                    <p className="text-xs text-muted italic">+{catSkills.length - 4} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* "View All Skills" button for homepage highlights */}
        {isHighlights && allCategories.length > 3 && (
          <div className="text-center mt-12">
            <Link
              href="/skills"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-primary/40 text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-1"
            >
              View All Skills
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
