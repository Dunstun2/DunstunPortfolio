'use client';
import ColoredTitle from '@/templateEngine/components/ColoredTitle';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from '@/components/PreviewLink';
import { useSearchParams } from 'next/navigation';
import { InnerSortableLayout } from '@/templateEngine/components/InnerSortableLayout';
import InlineText from '@/templateEngine/components/InlineText';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import InlineResourceImage from '@/templateEngine/components/InlineResourceImage';
import { useInlineEdit } from '@/templateEngine/InlineEditContext';

export default function ProjectsSection({ variant = 'full' }: { variant?: 'full' | 'highlights' }) {
  const { isInlineEditing } = useInlineEdit();
  const [projects, setProjects] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const refreshKey = useRealtimeRefresh('projects');
  const refreshKeySettings = useRealtimeRefresh('settings');
  const searchParams = useSearchParams();
  const isPreview = !!searchParams.get('preview_template');
  const [cardOrder, setCardOrder] = useState<string[]>(['image', 'title', 'description', 'cta']);

  useEffect(() => {
    const configOrder = (window as any)?.__TEMPLATE_CONFIG__?.elementOrder?.project_card;
    if (configOrder && configOrder.length > 0) {
      setCardOrder(configOrder);
    }
  }, []);

  useEffect(() => {
    if (isPreview) {
      window.__PREVIEW_LAYOUT__ = window.__PREVIEW_LAYOUT__ || {};
      window.__PREVIEW_LAYOUT__['elementOrder_project_card'] = cardOrder;
    }
  }, [cardOrder, isPreview]);

  const [businessType, setBusinessType] = useState<string>('both');

  useEffect(() => {
    Promise.all([
      variant === 'highlights'
        ? fetchApi('/corporate/projects/published/recent?limit=3')
            .catch(() => fetchApi('/projects/published/recent?limit=3'))
            .catch(() => fetchApi('/corporate/projects/published').then(res => ({ data: (res.data || []).slice(0, 3) })))
            .catch(() => fetchApi('/projects/published').then(res => ({ data: (res.data || []).slice(0, 3) })))
        : fetchApi('/corporate/projects/published').catch(() => fetchApi('/projects/published')),
      fetchApi('/settings'),
      fetchApi('/corporate/about/published').catch(() => fetchApi('/about'))
    ])
      .then(([projectsRes, settingsRes, aboutRes]) => {
        setProjects(projectsRes.data || []);
        setSettings(settingsRes.data);

        const aboutData = aboutRes?.data;
        let corpData = (Array.isArray(aboutData) ? aboutData[0]?.corporate_data : aboutData?.corporate_data) || {};
        while (typeof corpData === 'string') {
          try { corpData = JSON.parse(corpData); } catch { break; }
        }
        if (corpData.business_type) {
          setBusinessType(corpData.business_type);
        }
      })
      .catch(() => { });
  }, [refreshKey, refreshKeySettings]);

  if (businessType === 'services') return null;


  if (!projects.length) return null;

  const sectionTitle = settings?.projects_section_title || 'Featured Projects';

  return (
    <section id="projects" className="pt-6 md:pt-10 pb-8 md:pb-12 bg-bg-dark/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-center">
            <ColoredTitle settingKey="projects_section_title" title={sectionTitle} />
          </h2>
        </div>

        {projects.length > 0 ? (
          (() => {
            const projectIds = projects.map(p => p.id);

            const handleReorder = (newIds: string[]) => {
              const newProjects = newIds.map(id => projects.find(p => p.id === id)!).filter(Boolean);
              setProjects(newProjects);

              window.__PREVIEW_DATA_REORDER__ = window.__PREVIEW_DATA_REORDER__ || {};
              window.__PREVIEW_DATA_REORDER__['projects'] = newIds;
            };

            const renderProject = (id: string) => {
              const project = projects.find(p => p.id === id);
              if (!project) return null;

              const renderCardItem = (itemKey: string) => {
                switch (itemKey) {
                  case 'image':
                    return (
                      <div className="h-48 sm:h-52 overflow-hidden relative w-full">
                        <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                        <InlineResourceImage
                          resource="projects" id={project.id} field="thumbnail_url"
                          currentSrc={project.thumbnail_url} alt={project.title}
                          className="w-full h-full object-cover"
                          wrapperClassName="w-full h-full"
                          width={800}
                          height={500}
                        />
                        {(project.category || isInlineEditing) && (
                          <span className="absolute top-3 left-3 z-20 px-3 py-1 bg-black/60 backdrop-blur-md text-primary font-bold text-xs rounded-full">
                            <InlineResourceText resource="projects" id={project.id} field="category" defaultValue={project.category || 'Category'} />
                          </span>
                        )}
                      </div>
                    );
                  case 'title':
                    return (
                      <div className="px-5 sm:px-6 pt-5 sm:pt-6 w-full">
                        <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-heading-light mb-2">
                          <InlineResourceText resource="projects" id={project.id} field="title" defaultValue={project.title} />
                        </h3>
                      </div>
                    );
                  case 'description':
                    return (
                      <div className="px-5 sm:px-6 py-1 w-full">
                        <p className="text-text-light text-sm mb-2 line-clamp-3">
                          <InlineResourceText resource="projects" id={project.id} field="description" multiline defaultValue={project.description || project.short_description} />
                        </p>
                      </div>
                    );
                  case 'cta':
                    return (
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 w-full mt-auto">
                        <Link
                          href={`/projects/${project.slug || project.id}`}
                          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors min-h-[36px]"
                        >
                          View Case Study &rarr;
                        </Link>
                      </div>
                    );
                  default:
                    return null;
                }
              };

              return (
                <div className="glass rounded-2xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300 flex flex-col justify-between h-full w-full">
                  <InnerSortableLayout
                    items={cardOrder}
                    onReorder={setCardOrder}
                    renderItem={renderCardItem}
                    isPreview={isPreview}
                    className="flex flex-col h-full w-full"
                  />
                </div>
              );
            };

            return (
              <InnerSortableLayout 
                items={projectIds}
                onReorder={handleReorder}
                renderItem={renderProject}
                isPreview={isPreview}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 w-full relative z-10"
              />
            );
          })()
        ) : null}

        {variant === 'highlights' && (
          <div className="text-center mt-8 md:mt-12">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold text-white bg-transparent border-2 border-primary rounded-full hover:bg-primary hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] transition-all hover:-translate-y-1"
            >
              View All Projects &rarr;
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
