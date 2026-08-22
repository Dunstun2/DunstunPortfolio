'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from '@/components/PreviewLink';
import { getSocialIcon } from '@/utils/socialIcons';
import { useSearchParams } from 'next/navigation';
import { InnerSortableLayout } from '@/templateEngine/components/InnerSortableLayout';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import InlineResourceImage from '@/templateEngine/components/InlineResourceImage';
import { useInlineEdit } from '@/templateEngine/InlineEditContext';
import { getOptimizedImageUrl } from '@/utils/urls';
import InlineButtonLink from '@/templateEngine/components/InlineButtonLink';

export default function HeroSection() {
  const { isInlineEditing } = useInlineEdit();
  const [heroData, setHeroData] = useState<any>(null);
  const refreshKey = useRealtimeRefresh('hero');
  const [elementOrder, setElementOrder] = useState<string[]>(['headline_group', 'professional_title', 'subheadline', 'highlighted_text', 'availability', 'photo']);
  const [actionOrder, setActionOrder] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const isPreview = !!searchParams.get('preview_template');

  useEffect(() => {
    fetchApi('/hero/published').then(res => setHeroData(res.data)).catch(() => {});
  }, [refreshKey]);

  useEffect(() => {
    // If we have saved element order for hero text in config, use it
    const configOrder = (window as any)?.__TEMPLATE_CONFIG__?.elementOrder?.hero_text;
    if (configOrder && configOrder.length > 0) {
      setElementOrder(configOrder);
    }
  }, []);

  useEffect(() => {
    if (isPreview) {
      window.__PREVIEW_LAYOUT__ = window.__PREVIEW_LAYOUT__ || {};
      window.__PREVIEW_LAYOUT__['elementOrder_hero_text'] = elementOrder;
    }
  }, [elementOrder, isPreview]);

  useEffect(() => {
    if (!heroData) return;
    const activeCtas = (heroData.cta_buttons || []).filter((btn: any) => !btn.is_hidden);
    const activeSocials = (heroData.social_links || []).filter((s: any) => s.is_favorite);
    
    const defaultOrder = [
      ...activeCtas.map((_: any, i: number) => `cta_${i}`),
      ...activeSocials.map((_: any, i: number) => `social_${i}`)
    ];

    const configOrder = (window as any)?.__TEMPLATE_CONFIG__?.elementOrder?.hero_actions;
    if (configOrder && configOrder.length > 0) {
      const validOrder = configOrder.filter((id: string) => defaultOrder.includes(id));
      const missing = defaultOrder.filter(id => !validOrder.includes(id));
      setActionOrder([...validOrder, ...missing]);
    } else {
      setActionOrder(defaultOrder);
    }
  }, [heroData]);

  useEffect(() => {
    if (isPreview && actionOrder.length > 0) {
      window.__PREVIEW_LAYOUT__ = window.__PREVIEW_LAYOUT__ || {};
      window.__PREVIEW_LAYOUT__['elementOrder_hero_actions'] = actionOrder;
    }
  }, [actionOrder, isPreview]);

  if (!heroData) return null;

  const {
    greeting,
    title_prefix,
    headline,
    professional_title,
    subheadline,
    highlighted_text,
    image_url,
    photo_alt_text,
    photo_position,
    photo_shape,
    photo_display_style,
    content_bg_type,
    cta_buttons,
    show_social_links,
    social_links,
    show_availability,
    availability_text,
    availability_type,
    availability_link,
    bg_type,
    bg_color,
    bg_gradient,
    bg_image_url,
    bg_video_url,
    bg_overlay_color,
    bg_overlay_opacity,
    layout_template = 'split',
    full_height,
    content_alignment,
    text_alignment,
    animation_type,
    heading_level,
    accessibility_label
  } = heroData;

  const isDarkBg = bg_type === 'image' || bg_type === 'video' || bg_type === 'animated' || bg_type === 'gradient' || layout_template === 'photo-background' || content_bg_type === 'dark' || content_bg_type === 'gradient-left' || content_bg_type === 'glass';

  // Render Background
  const renderBackground = () => {
    if (layout_template === 'photo-background' && image_url) {
      return (
        <div className="absolute inset-0 z-0">
          <img src={getOptimizedImageUrl(image_url, { width: 1920 })} alt="" className="w-full h-full object-cover animate-fade-in" loading="lazy" decoding="async" />
          <div className="absolute inset-0" style={{ backgroundColor: bg_overlay_color || '#000', opacity: bg_overlay_opacity ?? 0.5 }} />
        </div>
      );
    }

    if (bg_type === 'solid') return <div className="absolute inset-0 z-0" style={{ backgroundColor: bg_color }} />;
    if (bg_type === 'gradient') return <div className={`absolute inset-0 z-0 ${bg_gradient}`} />;
    if (bg_type === 'image') return (
      <div className="absolute inset-0 z-0">
        <img src={getOptimizedImageUrl(bg_image_url, { width: 1920 })} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div className="absolute inset-0" style={{ backgroundColor: bg_overlay_color || '#000', opacity: bg_overlay_opacity }} />
      </div>
    );
    if (bg_type === 'animated') return (
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-secondary/10 pointer-events-none" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>
    );
    return null;
  };

  // Render Availability Badge
  const renderAvailability = () => {
    if (!show_availability || !availability_text) return null;
    
    const colors = {
      available: 'bg-green-500',
      busy: 'bg-yellow-500',
      away: 'bg-red-500'
    };
    
    const badge = (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-gray-900/60 border border-text-light/15 backdrop-blur-sm w-fit mb-6">
        <div className={`w-2.5 h-2.5 rounded-full ${colors[availability_type as keyof typeof colors] || 'bg-green-500'} animate-pulse shadow-[0_0_8px_currentColor]`} />
        <span className="text-sm font-medium text-text-light">
          <InlineResourceText resource="hero" id="active" field="availability_text" defaultValue={availability_text} />
        </span>
      </div>
    );

    return availability_link ? (
      <Link href={availability_link} className="hover:opacity-80 transition-opacity w-fit">{badge}</Link>
    ) : badge;
  };

  // Render CTAs and Socials
  const renderActions = (isExternal: boolean = false) => {
    const activeCtas = (cta_buttons || []).filter((btn: any) => !btn.is_hidden);
    const activeSocials = (social_links || []).filter((s: any) => s.is_favorite);
    
    if (activeCtas.length === 0 && activeSocials.length === 0) return null;
    
    const justifyClass = isExternal ? 'justify-center' : (text_alignment === 'center' ? 'justify-center' : text_alignment === 'right' ? 'justify-end' : 'justify-start');
    const marginClass = isExternal ? 'mt-0' : 'mt-8';
    
    const renderActionItem = (itemId: string) => {
      if (itemId.startsWith('cta_')) {
        const idx = parseInt(itemId.replace('cta_', ''), 10);
        const btn = activeCtas[idx];
        if (!btn) return null;
        
        let styles = '';
        if (btn.style === 'primary') styles = 'btn-primary';
        else if (btn.style === 'secondary') styles = 'btn-secondary';
        else if (btn.style === 'outline') styles = 'btn-outline';
        else if (btn.style === 'ghost') styles = 'btn-ghost';
        
        const btnClass = `btn flex-shrink min-w-[80px] text-center whitespace-nowrap text-xs sm:text-sm md:text-base px-2 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 ${styles}`;

        if (btn.link_type === 'file') {
          const handleDownload = (e: React.MouseEvent) => {
            e.preventDefault();
            const url = btn.target || '';
            if (!url) return;
            if (url.includes('cloudinary.com')) {
              const dlUrl = url.replace('/upload/', '/upload/fl_attachment/');
              window.open(dlUrl, '_blank');
            } else {
              window.open(url, '_blank');
            }
          };
          return (
            <InlineButtonLink
              key={itemId}
              href={btn.target || '#'}
              isActionOnly={true}
              onActionClick={handleDownload}
              className={btnClass}
              badgeLabel="Download File"
            >
              <InlineResourceText resource="hero" id={`cta_${idx}`} field="label" defaultValue={btn.label} />
            </InlineButtonLink>
          );
        }

        if (btn.link_type === 'view') {
          const handleView = (e: React.MouseEvent) => {
            e.preventDefault();
            const url = btn.target || '';
            if (!url) return;
            const ext = url.split('.').pop()?.toLowerCase() || '';
            const officeExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
            if (officeExts.includes(ext)) {
              window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=false`, '_blank');
            } else {
              window.open(url, '_blank');
            }
          };
          return (
            <InlineButtonLink
              key={itemId}
              href={btn.target || '#'}
              isActionOnly={true}
              onActionClick={handleView}
              className={btnClass}
              badgeLabel="View File"
            >
              <InlineResourceText resource="hero" id={`cta_${idx}`} field="label" defaultValue={btn.label} />
            </InlineButtonLink>
          );
        }

        return (
          <InlineButtonLink 
            key={itemId} 
            href={btn.target || '#'} 
            target={btn.link_type === 'external' ? '_blank' : '_self'}
            className={btnClass}
          >
            <InlineResourceText resource="hero" id={`cta_${idx}`} field="label" defaultValue={btn.label} />
          </InlineButtonLink>
        );
      } else if (itemId.startsWith('social_')) {
        const idx = parseInt(itemId.replace('social_', ''), 10);
        const social = activeSocials[idx];
        if (!social) return null;
        
        const href = social.url?.startsWith('http') ? social.url : `https://${social.url}`;
        return (
          <Link 
            key={itemId} 
            href={href} 
            target="_blank" 
            className="w-11 h-11 rounded-full bg-slate-900/80 dark:bg-slate-800/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-white hover:border-primary hover:scale-110 hover:shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)] transition-all duration-300 shadow-md flex-shrink-0"
            title={social.platform_name}
          >
            {getSocialIcon(social.platform_name)}
          </Link>
        );
      }
      return null;
    };

    return (
      <div className={`w-full ${marginClass}`}>
        <InnerSortableLayout 
          items={actionOrder}
          onReorder={setActionOrder}
          renderItem={renderActionItem}
          isPreview={isPreview}
          horizontal={true}
          className={`flex flex-wrap items-center ${justifyClass} gap-3 sm:gap-4`}
        />
      </div>
    );
  };

  // Render Photo
  const renderPhoto = (isSplit: boolean = false) => {
    if (!image_url && !isInlineEditing) return null;

    let shapeClass = 'rounded-full';
    if (photo_shape === 'rounded') shapeClass = 'rounded-2xl';
    else if (photo_shape === 'squircle') shapeClass = 'rounded-[22%]';

    const isCircle = photo_shape === 'circle';
    const wClass = isSplit ? 'w-full' : 'w-48 md:w-64 lg:w-80';
    const circleClass = isSplit ? 'w-full aspect-square max-w-[28rem]' : 'w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80';

    // Helper: renders the img via InlineResourceImage so it's clickable in edit mode
    const photoImg = (imgClass: string) => (
      <InlineResourceImage
        resource="hero" id="active" field="image_url"
        currentSrc={image_url} alt={photo_alt_text || ''}
        className={`${imgClass} select-none`}
        wrapperClassName="w-full h-full"
        width={1200}
      />
    );

    if (photo_display_style === 'normal') {
      if (isCircle) {
        return <div className={`relative flex-shrink-0 ${circleClass}`}>{photoImg(`w-full h-full object-cover shadow-xl ${shapeClass}`)}</div>;
      }
      return <div className={`relative flex-shrink-0 ${wClass}`}>{photoImg(`w-full h-auto object-cover shadow-xl ${shapeClass}`)}</div>;
    }

    if (photo_display_style === 'circular-frame') {
      if (isCircle) {
        return (
          <div className={`relative flex items-center justify-center flex-shrink-0 ${circleClass}`}>
            <div className="absolute -inset-3 bg-gradient-to-br from-primary to-secondary rounded-full blur-xl opacity-40 animate-pulse z-0" />
            {photoImg(`w-full h-full object-cover border-4 border-gray-900 shadow-2xl relative z-10 ${shapeClass}`)}
          </div>
        );
      }
      return (
        <div className={`relative flex items-center justify-center flex-shrink-0 ${wClass}`}>
          <div className="absolute -inset-3 bg-gradient-to-br from-primary to-secondary blur-xl opacity-40 animate-pulse z-0 rounded-2xl" />
          {photoImg(`w-full h-auto object-cover border-4 border-gray-900 shadow-2xl relative z-10 ${shapeClass}`)}
        </div>
      );
    }

    if (photo_display_style === 'polaroid') {
      const sizeClass = isSplit ? 'w-full' : 'w-48 h-56 md:w-64 md:h-72 lg:w-80 lg:h-96';
      return (
        <div className={`p-3 pb-12 bg-white shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500 flex-shrink-0 ${sizeClass}`}>
          {photoImg('w-full h-full object-cover')}
        </div>
      );
    }

    if (photo_display_style === 'floating-card') {
      if (isCircle) {
        return (
          <div className={`relative flex-shrink-0 ${circleClass}`} style={{ animation: 'floatY 4s ease-in-out infinite' }}>
            <style>{`@keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }`}</style>
            {photoImg(`w-full h-full object-cover shadow-[0_30px_60px_rgba(0,0,0,0.6)] ${shapeClass}`)}
          </div>
        );
      }
      return (
        <div className={`relative flex-shrink-0 ${wClass}`} style={{ animation: 'floatY 4s ease-in-out infinite' }}>
          <style>{`@keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }`}</style>
          {photoImg(`w-full h-auto object-cover shadow-[0_30px_60px_rgba(0,0,0,0.6)] ${shapeClass}`)}
        </div>
      );
    }

    if (photo_display_style === 'cutout') {
      const sizeClass = isSplit ? 'w-full' : 'w-48 h-64 md:w-56 md:h-80 lg:w-72 lg:h-[36rem]';
      return <div className={`relative ${sizeClass} flex-shrink-0`}>{photoImg('w-full h-full object-contain drop-shadow-2xl')}</div>;
    }

    if (photo_display_style === 'portrait') {
      const sizeClass = isSplit ? 'w-full' : 'w-48 h-64 md:w-56 md:h-80 lg:w-[22rem] lg:h-[36rem]';
      return (
        <div className={`relative flex-shrink-0 overflow-hidden ${sizeClass} ${shapeClass}`}>
          {photoImg('w-full h-full object-cover object-top shadow-2xl')}
        </div>
      );
    }

    if (photo_display_style === 'hexagon') {
      return (
        <div className={`relative flex-shrink-0 flex items-center justify-center ${circleClass}`}>
          <div className="absolute -inset-2 bg-gradient-to-br from-primary to-secondary opacity-30 blur-xl" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
          {photoImg(`w-full h-full object-cover shadow-2xl animate-fade-in`)}
        </div>
      );
    }

    if (photo_display_style === 'glass-card') {
      if (isCircle) {
        return (
          <div className={`relative flex-shrink-0 p-4 rounded-2xl ${isSplit ? 'w-full' : ''}`} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
            {photoImg(`${circleClass} object-cover ${shapeClass}`)}
          </div>
        );
      }
      return (
        <div className={`relative flex-shrink-0 p-4 rounded-2xl ${isSplit ? 'w-full' : ''}`} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
          {photoImg(`${isSplit ? 'w-full' : 'w-40 md:w-56 lg:w-72'} h-auto object-cover ${shapeClass}`)}
        </div>
      );
    }

    if (photo_display_style === 'bordered-frame') {
      if (isCircle) {
        return (
          <div className={`relative flex-shrink-0 ${circleClass}`}>
            <div className="absolute inset-0 border-4 border-primary rounded-full translate-x-3 translate-y-3" />
            {photoImg(`w-full h-full object-cover ${shapeClass} shadow-xl relative z-10`)}
          </div>
        );
      }
      return (
        <div className={`relative flex-shrink-0 ${wClass}`}>
          <div className="absolute inset-0 border-4 border-primary rounded-2xl translate-x-3 translate-y-3" />
          {photoImg(`w-full h-auto object-cover ${shapeClass} shadow-xl relative z-10`)}
        </div>
      );
    }

    if (isCircle) {
      return <div className={`relative flex-shrink-0 ${circleClass}`}>{photoImg(`w-full h-full object-cover shadow-xl ${shapeClass}`)}</div>;
    }
    return <div className={`relative flex-shrink-0 ${wClass}`}>{photoImg(`w-full h-auto object-cover shadow-xl ${shapeClass}`)}</div>;
  };

  // Content background styles
  const getContentBgStyle = () => {
    if (content_bg_type === 'none' || !content_bg_type) return {};
    
    if (content_bg_type === 'glass') {
      return { 
        background: 'var(--glass-bg)', 
        backdropFilter: 'blur(16px)', 
        WebkitBackdropFilter: 'blur(16px)', 
        border: '1px solid var(--glass-border)', 
        borderRadius: '1.5rem', 
        padding: '2rem' 
      };
    }
    
    if (content_bg_type === 'dark') {
      return { 
        background: 'rgba(15, 23, 42, 0.75)', 
        backdropFilter: 'blur(16px)', 
        WebkitBackdropFilter: 'blur(16px)', 
        border: '1px solid rgba(255, 255, 255, 0.1)', 
        borderRadius: '1.5rem', 
        padding: '2rem' 
      };
    }
    
    if (content_bg_type === 'gradient-left') {
      return { 
        background: 'linear-gradient(to right, rgba(15, 23, 42, 0.85) 0%, transparent 100%)', 
        backdropFilter: 'blur(12px)', 
        WebkitBackdropFilter: 'blur(12px)', 
        borderRadius: '1.5rem', 
        padding: '2rem 3rem 2rem 2rem' 
      };
    }
    
    return {};
  };

  // Render Text Content
  const renderTextContent = () => {
    const isCenteredLayout = layout_template === 'centered' || layout_template === 'photo-background';
    const effectiveAlignment = isCenteredLayout && text_alignment === 'left' ? 'center' : text_alignment;
    const alignClass = effectiveAlignment === 'center' ? 'text-center items-center font-center' : effectiveAlignment === 'right' ? 'text-right items-end' : 'text-left items-start';
    const HeadingTag = (heading_level || 'h1') as any;

    const renderItem = (item: string) => {
      switch (item) {
        case 'headline_group':
          return (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4 w-full">
              {(greeting || isPreview) && (
                <span className="text-secondary font-semibold tracking-wider uppercase text-sm md:text-base w-full">
                  <InlineResourceText resource="hero" id="active" field="greeting" defaultValue={greeting || 'Hello'} />
                  {title_prefix ? (
                    <>
                      , I am <InlineResourceText resource="hero" id="active" field="title_prefix" defaultValue={title_prefix} />
                    </>
                  ) : null}
                </span>
              )}
              <HeadingTag className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-heading-light ${isDarkBg ? 'drop-shadow-lg' : ''} w-full`}>
                <InlineResourceText resource="hero" id="active" field="headline" defaultValue={headline} />
              </HeadingTag>
            </div>
          );
        case 'professional_title':
          return (
            <h2 className="text-lg md:text-xl font-semibold mb-6 text-subheading w-full">
              <InlineResourceText resource="hero" id="active" field="professional_title" defaultValue={professional_title || ''} placeholder="Professional Title" />
            </h2>
          );
        case 'subheadline':
          return (
            <p className="text-lg md:text-xl leading-relaxed mb-6 text-text-light w-full">
              <InlineResourceText resource="hero" id="active" field="subheadline" multiline defaultValue={subheadline || ''} placeholder="Subheadline text..." />
            </p>
          );
        case 'highlighted_text':
          return (
            <p className="text-xl md:text-2xl font-semibold text-primary/90 italic mb-6 w-full">
              <InlineResourceText resource="hero" id="active" field="highlighted_text" defaultValue={highlighted_text || ''} placeholder="Highlighted text..." />
            </p>
          );
        case 'availability':
          return renderAvailability();
        case 'actions':
          return renderActions(false);
        case 'photo':
          if (layout_template === 'centered' || layout_template === 'photo-background') {
            return (
              <div className="flex flex-col items-center gap-6 my-6 w-full">
                {renderPhoto()}
              </div>
            );
          }
          return null;
        default:
          return null;
      }
    };

    return (
      <div className={`flex flex-col ${alignClass} z-10 relative w-full h-full ${isDarkBg && (!content_bg_type || content_bg_type === 'none') ? 'bg-black/60 p-6 rounded-2xl backdrop-blur-sm md:bg-transparent md:backdrop-blur-none md:p-0' : ''}`} style={getContentBgStyle()}>
        <InnerSortableLayout 
          items={elementOrder}
          onReorder={setElementOrder}
          renderItem={renderItem}
          isPreview={isPreview}
          className={`flex flex-col w-full ${alignClass}`}
        />
      </div>
    );
  };

  // Main Render Based on Layout
  let heightClass = 'min-h-0 py-4 md:py-8 lg:py-12';
  if (layout_template === 'photo-background') {
    heightClass = 'min-h-0 md:min-h-screen py-4 md:py-8 lg:py-12';
  } else if (full_height === 'full' || full_height === true) {
    heightClass = 'min-h-0 md:min-h-[80vh] py-4 md:py-8 lg:py-12';
  } else if (full_height === 'auto' || full_height === false) {
    heightClass = 'min-h-0 py-4 md:py-8 lg:py-12';
  }
  const animClass = animation_type === 'slide-up' ? 'animate-fade-in-up' : animation_type === 'fade' ? 'animate-fade-in' : '';

  const forceDarkClass = isDarkBg ? 'force-dark text-text-light' : '';

  return (
    <>
      <section id="hero" aria-label={accessibility_label || 'Hero Section'} className={`relative flex items-center justify-center overflow-hidden px-4 md:px-8 lg:px-16 ${heightClass} ${forceDarkClass}`}>
        {renderBackground()}

        {/* Split Layout */}
        {(layout_template === 'split' || layout_template === 'split-reverse') && (
          <div className={`w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-y-6 gap-x-8 lg:gap-x-16 z-10 ${animClass}`}>
            
            {/* Text Content */}
            <div className={`w-full flex items-stretch md:col-span-2 ${(layout_template === 'split-reverse' || photo_position === 'left') ? 'md:col-start-2 md:row-start-1' : 'md:col-start-1 md:row-start-1'}`}>
              {renderTextContent()}
            </div>

            {/* Photo */}
            <div className={`w-full flex items-center justify-center overflow-hidden ${(layout_template === 'split-reverse' || photo_position === 'left') ? 'md:col-start-1 md:row-start-1' : 'md:col-start-3 md:row-start-1'}`}>
              {renderPhoto(true)}
            </div>

          </div>
        )}

        {/* Centered Layout */}
        {layout_template === 'centered' && (
          <div className={`w-full max-w-4xl mx-auto flex flex-col items-center gap-8 md:gap-12 z-10 ${animClass}`}>
            <div className="w-full flex flex-col justify-center">
              {renderTextContent()}
            </div>
          </div>
        )}

        {/* Photo Background Layout */}
        {layout_template === 'photo-background' && (
          <div className={`w-full max-w-4xl mx-auto z-10 flex flex-col items-center ${animClass}`}>
            {renderTextContent()}
          </div>
        )}

      </section>

      {/* Actions Bar (below banner) */}
      {(cta_buttons?.length > 0 || social_links?.length > 0) && (
        <div className="w-full bg-[#0a0f1c] py-6 px-4 md:px-8 border-t border-white/5 shadow-inner relative z-20">
          <div className="max-w-7xl mx-auto flex justify-center">
            {renderActions(true)}
          </div>
        </div>
      )}
    </>
  );
}
