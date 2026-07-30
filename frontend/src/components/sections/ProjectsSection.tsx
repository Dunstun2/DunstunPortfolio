'use client';
import SectionTitle from '@/components/SectionTitle';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from 'next/link';

export default function ProjectsSection() {
  const [projects, setProjects] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const refreshKey = useRealtimeRefresh('projects');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    Promise.all([
      fetchApi('/projects/published/recent?limit=3').catch(() =>
        fetchApi('/projects/published').then(res => ({ data: (res.data || []).slice(0, 3) }))
      ),
      fetchApi('/settings')
    ])
      .then(([projectsRes, settingsRes]) => {
        setProjects(projectsRes.data || []);
        setSettings(settingsRes.data);
      })
      .catch(() => { });
  }, [refreshKey, refreshKeySettings]);

  if (!projects.length) return null;

  const sectionTitle = settings?.projects_section_title || 'Featured Projects';

  return (
    <section id="projects" className="py-12 md:py-16 bg-bg-dark/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-5xl font-bold text-heading-light mb-16 text-center">
          <SectionTitle title={sectionTitle} />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {projects.map((project) => (
            <div key={project.id} className="glass rounded-2xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300 flex flex-col justify-between">
              <div>
                {project.thumbnail_url ? (
                  <div className="h-48 overflow-hidden relative">
                    <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10" />
                    <img src={project.thumbnail_url} alt={project.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    {project.category && (
                      <span className="absolute top-3 left-3 z-20 px-3 py-1 bg-black/60 backdrop-blur-md text-primary font-bold text-xs rounded-full">
                        {project.category}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-48 bg-black/10 flex items-center justify-center border-b border-text-light/10 relative">
                    <span className="text-text-light/50 font-bold">No Cover Image</span>
                    {project.category && (
                      <span className="absolute top-3 left-3 z-20 px-3 py-1 bg-black/60 backdrop-blur-md text-primary font-bold text-xs rounded-full">
                        {project.category}
                      </span>
                    )}
                  </div>
                )}

                <div className="p-6 pb-2">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-heading-light mb-2">{project.title}</h3>
                  <p className="text-text-light text-sm mb-2 line-clamp-3">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-1">
                <Link
                  href={`/projects#project-${project.id}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  View Case Study &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Projects Button */}
        <div className="text-center">
          <Link
            href="/projects"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-primary rounded-full hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] transition-all hover:-translate-y-1 border border-primary/50"
          >
            View All Projects &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
