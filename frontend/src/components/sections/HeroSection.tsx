'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from 'next/link';
import { getSocialIcon } from '@/utils/socialIcons';

export default function HeroSection() {
  const [heroData, setHeroData] = useState<any>(null);
  const refreshKey = useRealtimeRefresh('hero');

  useEffect(() => {
    fetchApi('/hero/published').then(res => setHeroData(res.data)).catch(() => {});
  }, [refreshKey]);

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

  // Render Background
  const renderBackground = () => {
    // Override for Photo Background layout
    if (layout_template === 'photo-background' && image_url) {
      return (
        <div className="absolute inset-0 z-0">
          <img src={image_url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0" style={{ backgroundColor: bg_overlay_color || '#000', opacity: bg_overlay_opacity ?? 0.5 }} />
        </div>
      );
    }

    if (bg_type === 'solid') return <div className="absolute inset-0 z-0" style={{ backgroundColor: bg_color }} />;
    if (bg_type === 'gradient') return <div className={`absolute inset-0 z-0 ${bg_gradient}`} />;
    if (bg_type === 'image') return (
      <div className="absolute inset-0 z-0">
        <img src={bg_image_url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
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
    return null; // transparent
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
        <span className="text-sm font-medium text-text-light">{availability_text}</span>
      </div>
    );

    return availability_link ? (
      <Link href={availability_link} className="hover:opacity-80 transition-opacity w-fit">{badge}</Link>
    ) : badge;
  };

  // Render CTAs and Socials
  const renderActions = (isExternal: boolean = false) => {
    const hasCTAs = cta_buttons && cta_buttons.length > 0;
    const hasSocials = show_social_links && social_links && social_links.length > 0;
    
    if (!hasCTAs && !hasSocials) return null;
    
    const justifyClass = isExternal ? 'justify-center' : (text_alignment === 'center' ? 'justify-center' : text_alignment === 'right' ? 'justify-end' : 'justify-start');
    const marginClass = isExternal ? 'mt-0' : 'mt-8';
    
    return (
      <div className={`flex flex-nowrap items-center justify-center w-full gap-2 sm:gap-4 md:gap-6 ${marginClass} ${justifyClass}`}>
        {hasCTAs && cta_buttons.filter((btn: any) => !btn.is_hidden).map((btn: any, idx: number) => {
          let styles = '';
          if (btn.style === 'primary') styles = 'btn-primary';
          else if (btn.style === 'secondary') styles = 'btn-secondary';
          else if (btn.style === 'outline') styles = 'btn-outline';
          else if (btn.style === 'ghost') styles = 'btn-ghost';
          
          const btnClass = `btn flex-shrink min-w-[80px] text-center whitespace-nowrap text-xs sm:text-sm md:text-base px-2 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 ${styles}`;

          // File Download: force download via Cloudinary fl_attachment or fallback fetch+blob
          if (btn.link_type === 'file') {
            const handleDownload = async (e: React.MouseEvent) => {
              e.preventDefault();
              const url = btn.target || '';
              if (!url) return;
              
              // For Cloudinary URLs, add fl_attachment to force download
              if (url.includes('cloudinary.com')) {
                const dlUrl = url.replace('/upload/', '/upload/fl_attachment/');
                window.open(dlUrl, '_blank');
              } else {
                window.open(url, '_blank');
              }
            };
            return (
              <button key={idx} onClick={handleDownload} className={btnClass}>
                {btn.label}
              </button>
            );
          }

          // View File: open document for reading in browser
          if (btn.link_type === 'view') {
            const handleView = (e: React.MouseEvent) => {
              e.preventDefault();
              const url = btn.target || '';
              if (!url) return;

              const ext = url.split('.').pop()?.toLowerCase() || '';
              const officeExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
              
              if (officeExts.includes(ext)) {
                // Office docs: use Google Docs Viewer
                window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=false`, '_blank');
              } else {
                // PDFs, text, images: open directly in browser
                window.open(url, '_blank');
              }
            };
            return (
              <button key={idx} onClick={handleView} className={btnClass}>
                {btn.label}
              </button>
            );
          }

          // Internal (#section) and External (https://...) links
          return (
            <Link 
              key={idx} 
              href={btn.target || '#'} 
              target={btn.link_type === 'external' ? '_blank' : '_self'}
              className={btnClass}
            >
              {btn.label}
            </Link>
          );
        })}
        
        {hasCTAs && hasSocials && (
          <div className="hidden md:block w-px h-10 bg-text-light/20 mx-2" />
        )}
        
        {hasSocials && (
          <div className="hidden md:flex flex-wrap items-center gap-3">
            {social_links.filter((s: any) => s.is_favorite).map((social: any) => {
              const href = social.url?.startsWith('http') ? social.url : `https://${social.url}`;
              return (
                <Link 
                  key={social.id} 
                  href={href} 
                  target="_blank" 
                  className="w-11 h-11 rounded-full bg-slate-900/80 dark:bg-slate-800/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-white hover:border-primary hover:scale-110 hover:shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)] transition-all duration-300 shadow-md"
                  title={social.platform_name}
                >
                  {getSocialIcon(social.platform_name)}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render Photo
  const renderPhoto = (isSplit: boolean = false) => {
    if (!image_url) return null;
    
    let shapeClass = 'rounded-full';
    if (photo_shape === 'rounded') shapeClass = 'rounded-2xl';
    else if (photo_shape === 'squircle') shapeClass = 'rounded-[22%]';
    
    const isCircle = photo_shape === 'circle';

    // In split layout, image fills the column width; otherwise use small fixed sizes
    const wClass = isSplit ? 'w-full' : 'w-48 md:w-64 lg:w-80';
    const circleClass = isSplit ? 'w-full aspect-square max-w-[28rem]' : 'w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80';
    
    // --- Normal ---
    if (photo_display_style === 'normal') {
      if (isCircle) {
        return (
          <div className={`relative flex-shrink-0 ${circleClass}`}>
            <img src={image_url} alt={photo_alt_text || ''} loading="lazy" decoding="async" className={`w-full h-full object-cover shadow-xl ${shapeClass}`} />
          </div>
        );
      }
      return (
        <div className={`relative flex-shrink-0 ${wClass}`}>
          <img src={image_url} alt={photo_alt_text || ''} loading="lazy" decoding="async" className={`w-full h-auto object-cover shadow-xl ${shapeClass}`} />
        </div>
      );
    }

    // --- Circular Frame: glow ring ---
    if (photo_display_style === 'circular-frame') {
      if (isCircle) {
        return (
          <div className={`relative flex items-center justify-center flex-shrink-0 ${circleClass}`}>
            <div className="absolute -inset-3 bg-gradient-to-br from-primary to-secondary rounded-full blur-xl opacity-40 animate-pulse z-0" />
            <img src={image_url} alt={photo_alt_text || ''} loading="lazy" decoding="async" className={`w-full h-full object-cover border-4 border-gray-900 shadow-2xl relative z-10 ${shapeClass}`} />
          </div>
        );
      }
      return (
        <div className={`relative flex items-center justify-center flex-shrink-0 ${wClass}`}>
          <div className="absolute -inset-3 bg-gradient-to-br from-primary to-secondary blur-xl opacity-40 animate-pulse z-0 rounded-2xl" />
          <img src={image_url} alt={photo_alt_text || ''} loading="lazy" decoding="async" className={`w-full h-auto object-cover border-4 border-gray-900 shadow-2xl relative z-10 ${shapeClass}`} />
        </div>
      );
    }

    // --- Polaroid ---
    if (photo_display_style === 'polaroid') {
      const sizeClass = isSplit ? 'w-full' : 'w-48 h-56 md:w-64 md:h-72 lg:w-80 lg:h-96';
      return (
        <div className={`p-3 pb-12 bg-white shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500 flex-shrink-0 ${sizeClass}`}>
          <img src={image_url} alt={photo_alt_text || ''} loading="lazy" decoding="async" className="w-full h-full object-cover" />
        </div>
      );
    }

    // --- Floating Card: gentle float animation ---
    if (photo_display_style === 'floating-card') {
      if (isCircle) {
        return (
          <div className={`relative flex-shrink-0 ${circleClass}`} style={{ animation: 'floatY 4s ease-in-out infinite' }}>
            <style>{`@keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }`}</style>
            <img src={image_url} alt={photo_alt_text || ''} loading="lazy" decoding="async" className={`w-full h-full object-cover shadow-[0_30px_60px_rgba(0,0,0,0.6)] ${shapeClass}`} />
          </div>
        );
      }
      return (
        <div className={`relative flex-shrink-0 ${wClass}`} style={{ animation: 'floatY 4s ease-in-out infinite' }}>
          <style>{`@keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }`}</style>
          <img src={image_url} alt={photo_alt_text || ''} loading="lazy" decoding="async" className={`w-full h-auto object-cover shadow-[0_30px_60px_rgba(0,0,0,0.6)] ${shapeClass}`} />
        </div>
      );
    }

    // --- Cutout: transparent / no crop ---
    if (photo_display_style === 'cutout') {
      const sizeClass = isSplit ? 'w-full' : 'w-48 h-64 md:w-56 md:h-80 lg:w-72 lg:h-[36rem]';
      return (
        <div className={`relative ${sizeClass} flex-shrink-0`}>
          <img src={image_url} alt={photo_alt_text || ''} loading="lazy" decoding="async" className="w-full h-full object-contain drop-shadow-2xl" />
        </div>
      );
    }

    // --- Portrait: tall image, full body display ---
    if (photo_display_style === 'portrait') {
      const sizeClass = isSplit ? 'w-full' : 'w-48 h-64 md:w-56 md:h-80 lg:w-[22rem] lg:h-[36rem]';
      return (
        <div className={`relative flex-shrink-0 overflow-hidden ${sizeClass} ${shapeClass}`}>
          <img src={image_url} alt={photo_alt_text || ''} loading="lazy" decoding="async" className="w-full h-full object-cover object-top shadow-2xl" />
        </div>
      );
    }

    // --- Hexagon: geometric clip ---
    if (photo_display_style === 'hexagon') {
      return (
        <div className={`relative flex-shrink-0 flex items-center justify-center ${circleClass}`}>
          <div className="absolute -inset-2 bg-gradient-to-br from-primary to-secondary opacity-30 blur-xl" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
          <img src={image_url} alt={photo_alt_text || ''} className="w-full h-full object-cover shadow-2xl" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
        </div>
      );
    }

    // --- Glassmorphism Card: frosted glass frame ---
    if (photo_display_style === 'glass-card') {
      if (isCircle) {
        return (
          <div className={`relative flex-shrink-0 p-4 rounded-2xl ${isSplit ? 'w-full' : ''}`} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
            <img src={image_url} alt={photo_alt_text || ''} loading="lazy" decoding="async" className={`${circleClass} object-cover ${shapeClass}`} />
          </div>
        );
      }
      return (
        <div className={`relative flex-shrink-0 p-4 rounded-2xl ${isSplit ? 'w-full' : ''}`} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
          <img src={image_url} alt={photo_alt_text || ''} loading="lazy" decoding="async" className={`${isSplit ? 'w-full' : 'w-40 md:w-56 lg:w-72'} h-auto object-cover ${shapeClass}`} />
        </div>
      );
    }

    // --- Bordered Frame: decorative offset border ---
    if (photo_display_style === 'bordered-frame') {
      if (isCircle) {
        return (
          <div className={`relative flex-shrink-0 ${circleClass}`}>
            <div className="absolute inset-0 border-4 border-primary rounded-full translate-x-3 translate-y-3" />
            <img src={image_url} alt={photo_alt_text || ''} loading="lazy" decoding="async" className={`w-full h-full object-cover ${shapeClass} shadow-xl relative z-10`} />
          </div>
        );
      }
      return (
        <div className={`relative flex-shrink-0 ${wClass}`}>
          <div className="absolute inset-0 border-4 border-primary rounded-2xl translate-x-3 translate-y-3" />
          <img src={image_url} alt={photo_alt_text || ''} loading="lazy" decoding="async" className={`w-full h-auto object-cover ${shapeClass} shadow-xl relative z-10`} />
        </div>
      );
    }

    // Default fallback
    if (isCircle) {
      return (
        <div className={`relative flex-shrink-0 ${circleClass}`}>
          <img src={image_url} alt={photo_alt_text || ''} loading="lazy" decoding="async" className={`w-full h-full object-cover shadow-xl ${shapeClass}`} />
        </div>
      );
    }
    return (
      <div className={`relative flex-shrink-0 ${wClass}`}>
        <img src={image_url} alt={photo_alt_text || ''} loading="lazy" decoding="async" className={`w-full h-auto object-cover shadow-xl ${shapeClass}`} />
      </div>
    );
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
    // For centered and photo-background layouts, default to center alignment if it was left (which is default for split)
    const isCenteredLayout = layout_template === 'centered' || layout_template === 'photo-background';
    const effectiveAlignment = isCenteredLayout && text_alignment === 'left' ? 'center' : text_alignment;
    const alignClass = effectiveAlignment === 'center' ? 'text-center items-center' : effectiveAlignment === 'right' ? 'text-right items-end' : 'text-left items-start';
    const HeadingTag = (heading_level || 'h1') as any;
    
    // Determine if we are forcing dark mode text
    const isDarkBg = bg_type === 'image' || bg_type === 'video' || bg_type === 'animated' || bg_type === 'gradient' || layout_template === 'photo-background' || content_bg_type === 'dark' || content_bg_type === 'gradient-left';

    return (
      <div className={`flex flex-col ${alignClass} z-10 relative w-full h-full ${isDarkBg && (!content_bg_type || content_bg_type === 'none') ? 'bg-black/60 p-6 rounded-2xl backdrop-blur-sm md:bg-transparent md:backdrop-blur-none md:p-0' : ''}`} style={getContentBgStyle()}>
        
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4">
          {greeting && (
            <span className="text-secondary font-semibold tracking-wider uppercase text-sm md:text-base">
              {greeting}, I am{title_prefix ? ` ${title_prefix}` : ''}
            </span>
          )}
          <HeadingTag className={`text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight text-heading-light ${isDarkBg ? 'drop-shadow-lg' : ''}`}>
            {headline}
          </HeadingTag>
        </div>

        {professional_title && (
          <h2 className="text-lg md:text-xl font-semibold mb-6 text-subheading">
            {professional_title}
          </h2>
        )}

        {subheadline && (
          <p className="text-lg md:text-xl leading-relaxed mb-6 text-text-light">
            {subheadline}
          </p>
        )}

        {highlighted_text && (
          <p className="text-xl md:text-2xl font-semibold text-primary/90 italic mb-6">
            {highlighted_text}
          </p>
        )}

        {renderAvailability()}
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

  // Determine if we need to force dark mode (if the background is dark/image)
  const isDarkBg = bg_type === 'image' || bg_type === 'video' || bg_type === 'animated' || bg_type === 'gradient' || layout_template === 'photo-background' || content_bg_type === 'dark' || content_bg_type === 'gradient-left' || content_bg_type === 'glass';
  const forceDarkClass = isDarkBg ? 'force-dark text-text-light' : '';

  return (
    <>
      <section id="hero" aria-label={accessibility_label || 'Hero Section'} className={`relative flex items-center justify-center overflow-hidden px-0 md:px-8 lg:px-16 ${heightClass} ${forceDarkClass}`}>
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
            <div className="w-full flex flex-col justify-center order-1 md:order-2">
              {renderTextContent()}
            </div>
            <div className="flex flex-col items-center gap-6 order-2 md:order-1">
              {renderPhoto()}
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
