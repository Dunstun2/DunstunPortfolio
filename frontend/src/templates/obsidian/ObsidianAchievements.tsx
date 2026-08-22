'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { useSearchParams } from 'next/navigation';
import type { TemplateSectionProps } from '@/templateEngine/types';
import { InnerSortableLayout } from '@/templateEngine/components/InnerSortableLayout';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import InlineText from '@/templateEngine/components/InlineText';
import ColoredTitle from '@/templateEngine/components/ColoredTitle';
import { getOptimizedImageUrl } from '@/utils/urls';
import PortfolioAchievements from '@/modes/portfolio/components/PortfolioAchievements';

// Default order of elements inside each achievement card
const DEFAULT_CARD_ORDER = ['header', 'image', 'title', 'organization', 'description', 'links'];

export default function ObsidianAchievements(_props: TemplateSectionProps) {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const refreshKey = useRealtimeRefresh('achievement');
  const refreshKeySettings = useRealtimeRefresh('settings');
  const searchParams = useSearchParams();
  const isPreview = !!searchParams.get('preview_template');

  // Shared card element order (applies to all achievement cards simultaneously)
  const [cardOrder, setCardOrder] = useState<string[]>(DEFAULT_CARD_ORDER);

  // Load element order from saved template config if available
  useEffect(() => {
    const configOrder = (window as any)?.__TEMPLATE_CONFIG__?.elementOrder?.achievement_card;
    if (configOrder && configOrder.length > 0) setCardOrder(configOrder);
  }, []);

  // Sync card element order to preview layout window object so Save can persist it
  useEffect(() => {
    if (isPreview) {
      window.__PREVIEW_LAYOUT__ = window.__PREVIEW_LAYOUT__ || {};
      (window.__PREVIEW_LAYOUT__ as any)['elementOrder_achievement_card'] = cardOrder;
    }
  }, [cardOrder, isPreview]);

  useEffect(() => {
    fetchApi('/achievements/published').then(res => {
      if (res.success) setAchievements(res.data || []);
    }).catch(() => {});
    fetchApi('/settings').then(res => setSettings(res.data)).catch(() => {});
  }, [refreshKey, refreshKeySettings]);

  const isCorporate = settings?.site_mode === 'corporate';
  if (isCorporate) return null;

  if (achievements.length === 0) return null;

  // ─── Achievement IDs list for outer record reordering ───────────────────────
  const achievementIds = achievements.map(a => a.id);

  const handleRecordReorder = (newIds: string[]) => {
    const reordered = newIds
      .map(id => achievements.find(a => a.id === id))
      .filter(Boolean);
    setAchievements(reordered);

    // Persist reordered IDs to preview window for Save
    window.__PREVIEW_DATA_REORDER__ = window.__PREVIEW_DATA_REORDER__ || {};
    window.__PREVIEW_DATA_REORDER__['achievements'] = newIds;

    // Best-effort: save new order to backend
    reordered.forEach((record: any, index: number) => {
      fetchApi(`/achievements/${record.id}`, {
        method: 'PUT',
        body: JSON.stringify({ order: index }),
      }).catch(() => {});
    });
  };

  // ─── Render a single card element by its key ────────────────────────────────
  const renderCardElement = (item: any) => (elementKey: string) => {
    switch (elementKey) {
      case 'header':
        return (item.date || item.category) ? (
          <div className="flex items-center justify-between mb-5 w-full px-6 pt-6">
            {item.date && (
              <span className="text-primary text-sm font-medium bg-primary/10 px-3 py-1 rounded-full">
                <InlineResourceText resource="achievements" id={item.id} field="date" defaultValue={item.date} />
              </span>
            )}
            {item.category && (
              <span className="text-muted-light text-xs uppercase tracking-wider">
                <InlineResourceText resource="achievements" id={item.id} field="category" defaultValue={item.category} />
              </span>
            )}
          </div>
        ) : null;

      case 'image':
        return item.featured_image ? (
          <div className="aspect-video rounded-xl overflow-hidden mb-5 bg-bg-dark mx-6 select-none">
            <img
              src={getOptimizedImageUrl(item.featured_image, { width: 600, height: 400 })}
              alt={item.title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null;

      case 'title':
        return (
          <div className="px-6 w-full">
            <h3 className="text-xl font-bold text-heading-light mb-3 group-hover:text-primary transition-colors">
              <InlineResourceText resource="achievements" id={item.id} field="title" defaultValue={item.title} />
            </h3>
          </div>
        );

      case 'organization':
        return item.organization ? (
          <div className="px-6 w-full">
            <p className="text-primary/80 text-sm font-medium mb-3">
              <InlineResourceText resource="achievements" id={item.id} field="organization" defaultValue={item.organization} />
            </p>
          </div>
        ) : null;

      case 'description':
        return item.short_description ? (
          <div className="px-6 w-full flex-1">
            <p className="text-text-light line-clamp-3 mb-4 leading-relaxed">
              <InlineResourceText resource="achievements" id={item.id} field="short_description" multiline defaultValue={item.short_description} />
            </p>
          </div>
        ) : null;

      case 'links':
        return (item.verification_url || item.external_url) ? (
          <div className="flex gap-3 mt-auto pt-4 border-t border-border-dark mx-6 mb-6 w-full" style={{ marginLeft: '1.5rem', marginRight: '1.5rem', width: 'calc(100% - 3rem)' }}>
            {item.verification_url && (
              <a
                href={item.verification_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary-light flex items-center gap-1 transition-colors"
              >
                <i className="fas fa-check-circle"></i> Verify
              </a>
            )}
            {item.external_url && (
              <a
                href={item.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-light hover:text-primary flex items-center gap-1 transition-colors"
              >
                <i className="fas fa-external-link-alt"></i> Details
              </a>
            )}
          </div>
        ) : null;

      default:
        return null;
    }
  };

  // ─── Render a single achievement record (card) ──────────────────────────────
  const renderRecord = (id: string) => {
    const item = achievements.find(a => a.id === id);
    if (!item) return null;

    return (
      <div className="group bg-card-dark border border-border-dark rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_25px_rgba(var(--color-primary-rgb),0.1)] transition-all duration-500 h-full flex flex-col">
        <InnerSortableLayout
          items={cardOrder}
          onReorder={setCardOrder}
          renderItem={renderCardElement(item)}
          isPreview={isPreview}
          className="flex flex-col h-full w-full py-0"
        />
      </div>
    );
  };

  return (
    <section id="achievements" className="py-16 md:py-24 bg-bg-dark/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-heading-light mb-4">
            <ColoredTitle settingKey="achievements_section_title" title={settings.achievements_section_title || 'Achievements'} />
          </h2>
          <p className="text-muted-light max-w-2xl mx-auto text-lg">
            <InlineText settingKey="achievements_section_subtitle" defaultValue="Milestones, awards, and recognition earned along the journey." />
          </p>
        </div>

        {/* Outer: reorder achievement cards | Inner: reorder elements within each card */}
        <InnerSortableLayout
          items={achievementIds}
          onReorder={handleRecordReorder}
          renderItem={renderRecord}
          isPreview={isPreview}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full relative z-10"
        />
      </div>
    </section>
  );
}
