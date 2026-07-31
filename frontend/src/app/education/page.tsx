'use client';
import { useState, useEffect } from 'react';
import BackToAbout from '@/components/BackToAbout';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { getFileUrl } from '@/utils/urls';
import Link from 'next/link';

// Utility function to strip HTML tags
const stripHtml = (html: string) => {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
};

export default function EducationPage() {
  const [education, setEducation] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterDegree, setFilterDegree] = useState<string>('All');
  const [filterCertCategory, setFilterCertCategory] = useState<string>('All');
  const [selectedCert, setSelectedCert] = useState<any>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});
  const refreshKey = useRealtimeRefresh('education');
  const refreshKeyCert = useRealtimeRefresh('certifications');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    Promise.all([
      fetchApi('/education'),
      fetchApi('/certifications/published'),
      fetchApi('/settings')
    ])
      .then(([eduRes, certRes, settingsRes]) => {
        setEducation(eduRes.data || []);
        setCertifications(certRes.data || []);
        setSettings(settingsRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshKey, refreshKeyCert, refreshKeySettings]);

  let publishedEdu = education.filter(e => e.status === 'published');

  // Helper to rank degrees
  const getDegreeRank = (degreeStr: string) => {
    if (!degreeStr) return 99;
    const d = degreeStr.toLowerCase();
    if (d.includes('phd') || d.includes('doctorate')) return 1;
    if (d.includes('master') || d.includes('msc') || d.includes('mba')) return 2;
    if (d.includes('bachelor') || d.includes('bsc')) return 3;
    if (d.includes('associate')) return 4;
    if (d.includes('diploma') || d.includes('certificate')) return 5;
    return 8;
  };

  // Sort by degree level and date
  publishedEdu.sort((a, b) => {
    const rankA = getDegreeRank(a.degree);
    const rankB = getDegreeRank(b.degree);
    if (rankA !== rankB) return rankA - rankB;
    if (a.is_current && !b.is_current) return -1;
    if (!a.is_current && b.is_current) return 1;
    const dateA = new Date(a.end_date || a.start_date).getTime();
    const dateB = new Date(b.end_date || b.start_date).getTime();
    return dateB - dateA;
  });

  // Get unique degree types directly from actual data (fully dynamic)
  const degreeTypes = ['All', ...Array.from(new Set(publishedEdu.map(e => e.degree).filter(Boolean)))];

  // Apply degree filter (exact match on actual degree value)
  const filteredEdu = filterDegree === 'All'
    ? publishedEdu
    : publishedEdu.filter(e => e.degree === filterDegree);

  const pageTitle = settings?.education_page_title || 'Education & Learning';
  const pageSubtitle = settings?.education_page_subtitle || 'My academic background, degrees, and scholarly achievements';
  const ctaTitle = settings?.education_cta_title || 'Interested in Collaboration?';
  const ctaDescription = settings?.education_cta_description || 'Let\'s connect and explore opportunities to work together';
  const ctaButtonText = settings?.education_cta_button_text || 'Contact Me';
  const emptyMessage = settings?.education_empty_message || 'Education information coming soon';

  // Helper to toggle description expansion
  const toggleDescription = (id: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Get unique certification categories
  const certCategories = ['All', ...Array.from(new Set(certifications.map(c => c.category).filter(Boolean)))];

  // Filter certifications by category
  const filteredCertifications = filterCertCategory === 'All'
    ? certifications
    : certifications.filter(c => c.category === filterCertCategory);

  return (
    <div className="min-h-screen py-12 md:py-20 bg-bg-dark text-text-light selection:bg-primary/30 relative">
      <BackToAbout />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
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

        {/* Education Degree Filter */}
        {degreeTypes.length > 1 && (
          <div className="flex items-center gap-3 mb-12">
              {/* Dropdown */}
              <select
                value={filterDegree}
                onChange={(e) => setFilterDegree(e.target.value)}
                className="bg-gray-900 text-white px-3 py-2 rounded-xl font-semibold text-xs md:text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary max-w-[140px] md:max-w-[180px]"
              >
                {degreeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {/* Jump to Certifications Button - Prominent */}
              {certifications.length > 0 && (
                <button
                  onClick={() => {
                    const certSection = document.getElementById('certifications-section');
                    certSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs md:text-sm rounded-xl transition-all hover:shadow-lg ml-auto"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span>View Certifications</span>
                </button>
              )}
          </div>
        )}

        {/* Education Timeline */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredEdu.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎓</div>
            <p className="text-text-light text-lg">{emptyMessage}</p>
          </div>
        ) : (
          <div className="relative md:border-l-2 md:border-text-light/15 md:ml-8 md:pl-12 space-y-16 mb-20">
            {filteredEdu.map((edu, index) => {
              const startStr = new Date(edu.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              let endStr = '';
              if (edu.is_current && edu.expected_graduation) {
                endStr = 'Expected ' + new Date(edu.expected_graduation).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              } else if (edu.is_current) {
                endStr = 'Present';
              } else {
                endStr = new Date(edu.end_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              }

              return (
                <div key={edu.id} className="relative glass p-8 rounded-3xl border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(var(--color-primary-rgb),0.15)] hover:border-primary/30">
                  {/* Timeline Dot */}
                  <div className="hidden md:block absolute -left-[90px] top-10 w-6 h-6 rounded-full bg-bg-dark border-4 border-primary z-10 shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]"></div>

                  {/* Current Badge */}
                  {edu.is_current && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                      Currently Studying
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-2 flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-heading-light">
                      {edu.degree && <span className="text-orange-500">{edu.degree}</span>}
                      {edu.degree && edu.field_of_study && ' in '}
                      {edu.field_of_study && <span className="text-primary">{edu.field_of_study}</span>}
                    </h3>
                    <div className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 inline-block w-max">
                      {startStr} – {endStr}
                    </div>
                  </div>

                  {/* Institution Info */}
                  <div className="flex items-center gap-4 mb-4">
                    {edu.institution_logo && (
                      <img
                        src={getFileUrl(edu.institution_logo)}
                        alt={`${edu.institution} logo`}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-contain bg-white/10 p-1.5 border border-text-light/10 flex-shrink-0"
                      />
                    )}
                    <h4 className="text-xl font-semibold text-subheading">
                      {edu.institution}
                      {edu.faculty && <span className="text-muted-light font-normal"> | {edu.faculty}</span>}
                      {edu.department && <span className="text-muted-light font-normal"> | {edu.department}</span>}
                    </h4>
                  </div>

                  {/* Meta Tags */}
                  <div className="flex overflow-x-auto md:flex-wrap gap-2 mb-6 pb-2 md:pb-0 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {edu.gpa && <span className="text-xs font-mono bg-black/5 dark:bg-white/5 text-muted-light px-2 py-1 rounded border border-text-light/15 whitespace-nowrap flex-shrink-0">GPA: {edu.gpa}</span>}
                    {edu.grade && <span className="text-xs font-mono bg-black/5 dark:bg-white/5 text-muted-light px-2 py-1 rounded border border-text-light/15 whitespace-nowrap flex-shrink-0">Grade: {edu.grade}</span>}
                    {edu.honors && <span className="text-xs font-mono bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-2 py-1 rounded border border-yellow-500/20 whitespace-nowrap flex-shrink-0">{edu.honors}</span>}
                    {edu.specialization && <span className="text-xs font-mono bg-black/5 dark:bg-white/5 text-muted-light px-2 py-1 rounded border border-text-light/15 whitespace-nowrap flex-shrink-0">Spec: {edu.specialization}</span>}
                  </div>

                  {/* Summary */}
                  {edu.short_summary && (
                    <div>
                      {/* Mobile: Collapsible */}
                      <div className="md:hidden">
                        <p
                          className={`text-text-light text-lg mb-6 border-l-4 border-primary pl-4 py-1 italic ${!expandedDescriptions[`${edu.id}-summary`] ? 'line-clamp-2' : ''
                            }`}
                        >
                          {edu.short_summary}
                        </p>
                        {edu.short_summary.length > 100 && (
                          <button
                            onClick={() => toggleDescription(`${edu.id}-summary`)}
                            className="mb-6 text-primary font-semibold text-sm flex items-center gap-1 hover:underline"
                          >
                            {expandedDescriptions[`${edu.id}-summary`] ? (
                              <>
                                <span>Read Less</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </>
                            ) : (
                              <>
                                <span>Read More</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      {/* Desktop: Always show full */}
                      <p className="hidden md:block text-text-light text-lg mb-6 border-l-4 border-primary pl-4 py-1 italic">
                        {edu.short_summary}
                      </p>
                    </div>
                  )}

                  {/* Full Description */}
                  {edu.full_description && (
                    <div className="text-text-light leading-relaxed mb-6">
                      {/* Mobile: Show truncated or full based on state */}
                      <div className="md:hidden">
                        <div
                          className={`whitespace-pre-wrap ${!expandedDescriptions[edu.id] ? 'line-clamp-3' : ''
                            }`}
                        >
                          {edu.full_description}
                        </div>
                        {edu.full_description.length > 150 && (
                          <button
                            onClick={() => toggleDescription(edu.id)}
                            className="mt-2 text-primary font-semibold text-sm flex items-center gap-1 hover:underline"
                          >
                            {expandedDescriptions[edu.id] ? (
                              <>
                                <span>Read Less</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </>
                            ) : (
                              <>
                                <span>Read More</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      {/* Desktop: Always show full */}
                      <div className="hidden md:block whitespace-pre-wrap">
                        {edu.full_description}
                      </div>
                    </div>
                  )}

                  {/* Research/Thesis */}
                  {edu.research_title && (
                    <div className="mb-6 glass p-6 rounded-2xl bg-black/20">
                      <h5 className="text-sm font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                        <span>🔬</span> Research / Thesis
                      </h5>
                      <p className="font-semibold text-heading-light mb-2 text-lg">{edu.research_title}</p>
                      {edu.research_supervisor && (
                        <p className="text-xs text-text-light/70 mb-3">Supervisor: {edu.research_supervisor}</p>
                      )}
                      {edu.research_description && (
                        <div>
                          {/* Mobile: Collapsible */}
                          <div className="md:hidden">
                            <p
                              className={`text-sm text-text-light leading-relaxed ${!expandedDescriptions[`${edu.id}-research`] ? 'line-clamp-3' : ''
                                }`}
                            >
                              {edu.research_description}
                            </p>
                            {edu.research_description.length > 150 && (
                              <button
                                onClick={() => toggleDescription(`${edu.id}-research`)}
                                className="mt-2 text-primary font-semibold text-xs flex items-center gap-1 hover:underline"
                              >
                                {expandedDescriptions[`${edu.id}-research`] ? (
                                  <>
                                    <span>Read Less</span>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                  </>
                                ) : (
                                  <>
                                    <span>Read More</span>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          {/* Desktop: Always show full */}
                          <p className="hidden md:block text-sm text-text-light leading-relaxed">
                            {edu.research_description}
                          </p>
                        </div>
                      )}
                      {edu.research_link && (
                        <a
                          href={edu.research_link?.startsWith('http') ? edu.research_link : `https://${edu.research_link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block mt-3 text-xs text-primary hover:underline bg-primary/10 px-3 py-1 rounded-lg"
                        >
                          View Research ↗
                        </a>
                      )}
                    </div>
                  )}

                  {/* Coursework, Activities, Certifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {edu.coursework && edu.coursework.length > 0 && (
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-text-light/70 mb-3 flex items-center gap-2">
                          <span>📚</span> Key Coursework
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {edu.coursework.map((c: string, i: number) => (
                            <span key={i} className="text-xs bg-black/20 border border-white/10 text-text-light px-3 py-1 rounded-lg">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {edu.activities && edu.activities.length > 0 && (
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-text-light/70 mb-3 flex items-center gap-2">
                          <span>🎯</span> Activities
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {edu.activities.map((a: string, i: number) => (
                            <span key={i} className="text-xs bg-black/20 border border-white/10 text-text-light px-3 py-1 rounded-lg">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {edu.certifications && edu.certifications.length > 0 && (
                      <div className="md:col-span-2">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-text-light/70 mb-3 flex items-center gap-2">
                          <span>🏆</span> Related Certifications
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {edu.certifications.map((c: string, i: number) => (
                            <span key={i} className="text-xs bg-black/20 border border-white/10 text-text-light px-3 py-1 rounded-lg">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Achievements */}
                  {edu.achievements && edu.achievements.length > 0 && (
                    <div className="mb-6 glass p-6 rounded-2xl bg-black/20">
                      <h5 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                        <span>⭐</span> Academic Achievements
                      </h5>
                      <ul className="space-y-2">
                        {edu.achievements.map((a: string, i: number) => (
                          <li key={i} className="flex gap-3 text-text-light text-sm">
                            <span className="text-primary mt-1">★</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Related Projects & Links */}
                  {((edu.related_projects && edu.related_projects.length > 0) ||
                    (edu.external_links && edu.external_links.length > 0)) && (
                      <div className="pt-6 border-t border-white/10 space-y-4">
                        {edu.related_projects && edu.related_projects.length > 0 && (
                          <div>
                            <span className="text-xs font-bold text-text-light/70 uppercase block mb-2">Related Projects</span>
                            <div className="flex flex-wrap gap-2">
                              {edu.related_projects.map((p: string, i: number) => (
                                <Link href="/projects" key={i} className="text-xs text-primary hover:underline bg-primary/10 border border-primary/20 px-3 py-1 rounded-lg">
                                  {p}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {edu.external_links && edu.external_links.length > 0 && (
                          <div>
                            <span className="text-xs font-bold text-text-light/70 uppercase block mb-2">External Links</span>
                            <div className="flex flex-wrap gap-2">
                              {edu.external_links.filter(Boolean).map((link: string, i: number) => {
                                const href = link.startsWith('http') ? link : `https://${link}`;
                                return (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    key={i}
                                    className="text-xs text-primary hover:bg-primary/20 bg-primary/10 border border-primary/20 px-3 py-1 rounded-lg flex items-center gap-1"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                    </svg>
                                    Link
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}

        {/* Certifications & Professional Training Section */}
        {certifications.length > 0 && (
          <div id="certifications-section" className="mb-20 scroll-mt-20">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-heading-light mb-3">
                Certifications & <span className="text-primary">Professional Training</span>
              </h2>
              <p className="text-text-light">
                Professional certifications and credentials demonstrating expertise
              </p>
            </div>

            {/* Certification Category Filter */}
            {certCategories.length > 1 && (
              <div className="glass p-6 rounded-2xl mb-8 flex items-center justify-center gap-3">
                <label className="text-sm font-semibold text-text-light">Filter by Category:</label>
                <select
                  value={filterCertCategory}
                  onChange={(e) => setFilterCertCategory(e.target.value)}
                  className="bg-gray-900 text-white px-4 py-2.5 rounded-xl font-semibold text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary min-w-[200px]"
                >
                  {certCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Horizontal Scrollable Container */}
            <div className="relative">
              <div className="overflow-x-auto scrollbar-hide pb-4">
                <div className="flex gap-6" style={{ width: 'max-content' }}>
                  {filteredCertifications.map((cert) => (
                    <div
                      key={cert.id}
                      onClick={() => setSelectedCert(cert)}
                      className="glass p-6 rounded-2xl border border-white/10 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(var(--color-primary-rgb),0.15)] hover:border-primary/30 flex-shrink-0"
                      style={{ width: '350px' }}
                    >
                      {/* Certificate Image */}
                      {cert.certificate_image && (
                        <div className="aspect-video overflow-hidden rounded-lg mb-4 bg-white/5">
                          <img
                            src={cert.certificate_image}
                            alt={cert.certification_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {cert.category && (
                          <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-semibold">
                            {cert.category}
                          </span>
                        )}
                        {cert.featured && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-semibold">
                            ⭐ Featured
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-heading-light mb-2 line-clamp-2">
                        {cert.certification_name}
                      </h3>

                      {/* Issuer */}
                      <p className="text-sm text-text-light/70 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="truncate">{cert.issuing_organization}</span>
                      </p>

                      {/* Date */}
                      {cert.issue_date && (
                        <p className="text-xs text-text-light/50 mb-3 flex items-center gap-2">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Issued: {cert.issue_date}
                          {cert.does_not_expire && ' • No Expiration'}
                        </p>
                      )}

                      {/* Description */}
                      {cert.short_description && (
                        <p className="text-sm text-text-light line-clamp-2 mb-4">
                          {stripHtml(cert.short_description)}
                        </p>
                      )}

                      {/* View Details Button */}
                      <button className="btn btn-sm btn-secondary w-full">
                        View Details →
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scroll Indicators (optional visual hint) */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-bg-dark to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-bg-dark to-transparent pointer-events-none" />
            </div>

            {/* Scroll Hint Text */}
            <p className="text-center text-text-light/50 text-sm mt-4">
              ← Scroll horizontally to view all certifications →
            </p>
          </div>
        )}

        {/* CTA Section */}
        {filteredEdu.length > 0 && (
          <div className="glass rounded-3xl p-8 md:p-12 text-center border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-heading-light mb-4">
                {ctaTitle.split(' ').map((word: string, i: number, arr: string[]) => (
                  i === arr.length - 1 ? <span key={i} className="text-primary">{word}</span> : word + ' '
                ))}
              </h2>
              <p className="text-text-light text-lg mb-8">
                {ctaDescription}
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] hover:-translate-y-1"
              >
                {ctaButtonText} &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Certification Detail Modal */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="glass max-w-3xl w-full rounded-3xl border border-white/20 p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition"
            >
              ×
            </button>

            {/* Certificate Image */}
            {selectedCert.certificate_image && (
              <div className="aspect-video overflow-hidden rounded-lg mb-6 bg-white/5">
                <img
                  src={selectedCert.certificate_image}
                  alt={selectedCert.certification_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCert.category && (
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                  {selectedCert.category}
                </span>
              )}
              {selectedCert.featured && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
                  ⭐ Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-heading-light mb-4">
              {selectedCert.certification_name}
            </h2>

            {/* Meta Info */}
            <div className="space-y-2 mb-6 text-sm text-text-light">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span><strong>Issued By:</strong> {selectedCert.issuing_organization}</span>
              </div>
              {selectedCert.issue_date && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span><strong>Issued:</strong> {selectedCert.issue_date}</span>
                </div>
              )}
              {selectedCert.expiration_date && !selectedCert.does_not_expire && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>Expires:</strong> {selectedCert.expiration_date}</span>
                </div>
              )}
              {selectedCert.does_not_expire && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-400">This certification does not expire</span>
                </div>
              )}
              {selectedCert.credential_id && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span><strong>Credential ID:</strong> {selectedCert.credential_id}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {selectedCert.short_description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-heading-light mb-2">About</h3>
                <p className="text-text-light whitespace-pre-line">
                  {stripHtml(selectedCert.short_description)}
                </p>
              </div>
            )}

            {/* Skills Covered */}
            {selectedCert.skills_covered && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-heading-light mb-2">Skills Covered</h3>
                <p className="text-text-light whitespace-pre-line">
                  {stripHtml(selectedCert.skills_covered)}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-8">
              {selectedCert.credential_url && (
                <a
                  href={selectedCert.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Credential
                </a>
              )}
              {selectedCert.verification_url && (
                <a
                  href={selectedCert.verification_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors border border-white/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify
                </a>
              )}
              {selectedCert.certificate_document && (
                <a
                  href={selectedCert.certificate_document}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors border border-white/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Certificate
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
