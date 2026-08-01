'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from 'next/link';

export default function SkillsPage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const refreshKey = useRealtimeRefresh('skills');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    Promise.all([
      fetchApi('/skills'),
      fetchApi('/settings')
    ])
      .then(([skillsRes, settingsRes]) => {
        setSkills(skillsRes.data || []);
        setSettings(settingsRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshKey, refreshKeySettings]);

  // Group skills by category
  const groupedSkills: Record<string, any[]> = skills.reduce((acc: Record<string, any[]>, skill: any) => {
    let cat = (skill.category || 'Other').trim();
    // Fix common typo where 'Development' is truncated
    if (cat.endsWith('Developmen')) {
      cat = cat + 't';
    }
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, any[]>);

  const categories = ['All', ...Object.keys(groupedSkills)];
  const displayCategories = selectedCategory === 'All'
    ? Object.entries(groupedSkills)
    : [[selectedCategory, groupedSkills[selectedCategory]]];

  const pageTitle = settings?.skills_page_title || 'Skills & Expertise';
  const pageSubtitle = settings?.skills_page_subtitle || 'Technologies, tools, and capabilities I work with';
  const ctaTitle = settings?.skills_cta_title || 'Looking for These Skills?';
  const ctaDescription = settings?.skills_cta_description || 'Let\'s discuss how my expertise can help achieve your goals';
  const ctaButtonText = settings?.skills_cta_button_text || 'Let\'s Talk';
  const emptyMessage = settings?.skills_empty_message || 'Skills information coming soon';

  return (
    <div className="min-h-screen py-16 pb-8 md:pb-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-6xl font-extrabold text-heading-light mb-4">
          {pageTitle.split(' ').map((word: string, i: number, arr: string[]) => (
            i === arr.length - 1 ? <span key={i} className="text-primary">{word}</span> : word + ' '
          ))}
        </h1>
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="glass p-6 rounded-2xl mb-12 flex justify-center">
          <select
            value={categories.includes(selectedCategory) ? selectedCategory : 'All'}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-80 bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-heading-light focus:outline-none focus:border-primary font-medium cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-bg-dark text-heading-light">
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Skills Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : skills.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-text-light text-lg">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {displayCategories.map(([category, catSkills], idx) => {
            // Ensure catSkills is an array
            const skillsArray = Array.isArray(catSkills) ? catSkills : [];

            return (
              <div key={`${category}-${idx}`} className="glass p-8 rounded-3xl border border-white/10">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <h2 className="text-2xl font-bold text-heading-light">{category}</h2>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                    {skillsArray.length} {skillsArray.length === 1 ? 'Skill' : 'Skills'}
                  </span>
                </div>

                {/* Skills List */}
                <div className="space-y-6">
                  {skillsArray.map((skill: any) => (
                    <div key={skill.id} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          {skill.icon_url && (
                            <div className="w-8 h-8 flex-shrink-0">
                              <img
                                src={skill.icon_url}
                                alt={skill.name}
                                className="w-full h-full object-contain"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <span className="text-text-light font-semibold text-base group-hover:text-primary transition-colors">
                            {skill.name}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {skill.proficiency}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-black/20 dark:bg-white/10 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-700 group-hover:shadow-lg"
                          style={{ width: `${skill.proficiency}%` }}
                        ></div>
                      </div>

                      {/* Description (if available) */}
                      {skill.description && (
                        <p className="text-xs text-text-light/70 mt-2 leading-relaxed">
                          {skill.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}


      </div>
    </div>
  );
}
