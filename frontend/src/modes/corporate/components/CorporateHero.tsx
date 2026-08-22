'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { fetchApi } from '@/utils/api';
import { getFileUrl } from '@/utils/urls';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import InlineResourceImage from '@/templateEngine/components/InlineResourceImage';
import { useInlineEdit } from '@/templateEngine/InlineEditContext';
import InlineButtonLink from '@/templateEngine/components/InlineButtonLink';

/* ─── Types ────────────────────────────────────────────────────────────────── */
export interface HeroSlide {
  id: string;
  slide_type?: 'service' | 'announcement' | 'marketing' | 'custom';
  badge?: string;
  headline?: string;
  highlighted_text?: string;
  subheadline?: string;
  cta_buttons?: Array<{ label: string; target: string; style?: string }>;
  media_url?: string;
  media_type?: 'image' | 'video';
  is_active?: boolean;
}

export interface RotationSettings {
  auto_rotate?: boolean;
  interval_sec?: number;
  pause_on_hover?: boolean;
  transition_effect?: 'fade' | 'slide';
}

interface HeroData {
  headline?: string;
  subheadline?: string;
  highlighted_text?: string;
  company_tagline?: string;
  promo_badge?: string;
  image_url?: string;
  mobile_image_url?: string;
  bg_type?: 'image' | 'video' | 'gradient' | 'color' | 'solid' | 'transparent' | 'animated';
  bg_image_url?: string;
  bg_video_url?: string;
  bg_color?: string;
  bg_gradient?: string;
  bg_overlay_color?: string;
  bg_overlay_opacity?: number;
  layout_template?: 'centered' | 'split' | 'photo-background';
  text_alignment?: 'left' | 'center' | 'right';
  full_height?: boolean;
  section_height?: string;
  show_scroll_indicator?: boolean;
  animation_type?: 'none' | 'fade' | 'slide-up' | 'slide-in';
  cta_buttons?: Array<{ label: string; target: string; style?: string }>;
  stats?: Array<{ number: string; suffix?: string; label: string }>;
  trust_indicators?: Array<{ icon: string; text: string }>;
  client_logos?: Array<{ name: string; logo_url: string }>;
  slides?: HeroSlide[];
  rotation_settings?: RotationSettings;
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
function buildHeadlineJSX(headline: string, highlighted?: string) {
  if (!highlighted || !headline.includes(highlighted)) {
    return <span>{headline}</span>;
  }
  const parts = headline.split(highlighted);
  return (
    <>
      {parts[0]}
      <span className="corp-hero-highlight">{highlighted}</span>
      {parts.slice(1).join(highlighted)}
    </>
  );
}

function getAlignClass(alignment?: string) {
  if (alignment === 'left') return 'text-left items-start';
  if (alignment === 'right') return 'text-right items-end';
  return 'text-center items-center';
}

function getSectionHeight(hero: HeroData) {
  if (hero.section_height && hero.section_height !== 'auto') return hero.section_height;
  if (hero.full_height) return '100vh';
  return '70vh';
}

/* ─── Sub-components ────────────────────────────────────────────────────────── */

/** Animated background — image or video */
function HeroBackground({ hero }: { hero: HeroData }) {
  const overlayOpacity = hero.bg_overlay_opacity ?? 0.45;
  const overlayColor = hero.bg_overlay_color || '#000000';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const videoUrl = hero.bg_video_url ? getFileUrl(hero.bg_video_url) : '';
  const bgImageUrl = hero.bg_image_url ? getFileUrl(hero.bg_image_url) : '';

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    // Strict browser autoplay policy requirements for videos with audio tracks:
    video.defaultMuted = true;
    video.muted = isMuted;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback: force mute and play
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {});
      });
    }
  }, [videoUrl, isMuted]);

  const isVideo = hero.bg_type === 'video' || (!!hero.bg_video_url && hero.bg_type !== 'image');

  const overlayStyle = {
    background: isVideo
      ? `linear-gradient(135deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.45) 100%), ${overlayColor}`
      : `linear-gradient(90deg, rgba(11, 17, 32, 0.88) 0%, rgba(15, 23, 42, 0.70) 55%, rgba(15, 23, 42, 0.45) 100%), ${overlayColor}`,
    opacity: overlayOpacity,
  };

  if (isVideo && videoUrl) {
    return (
      <>
        <video
          ref={videoRef}
          className="corp-hero-bg-media"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          onEnded={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.play().catch(() => {});
            }
          }}
          aria-hidden="true"
        />
        <div className="corp-hero-overlay" style={overlayStyle} />
        
        {/* Floating Sound Toggle */}
        <button
          type="button"
          onClick={() => {
            if (videoRef.current) {
              const nextMuted = !videoRef.current.muted;
              videoRef.current.muted = nextMuted;
              setIsMuted(nextMuted);
              videoRef.current.play().catch(() => {});
            }
          }}
          className="corp-hero-sound-btn"
          title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
          aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
        >
          <span>{isMuted ? '🔇' : '🔊'}</span>
          <span>{isMuted ? 'Sound Off' : 'Sound On'}</span>
        </button>
      </>
    );
  }

  if (bgImageUrl) {
    return (
      <>
        <div
          className="corp-hero-bg-media"
          style={{ backgroundImage: `url(${bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          aria-hidden="true"
        />
        <div className="corp-hero-overlay" style={overlayStyle} />
      </>
    );
  }

  if (hero.bg_gradient) {
    return <div className="corp-hero-bg-media" style={{ background: hero.bg_gradient }} aria-hidden="true" />;
  }

  if (hero.bg_color) {
    return <div className="corp-hero-bg-media" style={{ background: hero.bg_color }} aria-hidden="true" />;
  }

  return null;
}

/** Optional floating promo badge */
function PromoBadge({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <div className="corp-hero-promo-badge" role="note">
      {text}
    </div>
  );
}

/** Stats row: 500+ Clients | 10 Years | 98% Satisfaction */
function StatsRow({ stats }: { stats?: HeroData['stats'] }) {
  if (!stats?.length) return null;
  return (
    <div className="corp-hero-stats">
      {stats.map((s, i) => (
        <div key={i} className="corp-hero-stat-item">
          <span className="corp-hero-stat-number">
            {s.number}<span className="corp-hero-stat-suffix">{s.suffix || ''}</span>
          </span>
          <span className="corp-hero-stat-label">{s.label}</span>
          {i < stats.length - 1 && <div className="corp-hero-stat-divider" aria-hidden="true" />}
        </div>
      ))}
    </div>
  );
}

/** Trust indicators row: ⭐ 5-Star Rated  |  ✅ ISO Certified  |  🔒 Secure */
function TrustRow({ items }: { items?: HeroData['trust_indicators'] }) {
  if (!items?.length) return null;
  return (
    <div className="corp-hero-trust">
      {items.map((item, i) => (
        <span key={i} className="corp-hero-trust-item">
          <span className="corp-hero-trust-icon" aria-hidden="true">{item.icon}</span>
          {item.text}
        </span>
      ))}
    </div>
  );
}

/** Client logos strip */
function ClientLogos({ logos }: { logos?: HeroData['client_logos'] }) {
  if (!logos?.length) return null;
  return (
    <div className="corp-hero-logos-wrap">
      <p className="corp-hero-logos-label">Trusted by leading organizations</p>
      <div className="corp-hero-logos">
        {logos.map((logo, i) =>
          logo.logo_url ? (
            <img
              key={i}
              src={logo.logo_url}
              alt={logo.name}
              className="corp-hero-logo-img"
              loading="lazy"
            />
          ) : (
            <span key={i} className="corp-hero-logo-text">{logo.name}</span>
          )
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */
export default function CorporateHero() {
  const { isInlineEditing } = useInlineEdit();
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [showVideos, setShowVideos] = useState<HeroSlide[]>([]);
  const [visible, setVisible] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const refreshKey = useRealtimeRefresh('hero');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchApi('/corporate/hero/published')
      .then(res => setHeroData(res?.data || null))
      .catch(() => setHeroData(null));
    // Fetch active showcase videos and map them to HeroSlide shape
    fetchApi('/corporate/show-videos/active')
      .then(res => {
        const vids = (res?.data || []) as Array<{
          id: string; title: string; description: string;
          video_url: string; poster_url: string;
        }>;
        setShowVideos(vids.map(v => ({
          id: `show-video-${v.id}`,
          slide_type: 'marketing' as const,
          badge: '🎬 Watch',
          headline: v.title || 'Showcase Video',
          subheadline: v.description || '',
          highlighted_text: '',
          cta_buttons: [],
          media_url: v.video_url || '',
          media_type: 'video' as const,
          is_active: true,
        })));
      })
      .catch(() => setShowVideos([]));
  }, [refreshKey]);

  /* Entrance animation trigger */
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const hero = heroData || {};
  const layout = hero.layout_template || 'centered';
  const sectionH = getSectionHeight(hero);
  const animType = hero.animation_type || 'slide-up';

  // Main Content acts as the primary base slide (Slide 0)
  const mainContentSlide: HeroSlide = {
    id: 'main-content-default',
    slide_type: 'custom',
    badge: hero.company_tagline || 'Overview',
    headline: hero.headline || 'Building Digital Solutions That Scale',
    highlighted_text: hero.highlighted_text || '',
    subheadline: hero.subheadline || 'We help businesses transform with technology — from strategic consulting to scalable software.',
    cta_buttons: hero.cta_buttons || [],
    media_url: hero.image_url || '',
    media_type: 'image',
    is_active: true,
  };

  const additionalSlides = (hero.slides || []).filter(s => s.is_active !== false);
  // Append active showcase videos as video slides after rotating slides
  const activeSlides: HeroSlide[] = additionalSlides.length > 0 || showVideos.length > 0
    ? [mainContentSlide, ...additionalSlides, ...showVideos]
    : [mainContentSlide];

  const hasMultipleSlides = activeSlides.length > 1;
  const currentSlide: HeroSlide = activeSlides[currentSlideIndex] || activeSlides[0];

  const rotationSettings = hero.rotation_settings || {
    auto_rotate: true,
    interval_sec: 6,
    pause_on_hover: true,
    transition_effect: 'slide',
  };

  const nextSlide = useCallback(() => {
    if (!hasMultipleSlides) return;
    setCurrentSlideIndex(prev => (prev + 1) % activeSlides.length);
  }, [hasMultipleSlides, activeSlides.length]);

  const prevSlide = useCallback(() => {
    if (!hasMultipleSlides) return;
    setCurrentSlideIndex(prev => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [hasMultipleSlides, activeSlides.length]);

  const isVideoSlide = currentSlide?.media_type === 'video' && !!currentSlide?.media_url;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false); // Sound ON by default

  // Auto-rotation: skip interval entirely when on a video slide
  // (video advances via onEnded instead)
  const slidesCount = activeSlides.length;
  useEffect(() => {
    if (slidesCount <= 1) return;
    if (isVideoSlide) return; // let the video drive timing

    const intervalSec = rotationSettings.interval_sec || 5;
    const timer = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % slidesCount);
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [slidesCount, rotationSettings.interval_sec, isVideoSlide]);

  // When a video slide finishes playing → advance to next slide
  const handleVideoEnded = useCallback(() => {
    if (hasMultipleSlides) {
      setCurrentSlideIndex(prev => (prev + 1) % activeSlides.length);
    }
  }, [hasMultipleSlides, activeSlides.length]);

  // Restart video playback with sound enabled by default whenever we land on a video slide
  useEffect(() => {
    if (isVideoSlide && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {
        // If the browser enforces a strict user-gesture requirement for unmuted audio,
        // start playback muted and allow one-click instant unmute
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [isVideoSlide, currentSlideIndex, isMuted]);

  // ── Swipe & Drag Gesture Handling (Touch & Mouse) ──────────────────────────
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const mouseStartX = useRef<number | null>(null);

  const minSwipeDistance = 40; // Minimum horizontal px delta to trigger slide transition

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const deltaX = touchStartX.current - touchEndX.current;
    const deltaY = (touchStartY.current || 0) - (touchEndY.current || 0);

    // Dominant horizontal swipe detected
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swiped left -> load next slide
        nextSlide();
      } else {
        // Swiped right -> load prev slide
        prevSlide();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Don't drag-swipe when clicking buttons, links, inputs, or video controls
    if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('video') || target.closest('textarea')) {
      return;
    }
    isDragging.current = true;
    mouseStartX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current || mouseStartX.current === null) return;
    const deltaX = mouseStartX.current - e.clientX;
    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    isDragging.current = false;
    mouseStartX.current = null;
  };

  // Content extraction from the currently active slide
  const headline = currentSlide?.headline || hero.headline || 'Building Digital Solutions That Scale';
  const subheadline = currentSlide?.subheadline || (currentSlide as any)?.description || hero.subheadline || 'We help businesses transform with technology — from strategic consulting to scalable software.';
  const highlighted = currentSlide?.highlighted_text || hero.highlighted_text || '';
  const ctaButtons = currentSlide?.cta_buttons && currentSlide.cta_buttons.length > 0 ? currentSlide.cta_buttons : (hero.cta_buttons || []);
  const badgeText = currentSlide?.badge || hero.company_tagline || 'ENTERPRISE SOLUTIONS';
  
  // Media extraction
  const mediaSrc = currentSlide?.media_url ? getFileUrl(currentSlide.media_url) : (hero.image_url ? getFileUrl(hero.image_url) : '');
  const mediaType = currentSlide?.media_type || 'image';
  const hasMedia = !!mediaSrc;

  /* Build data-* attributes for CSS-driven layout switching */
  const dataAttrs = {
    'data-layout': layout,
    'data-align': hero.text_alignment || 'center',
    'data-anim': animType,
    'data-visible': String(visible),
  };

  return (
    <>
      {/* Scoped styles */}
      <style>{`
        /* ── Reset & base ─────────────────────────────────────── */
        .corp-hero-section {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
          isolation: isolate;
          min-height: ${sectionH};
        }
        @media (max-width: 768px) {
          .corp-hero-section {
            min-height: auto;
          }
        }

        /* ── Background layers ───────────────────────────────── */
        .corp-hero-bg-media {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
        }
        .corp-hero-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }

        /* ── Promo badge ─────────────────────────────────────── */
        .corp-hero-promo-badge {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 20;
          background: linear-gradient(135deg, #f97316, #ef4444);
          color: #fff;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          padding: 0.4rem 1rem;
          border-radius: 99px;
          box-shadow: 0 4px 20px rgba(239,68,68,0.4);
          animation: corp-hero-pulse 2.4s ease-in-out infinite;
          text-transform: uppercase;
        }
        @keyframes corp-hero-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(239,68,68,0.35); }
          50%       { box-shadow: 0 4px 32px rgba(249,115,22,0.65); }
        }

        /* ── Main layout wrapper ─────────────────────────────── */
        .corp-hero-inner {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 2.75rem 1.5rem 2.25rem;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* CENTERED layout */
        .corp-hero-section[data-layout="centered"] .corp-hero-content {
          text-align: center;
          align-items: center;
          max-width: 860px;
          margin: 0 auto;
        }

        /* SPLIT layout — desktop (min-width: 769px) */
        @media (min-width: 769px) {
          .corp-hero-section[data-layout="split"] .corp-hero-inner {
            flex-direction: row;
            align-items: center;
            gap: 3rem;
          }
          .corp-hero-section[data-layout="split"] .corp-hero-content {
            flex: 1 1 0;
            text-align: left;
            align-items: flex-start;
            order: 1;
          }
          .corp-hero-section[data-layout="split"] .corp-hero-media-col {
            flex: 1 1 0;
            order: 2;
          }
        }

        /* PHOTO-BACKGROUND layout — full bleed, content centered */
        .corp-hero-section[data-layout="photo-background"] .corp-hero-content {
          text-align: center;
          align-items: center;
          max-width: 800px;
          margin: 0 auto;
        }

        /* Dynamic text alignment overrides */
        .corp-hero-section[data-align="left"] .corp-hero-content  { text-align: left;  align-items: flex-start; }
        .corp-hero-section[data-align="right"] .corp-hero-content { text-align: right; align-items: flex-end;   }

        /* ── Entrance & Slide Transition animations ─────────── */
        .corp-hero-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        @media (min-width: 769px) {
          .corp-hero-content {
            min-height: 380px;
          }
        }
        .corp-hero-section[data-visible="true"] .corp-hero-content {
          opacity: 1;
          transform: none;
        }
        .corp-hero-media-col {
          opacity: 0;
          transform: translateX(20px);
          transition: opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s;
        }
        .corp-hero-section[data-visible="true"] .corp-hero-media-col {
          opacity: 1;
          transform: none;
        }

        /* ── Eyebrow pill ────────────────────────────────────── */
        .corp-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.95rem;
          border-radius: 99px;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(8px);
          border: 1px solid color-mix(in srgb, var(--color-primary, #3b82f6) 45%, transparent);
          color: var(--color-primary, #60a5fa);
          font-size: clamp(0.68rem, 1.2vw, 0.75rem);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1rem;
          width: fit-content;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
        }

        /* ── Headline ────────────────────────────────────────── */
        .corp-hero-headline {
          font-size: clamp(1.85rem, 4.4vw, 3.6rem);
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin-bottom: 0.875rem;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.95), 0 4px 30px rgba(0, 0, 0, 0.85);
        }
        .corp-hero-highlight {
          color: #ffffff !important;
          font-weight: 900;
          display: inline;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.95), 0 4px 30px rgba(0, 0, 0, 0.85);
        }

        /* ── Subheadline ─────────────────────────────────────── */
        .corp-hero-sub {
          font-size: clamp(0.92rem, 1.6vw, 1.15rem);
          line-height: 1.6;
          color: #f8fafc;
          max-width: 600px;
          margin-bottom: 1.25rem;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9), 0 4px 20px rgba(0, 0, 0, 0.8);
        }

        /* ── CTA buttons (Uniform Solid Blue with White Text) ── */
        .corp-hero-ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }
        .corp-hero-btn-primary,
        .corp-hero-btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.75rem;
          min-height: 46px;
          background: var(--color-primary, #3b82f6);
          color: #ffffff !important;
          font-weight: 700;
          font-size: clamp(0.88rem, 1.2vw, 0.95rem);
          border-radius: 99px;
          box-shadow: 0 8px 28px color-mix(in srgb, var(--color-primary, #3b82f6) 40%, transparent);
          transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
          text-decoration: none;
        }
        .corp-hero-btn-primary:hover,
        .corp-hero-btn-outline:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 36px color-mix(in srgb, var(--color-primary, #3b82f6) 55%, transparent);
          color: #ffffff !important;
          background: color-mix(in srgb, var(--color-primary, #3b82f6) 85%, #000);
        }

        /* ── Rotating Slide Carousel Navigation Controls ────── */
        .corp-hero-carousel-nav {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 0.6rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }
        .corp-hero-section[data-layout="centered"] .corp-hero-carousel-nav {
          justify-content: center;
        }
        .corp-hero-slide-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.85rem;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #cbd5e1;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          backdrop-filter: blur(8px);
        }
        .corp-hero-slide-tab:hover {
          background: rgba(255, 255, 255, 0.18);
          color: #ffffff;
        }
        .corp-hero-slide-tab.active {
          background: var(--color-primary, #3b82f6);
          border-color: var(--color-primary, #3b82f6);
          color: #ffffff;
          box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary, #3b82f6) 45%, transparent);
        }
        .corp-hero-arrow-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }
        .corp-hero-arrow-btn:hover {
          background: var(--color-primary, #3b82f6);
          border-color: var(--color-primary, #3b82f6);
          transform: scale(1.08);
        }

        /* ── Stats ───────────────────────────────────────────── */
        .corp-hero-stats {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }
        .corp-hero-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 1.25rem;
          position: relative;
        }
        .corp-hero-stat-item:first-child { padding-left: 0; }
        .corp-hero-stat-divider {
          position: absolute;
          right: 0;
          top: 10%;
          height: 80%;
          width: 1px;
          background: color-mix(in srgb, var(--color-text-light, #cbd5e1) 20%, transparent);
        }
        .corp-hero-stat-number {
          font-size: clamp(1.3rem, 2.2vw, 1.85rem);
          font-weight: 900;
          color: var(--color-heading-light, #f1f5f9);
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .corp-hero-stat-suffix {
          color: var(--color-primary, #3b82f6);
        }
        .corp-hero-stat-label {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: color-mix(in srgb, var(--color-text-light, #cbd5e1) 70%, transparent);
          margin-top: 0.25rem;
        }

        /* ── Trust indicators ────────────────────────────────── */
        .corp-hero-trust {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem 1.25rem;
          margin-top: 0.5rem;
        }
        .corp-hero-trust-item {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: clamp(0.75rem, 1.2vw, 0.82rem);
          font-weight: 600;
          color: #f1f5f9;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
        }
        .corp-hero-trust-icon {
          font-size: 0.95rem;
        }

        /* ── Client / Partner Logos Dedicated Strip Bar ───────── */
        .corp-logos-strip-bar {
          width: 100%;
          background: #020617;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.25rem 1.5rem;
          position: relative;
          z-index: 10;
        }
        .corp-logos-strip-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.875rem;
        }
        .corp-logos-strip-label {
          font-size: clamp(0.65rem, 1.2vw, 0.72rem);
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #94a3b8;
          text-transform: uppercase;
        }
        .corp-logos-strip-list {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1.25rem 2.25rem;
        }
        .corp-hero-logo-img {
          height: clamp(24px, 3.5vw, 34px);
          max-width: clamp(100px, 14vw, 140px);
          object-fit: contain;
          opacity: 0.92;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .corp-hero-logo-img:hover {
          opacity: 1;
          transform: translateY(-2px) scale(1.04);
        }
        .corp-hero-logo-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 1rem;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #ffffff;
          transition: all 0.25s ease;
        }
        .corp-hero-logo-badge:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        /* ── Media (image or video) ──────────────────────────── */
        .corp-hero-media-col { 
          width: 100%; 
        }
        .corp-hero-media-wrap {
          width: 100%;
          height: clamp(240px, 35vw, 380px);
          border-radius: 1.25rem;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(15, 23, 42, 0.6);
        }
        .corp-hero-media-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* ── Scroll indicator ────────────────────────────────── */
        .corp-hero-scroll {
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          opacity: 0.55;
          animation: corp-hero-scroll-bob 2s ease-in-out infinite;
          cursor: default;
        }
        .corp-hero-scroll-mouse {
          width: 22px;
          height: 36px;
          border: 2px solid currentColor;
          border-radius: 99px;
          display: flex;
          justify-content: center;
          padding-top: 5px;
        }
        .corp-hero-scroll-dot {
          width: 4px;
          height: 8px;
          background: currentColor;
          border-radius: 99px;
          animation: corp-hero-scroll-dot 2s ease-in-out infinite;
        }
        @keyframes corp-hero-scroll-bob {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(6px); }
        }

        /* ── Sound Toggle Button ────────────────────────────── */
        .corp-hero-sound-btn {
          position: absolute;
          bottom: 1.5rem;
          right: 2rem;
          z-index: 25;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.4rem 0.85rem;
          border-radius: 99px;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }
        .corp-hero-sound-btn:hover {
          background: rgba(0, 0, 0, 0.8);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }

        /* ── Responsive Mobile Overrides (Media First & Clean Organization) ── */
        @media (max-width: 768px) {
          .corp-hero-section .corp-hero-inner,
          .corp-hero-section[data-layout="split"] .corp-hero-inner,
          .corp-hero-inner {
            display: flex !important;
            flex-direction: column !important;
            gap: 1.25rem !important;
            padding: 1.25rem 1rem 3.5rem 1rem !important;
          }
          .corp-hero-section .corp-hero-promo-badge,
          .corp-hero-promo-badge {
            position: relative !important;
            top: auto !important;
            right: auto !important;
            left: auto !important;
            order: 0 !important;
            margin: 0 auto 0.5rem auto !important;
            display: table !important;
            font-size: 0.7rem !important;
            padding: 0.35rem 0.85rem !important;
            z-index: 10 !important;
            text-align: center !important;
          }
          .corp-hero-section .corp-hero-media-col,
          .corp-hero-section[data-layout="split"] .corp-hero-media-col,
          .corp-hero-media-col {
            order: 1 !important; /* Starts with Image or Video on mobile */
            width: 100% !important;
            margin-bottom: 0.25rem !important;
          }
          .corp-hero-section .corp-hero-media-wrap,
          .corp-hero-section[data-layout="split"] .corp-hero-media-wrap,
          .corp-hero-media-wrap {
            height: clamp(210px, 54vw, 290px) !important;
            border-radius: 1rem !important;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45) !important;
            border: 1px solid rgba(255, 255, 255, 0.12) !important;
          }
          .corp-hero-section .corp-hero-content,
          .corp-hero-section[data-layout="split"] .corp-hero-content,
          .corp-hero-content {
            order: 2 !important; /* Content organized below media on mobile */
            text-align: center !important;
            align-items: center !important;
            width: 100% !important;
          }
          .corp-hero-eyebrow {
            margin-bottom: 0.75rem !important;
            margin-left: auto !important;
            margin-right: auto !important;
            font-size: 0.7rem !important;
          }
          .corp-hero-headline {
            font-size: clamp(1.65rem, 5vw, 2.35rem) !important;
            margin-bottom: 0.75rem !important;
            line-height: 1.2 !important;
            text-align: center !important;
          }
          .corp-hero-sub {
            font-size: 0.92rem !important;
            margin-bottom: 1.25rem !important;
            line-height: 1.55 !important;
            max-width: 100% !important;
            text-align: center !important;
          }
          .corp-hero-stats {
            justify-content: center !important;
            gap: 0.75rem !important;
          }
          .corp-hero-stat-item {
            padding: 0 0.85rem !important;
          }
          .corp-hero-stat-item:first-child { 
            padding-left: 0.85rem !important; 
          }
          .corp-hero-trust {
            justify-content: center !important;
            gap: 0.5rem 1rem !important;
            margin-top: 0.75rem !important;
          }
          .corp-hero-ctas {
            display: flex !important;
            flex-direction: row !important;
            justify-content: center !important;
            gap: 0.6rem !important;
            width: 100% !important;
            margin-bottom: 0.75rem !important;
          }
          .corp-hero-ctas > * {
            flex: 1 1 0 !important;
            min-width: 130px !important;
            max-width: 220px !important;
            padding: 0.75rem 1rem !important;
            font-size: 0.85rem !important;
            text-align: center !important;
            justify-content: center !important;
          }
          .corp-hero-sound-btn {
            bottom: 0.75rem;
            right: 0.75rem;
            padding: 0.35rem 0.75rem;
            font-size: 0.7rem;
          }
          .corp-logos-strip-bar {
            padding: 1rem 1rem;
          }
          .corp-logos-strip-list {
            gap: 0.85rem 1.5rem;
          }
        }

        /* ── Floating Slider Left / Right Navigation Arrows ──── */
        .corp-hero-nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 30;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          font-size: 1.4rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0.75;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }
        .corp-hero-nav-arrow:hover {
          opacity: 1;
          background: var(--color-primary, #3b82f6);
          border-color: var(--color-primary, #3b82f6);
          transform: translateY(-50%) scale(1.1);
        }
        .corp-hero-nav-arrow-prev {
          left: 1.25rem;
        }
        .corp-hero-nav-arrow-next {
          right: 1.25rem;
        }

        /* ── Slide Pagination Indicator Dots ─────────────────── */
        .corp-hero-dots-container {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 30;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.75rem;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(10px);
          border-radius: 99px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .corp-hero-dot {
          width: 8px;
          height: 8px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.35);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .corp-hero-dot:hover {
          background: rgba(255, 255, 255, 0.7);
        }
        .corp-hero-dot.active {
          width: 22px;
          background: var(--color-primary, #3b82f6);
          box-shadow: 0 0 10px var(--color-primary, #3b82f6);
        }

        /* ── Floating Video Sound Toggle Button ────────────── */
        .corp-hero-sound-toggle-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 25;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.85rem;
          border-radius: 99px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
        }
        .corp-hero-sound-toggle-btn:hover {
          background: var(--color-primary, #3b82f6);
          border-color: var(--color-primary, #3b82f6);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .corp-hero-nav-arrow {
            display: none;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        className="corp-hero-section"
        {...dataAttrs}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={() => { if (rotationSettings.pause_on_hover !== false) setIsPaused(true); }}
        onMouseLeave={() => { if (rotationSettings.pause_on_hover !== false) setIsPaused(false); }}
        aria-label={headline || 'Hero banner'}
      >
        {/* Background (Static Image or Video) */}
        <HeroBackground hero={hero} />

        {/* Floating Navigation Arrows when multiple slides exist */}
        {hasMultipleSlides && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="corp-hero-nav-arrow corp-hero-nav-arrow-prev"
              aria-label="Previous slide"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="corp-hero-nav-arrow corp-hero-nav-arrow-next"
              aria-label="Next slide"
            >
              ›
            </button>
          </>
        )}

        {/* Slide Pagination Dots */}
        {hasMultipleSlides && (
          <div className="corp-hero-dots-container" aria-label="Slide indicators">
            {activeSlides.map((s, idx) => (
              <button
                key={s.id || idx}
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrentSlideIndex(idx); }}
                className={`corp-hero-dot ${idx === currentSlideIndex ? 'active' : ''}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        <div className="corp-hero-inner">

          {/* Optional Promo Badge */}
          <PromoBadge text={hero.promo_badge} />

          {/* ── Content column ── */}
          <div className="corp-hero-content">

            {/* Active Slide Category / Eyebrow Pill */}
            {(badgeText || isInlineEditing) && (
              <div className="corp-hero-eyebrow">
                <InlineResourceText resource="hero" id="active" field="company_tagline" defaultValue={badgeText} />
              </div>
            )}

            {/* Headline */}
            {(headline || isInlineEditing) && (
              <h1 className="corp-hero-headline">
                {isInlineEditing ? (
                  <InlineResourceText resource="hero" id="active" field="headline" defaultValue={headline} />
                ) : (
                  buildHeadlineJSX(headline, highlighted)
                )}
              </h1>
            )}

            {/* Subheadline */}
            {(subheadline || isInlineEditing) && (
              <p className="corp-hero-sub">
                <InlineResourceText resource="hero" id="active" field="subheadline" multiline defaultValue={subheadline} />
              </p>
            )}

            {/* CTA Buttons (Uniform Solid Blue with White Text) */}
            <div className="corp-hero-ctas">
              {ctaButtons.length > 0 ? (
                ctaButtons.map((btn, idx) => (
                  <InlineButtonLink
                    key={idx}
                    href={btn.target || '/contact'}
                    className="corp-hero-btn-primary"
                  >
                    <InlineResourceText resource="hero" id={`cta_${idx}`} field="label" defaultValue={btn.label || 'Get Started'} />
                  </InlineButtonLink>
                ))
              ) : (
                <>
                  <InlineButtonLink href="/contact" className="corp-hero-btn-primary">
                    <InlineResourceText resource="hero" id="cta_0" field="label" defaultValue="Get Started" />
                  </InlineButtonLink>
                  <InlineButtonLink href="/services" className="corp-hero-btn-primary">
                    <InlineResourceText resource="hero" id="cta_1" field="label" defaultValue="Our Services" />
                  </InlineButtonLink>
                </>
              )}
            </div>

            {/* Trust indicators */}
            <TrustRow items={hero.trust_indicators} />
          </div>

          {/* ── Media column (split layouts) ── */}
          {layout === 'split' && hasMedia && (
            <div className="corp-hero-media-col">
              <div className="corp-hero-media-wrap">
                {mediaType === 'video' && mediaSrc ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <video
                      ref={videoRef}
                      key={mediaSrc}
                      src={mediaSrc}
                      className="corp-hero-media-img"
                      controls
                      autoPlay
                      muted={isMuted}
                      playsInline
                      onEnded={handleVideoEnded}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = !isMuted;
                        setIsMuted(next);
                        if (videoRef.current) {
                          videoRef.current.muted = next;
                          if (!next) videoRef.current.play().catch(() => {});
                        }
                      }}
                      className="corp-hero-sound-toggle-btn"
                      aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    >
                      {isMuted ? '🔇 Sound Off' : '🔊 Sound On'}
                    </button>
                  </div>
                ) : (
                  <img
                    src={mediaSrc}
                    alt={headline || 'Hero media'}
                    className="corp-hero-media-img"
                  />
                )}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Dedicated Client Logos Strip Bar directly below Hero Banner */}
      {!!hero.client_logos?.length && (
        <section className="corp-logos-strip-bar" aria-label="Trusted by leading organizations">
          <div className="corp-logos-strip-inner">
            <p className="corp-logos-strip-label">TRUSTED BY LEADING ORGANIZATIONS</p>
            <div className="corp-logos-strip-list">
              {hero.client_logos.map((logo, i) =>
                logo.logo_url ? (
                  <img
                    key={i}
                    src={logo.logo_url}
                    alt={logo.name}
                    className="corp-hero-logo-img"
                    loading="lazy"
                  />
                ) : (
                  <span key={i} className="corp-hero-logo-text">{logo.name}</span>
                )
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
