'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from '@/components/PreviewLink';
import type { TemplateSectionProps } from '@/templateEngine/types';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import InlineText from '@/templateEngine/components/InlineText';
import { getOptimizedImageUrl } from '@/utils/urls';
import CorporateProjects from '@/modes/corporate/components/CorporateProjects';

export default function IvoryProjects({ config, variant = 'full' }: TemplateSectionProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const refreshKey = useRealtimeRefresh('project');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    Promise.all([
      fetchApi('/projects/published').then(res => {
        if (res.success) {
          let data = res.data || [];
          if (variant === 'highlights') data = data.slice(0, 3);
          setProjects(data);
        }
      }).catch(() => {}),
      fetchApi('/settings').then(res => setSettings(res.data)).catch(() => {})
    ]);
  }, [refreshKey, refreshKeySettings, variant]);

  if (settings?.site_mode === 'corporate') {
    return <CorporateProjects variant={variant} />;
  }

  if (!projects.length) return null;

  return (
    <section id="projects" className="py-32 bg-bg-dark">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-24">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-24">
          <div className="max-w-2xl">
            <span className="text-primary font-mono text-sm uppercase tracking-widest block mb-4">
                <InlineText settingKey="projects_section_subtitle" defaultValue="Portfolio" />
              </span>
            <h2 className="text-5xl md:text-6xl font-heading font-black text-heading-light tracking-tighter">
              Selected Works
            </h2>
          </div>
          {variant === 'highlights' && (
            <Link href="/projects" className="mt-8 md:mt-0 text-text-light hover:text-primary transition-colors flex items-center gap-2 border-b border-text-light/30 hover:border-primary pb-1">
              View All Projects <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          )}
        </div>

        {/* Asymmetrical / Masonry-style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-24 gap-x-8 md:gap-x-12">
          {projects.map((project: any, idx: number) => {
            let colClass = "md:col-span-12";
            
            if (idx === 0) colClass = "md:col-span-12";
            else if (idx % 3 === 1) colClass = "md:col-span-7";
            else if (idx % 3 === 2) colClass = "md:col-span-5 md:col-start-8 md:mt-32";
            else if (idx % 3 === 0) colClass = "md:col-span-8 md:col-start-3";

            return (
              <div key={project.id} className={`group ${colClass}`}>
                <Link href={`/projects/${project.slug || project.id}`} className="block relative overflow-hidden bg-text-light/5 rounded-2xl mb-8 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-shadow duration-700">
                  <div className={`w-full ${idx === 0 ? 'aspect-video' : 'aspect-[4/3]'} relative overflow-hidden`}>
                    {project.thumbnail_url ? (
                      <img
                        src={getOptimizedImageUrl(project.thumbnail_url, { width: 800, height: 500 })}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-light font-mono text-sm uppercase tracking-widest bg-gradient-to-br from-bg-dark to-text-light/10">
                        Visual Missing
                      </div>
                    )}
                    <div className="absolute inset-0 bg-bg-dark/10 group-hover:bg-transparent transition-colors duration-700"></div>
                    {project.category && (
                      <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md text-primary font-mono text-xs uppercase tracking-widest rounded-full">
                        <InlineResourceText resource="projects" id={project.id} field="category" defaultValue={project.category} />
                      </span>
                    )}
                  </div>
                </Link>
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="max-w-xl">
                    <h3 className="text-3xl font-heading font-bold text-heading-light mb-4 group-hover:text-primary transition-colors">
                      <InlineResourceText resource="projects" id={project.id} field="title" defaultValue={project.title} />
                    </h3>
                    <p className="text-text-light/80 text-lg leading-relaxed line-clamp-3">
                      <InlineResourceText resource="projects" id={project.id} field="description" multiline defaultValue={project.description} />
                    </p>
                    <div className="mt-4">
                      <Link
                        href={`/projects/${project.slug || project.id}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                      >
                        View Case Study &rarr;
                      </Link>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap md:flex-col gap-2 md:items-end flex-shrink-0">
                    {project.technologies?.slice(0, 4).map((tech: string, i: number) => (
                      <span key={i} className="text-xs font-mono uppercase tracking-wider text-muted-light bg-text-light/5 px-3 py-1.5 rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
