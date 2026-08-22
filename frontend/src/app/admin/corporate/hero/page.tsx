'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import FilePicker from '@/components/FilePicker';
import { getFileUrl } from '@/utils/urls';
import ShowVideoTab from './ShowVideoTab';

/* ─── Types ────────────────────────────────────────────────────────────────── */
export interface AdminSlide {
  id: string;
  slide_type: 'service' | 'announcement' | 'marketing' | 'custom';
  badge: string;
  headline: string;
  highlighted_text: string;
  subheadline: string;
  cta_buttons: Array<{ label: string; target: string; style: string }>;
  media_url: string;
  media_type: 'image' | 'video';
  is_active: boolean;
}

export interface AdminRotationSettings {
  auto_rotate: boolean;
  interval_sec: number;
  pause_on_hover: boolean;
  transition_effect: 'slide' | 'fade';
}

/* ─── Default form ─────────────────────────────────────────────────────────── */
const emptyForm = {
  internal_name: 'Corporate Hero',
  is_active: true,
  status: 'published',

  // Content
  company_tagline: '',
  headline: '',
  highlighted_text: '',
  subheadline: '',
  promo_badge: '',

  // Media & Video
  image_url: '',
  mobile_image_url: '',
  bg_image_url: '',
  bg_video_url: '',
  bg_type: 'transparent',
  bg_color: '',
  bg_gradient: '',
  bg_overlay_color: '#000000',
  bg_overlay_opacity: 0.45,

  // Showcase / Show Video
  showcase_video_url: '',
  showcase_video_title: '',
  showcase_video_description: '',
  showcase_video_poster: '',
  show_showcase_video: true,

  // CTAs — stored as JSON array
  cta_buttons: [] as Array<{ label: string; target: string; style: string }>,

  // Layout
  layout_template: 'centered',
  text_alignment: 'center',
  full_height: false,
  section_height: 'auto',
  show_scroll_indicator: true,
  animation_type: 'slide-up',

  // Social proof
  stats: [] as Array<{ number: string; suffix: string; label: string }>,
  trust_indicators: [] as Array<{ icon: string; text: string }>,
  client_logos: [] as Array<{ name: string; logo_url: string }>,

  // Rotating Slides Carousel
  slides: [] as AdminSlide[],
  rotation_settings: {
    auto_rotate: true,
    interval_sec: 6,
    pause_on_hover: true,
    transition_effect: 'slide' as 'slide' | 'fade',
  },
};

type FormData = typeof emptyForm;

function parseJson<T>(val: any, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (Array.isArray(fallback) && Array.isArray(val)) return val as T;
  if (!Array.isArray(fallback) && typeof val === 'object') return val as T;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/* ─── Small reusable label ─────────────────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-text-light/60 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

function FieldInput({
  label, value, onChange, placeholder, hint, maxLength,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; maxLength?: number }) {
  const currentLength = (value || '').length;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-bold text-text-light/60 uppercase tracking-wider">
          {label}{hint && <span className="ml-2 font-normal normal-case text-text-light/40">{hint}</span>}
        </label>
        {maxLength && (
          <span className={`text-[11px] font-semibold ${currentLength >= maxLength ? 'text-rose-400 font-bold' : currentLength > maxLength * 0.85 ? 'text-amber-400' : 'text-text-light/40'}`}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      <input
        type="text" value={value || ''}
        maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
      />
    </div>
  );
}

function TextareaInput({
  label, value, onChange, placeholder, hint, maxLength, rows = 3,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; maxLength?: number; rows?: number }) {
  const currentLength = (value || '').length;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-bold text-text-light/60 uppercase tracking-wider">
          {label}{hint && <span className="ml-2 font-normal normal-case text-text-light/40">{hint}</span>}
        </label>
        {maxLength && (
          <span className={`text-[11px] font-semibold ${currentLength >= maxLength ? 'text-rose-400 font-bold' : currentLength > maxLength * 0.85 ? 'text-amber-400' : 'text-text-light/40'}`}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        value={value || ''}
        maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
      />
    </div>
  );
}

/* ─── Main admin component ─────────────────────────────────────────────────── */
export default function CorporateAdminHero() {
  useRealtimeRefresh('hero', false);
  const [formData, setFormData] = useState<FormData>({ ...emptyForm });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [selectedSlideCategory, setSelectedSlideCategory] = useState<'service' | 'announcement' | 'marketing' | 'custom'>('service');
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [filePickerTarget, setFilePickerTarget] = useState<string | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Slides UX state
  const [slideDraft, setSlideDraft] = useState<AdminSlide | null>(null);   // unsaved new-slide form
  const [expandedSlideId, setExpandedSlideId] = useState<string | null>(null); // which saved slide is in edit mode

  /* Load existing hero */
  const loadData = useCallback(() => {
    fetchApi('/corporate/hero')
      .catch(() => fetchApi('/hero'))
      .then(res => {
        const heroes = res?.data || [];
        const hero = heroes.find((h: any) => h.internal_name === 'Corporate Hero') || heroes[0] || null;
        if (hero) {
          setFormData({
            ...emptyForm,
            ...hero,
            cta_buttons: parseJson(hero.cta_buttons, []),
            stats: parseJson(hero.stats, []),
            trust_indicators: parseJson(hero.trust_indicators, []),
            client_logos: parseJson(hero.client_logos, []),
            slides: parseJson(hero.slides, []),
            rotation_settings: parseJson(hero.rotation_settings, emptyForm.rotation_settings),
          });
          setIsEditing(true);
          setEditId(hero.id);
        }
      }).catch(console.error);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* Auto-save with debounce */
  const autoSave = useCallback(async (data: FormData) => {
    setSaveStatus('saving');
    setSaveError(null);
    try {
      // headline is NOT NULL in the DB — send empty string rather than undefined
      const payload = { ...data, headline: data.headline || '' };
      if (isEditing && editId) {
        try {
          await fetchApi(`/corporate/hero/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
        } catch {
          await fetchApi(`/hero/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
        }
      } else {
        let res;
        try {
          res = await fetchApi('/corporate/hero', { method: 'POST', body: JSON.stringify({ ...payload, is_active: true, status: 'published' }) });
        } catch {
          res = await fetchApi('/hero', { method: 'POST', body: JSON.stringify({ ...payload, is_active: true, status: 'published' }) });
        }
        if (res?.data?.id) { setEditId(res.data.id); setIsEditing(true); }
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err: any) {
      setSaveStatus('error');
      setSaveError(err?.message || 'Save failed — check your connection or try again.');
      setTimeout(() => { setSaveStatus('idle'); setSaveError(null); }, 5000);
    }
  }, [isEditing, editId]);

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value } as FormData;
    setFormData(updated);
    setSaveStatus('idle');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => autoSave(updated), 900);
  };

  const openFilePicker = (field: string) => { setFilePickerTarget(field); setShowFilePicker(true); };

  // Callback ref — ShowVideoTab registers its own handler here for 'sv_' prefixed targets
  const showVideoPickerCb = useRef<((field: string, url: string) => void) | null>(null);
  
  const handleFileSelected = (url: string) => {
    if (filePickerTarget) {
      if (filePickerTarget === 'bg_video_url') {
        const updated = { ...formData, bg_video_url: url, bg_type: 'video' };
        setFormData(updated);
        setSaveStatus('idle');
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => autoSave(updated), 900);
      } else if (filePickerTarget === 'bg_image_url') {
        const updated = { ...formData, bg_image_url: url, bg_type: 'image' };
        setFormData(updated);
        setSaveStatus('idle');
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => autoSave(updated), 900);
      } else if (filePickerTarget === 'slide_draft_media') {
        setSlideDraft(prev => prev ? { ...prev, media_url: url } : prev);
      } else if (filePickerTarget.startsWith('slide_media_')) {
        const slideId = filePickerTarget.replace('slide_media_', '');
        const updatedSlides = (formData.slides || []).map(s => s.id === slideId ? { ...s, media_url: url } : s);
        handleChange('slides', updatedSlides);
      } else if (filePickerTarget.startsWith('sv_')) {
        // Routed to ShowVideoTab via callback ref
        if (showVideoPickerCb.current) {
          showVideoPickerCb.current(filePickerTarget, url);
        }
      } else {
        handleChange(filePickerTarget, url);
      }
    }
    setShowFilePicker(false);
    setFilePickerTarget(null);
  };


  /* ── JSON array helpers ── */
  function updateArrayItem<T>(arr: T[] | undefined, index: number, patch: Partial<T>): T[] {
    const list = arr || [];
    return list.map((item, i) => i === index ? { ...item, ...patch } : item);
  }
  function removeArrayItem<T>(arr: T[] | undefined, index: number): T[] {
    const list = arr || [];
    return list.filter((_, i) => i !== index);
  }
  function moveArrayItem<T>(arr: T[] | undefined, fromIndex: number, toIndex: number): T[] {
    const list = arr || [];
    if (toIndex < 0 || toIndex >= list.length) return list;
    const result = [...list];
    const [moved] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, moved);
    return result;
  }

  // Open a blank draft form for the current category (only if not already open)
  const openDraftForm = (type: 'service' | 'announcement' | 'marketing' | 'custom') => {
    setExpandedSlideId(null); // collapse any inline edit
    setSlideDraft({
      id: `slide_${Date.now()}`,
      slide_type: type,
      badge: '',
      headline: '',
      highlighted_text: '',
      subheadline: '',
      cta_buttons: [],
      media_url: '',
      media_type: type === 'marketing' ? 'video' : 'image',
      is_active: true,
    });
  };

  // Commit draft → push to slides array → auto-save
  const commitDraft = () => {
    if (!slideDraft) return;
    handleChange('slides', [...(formData.slides || []), slideDraft]);
    setSlideDraft(null);
  };

  // Toggle inline editor for a saved slide
  const toggleExpandSlide = (id: string) => {
    setSlideDraft(null); // close draft form
    setExpandedSlideId(prev => (prev === id ? null : id));
  };

  const tabs = [
    { id: 'content',  icon: '📝', label: 'Main Content' },
    { id: 'slides',   icon: '🔄', label: 'Rotating Slides' },
    { id: 'video',    icon: '🎬', label: 'Show Video' },
    { id: 'media',    icon: '🖼️', label: 'Images & Background' },
    { id: 'proof',    icon: '🏆', label: 'Social Proof' },
    { id: 'layout',   icon: '🎨', label: 'Layout & Style' },
  ];

  const categories = [
    { id: 'service' as const,      icon: '💼', label: 'Services' },
    { id: 'announcement' as const, icon: '📢', label: 'Announcements' },
    { id: 'marketing' as const,    icon: '🎬', label: 'Marketing Videos' },
    { id: 'custom' as const,       icon: '✨', label: 'Custom' },
  ];

  const safeSlides = formData.slides || [];
  const safeCtaButtons = formData.cta_buttons || [];
  const safeStats = formData.stats || [];
  const safeTrust = formData.trust_indicators || [];
  const safeLogos = formData.client_logos || [];
  const safeRotation = formData.rotation_settings || emptyForm.rotation_settings;

  // Filter slides for currently selected category
  const filteredCategorySlides = safeSlides
    .map((slide, globalIndex) => ({ slide, globalIndex }))
    .filter(item => item.slide.slide_type === selectedSlideCategory);

  const selectedCategoryMeta = categories.find(c => c.id === selectedSlideCategory) || categories[0];

  return (
    <div className="min-h-screen bg-bg-dark text-text-light p-4 md:p-8">

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-heading-light flex items-center gap-2">
            <span className="text-2xl">🏢</span> Corporate Hero Section
          </h1>
          <p className="text-text-light/60 mt-1 text-sm">Design your company's homepage banner with multi-slide rotation, services, announcements, and marketing videos</p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && <span className="text-xs text-yellow-400 animate-pulse">Saving…</span>}
          {saveStatus === 'saved'  && <span className="text-xs text-green-400">✓ Saved</span>}
          {saveStatus === 'error'  && <span className="text-xs text-red-400" title={saveError || ''}>✕ Save failed</span>}
          <button
            onClick={() => autoSave(formData)}
            className="px-5 py-2 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors"
          >
            Save Now
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="glass rounded-2xl border border-white/10 overflow-hidden sticky top-24">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-colors border-b border-white/5 last:border-0 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-primary/20 text-primary border-l-2 border-l-primary'
                    : 'text-text-light/70 hover:text-text-light hover:bg-white/5'
                }`}
              >
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main form */}
        <div className="lg:col-span-3 space-y-4">

          {/* ─── ROTATING SLIDES TAB ─── */}
          {activeTab === 'slides' && (
            <div className="space-y-5">
              {/* Rotation Settings Card */}
              <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-heading-light flex items-center gap-2">
                    <span>🔄</span> Rotating Hero Banner Slides
                  </h2>
                  <p className="text-xs text-text-light/60 mt-1">
                    Select a category below to view its slides or add new ones. Each slide auto-cycles on your homepage.
                  </p>
                </div>

                {/* Rotation Settings */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-text-light/80">Auto-Rotate</p>
                      <p className="text-[11px] text-text-light/40">Automatically cycle through slides</p>
                    </div>
                    <button
                      onClick={() => handleChange('rotation_settings', { ...safeRotation, auto_rotate: !safeRotation.auto_rotate })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${safeRotation.auto_rotate !== false ? 'bg-primary' : 'bg-white/20'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${safeRotation.auto_rotate !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  <div>
                    <Label>Rotation Interval</Label>
                    <div className="flex gap-2">
                      {[4, 6, 8, 10].map(sec => (
                        <button
                          key={sec}
                          onClick={() => handleChange('rotation_settings', { ...safeRotation, interval_sec: sec })}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            (safeRotation.interval_sec || 6) === sec
                              ? 'bg-primary/20 text-primary border-primary/50'
                              : 'bg-white/5 border-white/10 text-text-light/60'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div>
                  <Label>Category — click to filter &amp; manage slides</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {categories.map(cat => {
                      const count = safeSlides.filter(s => s.slide_type === cat.id).length;
                      const isSelected = selectedSlideCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedSlideCategory(cat.id);
                            setSlideDraft(null);
                            setExpandedSlideId(null);
                          }}
                          className={`p-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 text-center border ${
                            isSelected
                              ? 'bg-primary/20 border-primary text-primary shadow-lg ring-1 ring-primary/40'
                              : 'bg-white/5 border-white/10 text-text-light/70 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <span className="text-xl">{cat.icon}</span>
                          <span className="text-xs">{cat.label}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isSelected ? 'bg-primary text-white' : 'bg-white/10 text-text-light/50'
                          }`}>
                            {count} {count === 1 ? 'slide' : 'slides'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Section for the selected category ── */}
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-center justify-between flex-wrap gap-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{selectedCategoryMeta.icon}</span>
                    <h3 className="text-sm font-bold text-heading-light">
                      {selectedCategoryMeta.label}
                      <span className="ml-2 text-text-light/40 font-normal">({filteredCategorySlides.length} saved)</span>
                    </h3>
                  </div>
                  {/* Only show "+ New Slide" if no draft is open */}
                  {!slideDraft && (
                    <button
                      type="button"
                      onClick={() => openDraftForm(selectedSlideCategory)}
                      className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow"
                    >
                      <span>+</span> New {selectedCategoryMeta.label} Slide
                    </button>
                  )}
                </div>

                {/* ── DRAFT FORM (create new) ── */}
                {slideDraft && slideDraft.slide_type === selectedSlideCategory && (
                  <div className="glass rounded-2xl border border-primary/30 p-6 space-y-4 shadow-lg shadow-primary/5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{selectedCategoryMeta.icon}</span>
                        <span className="text-sm font-bold text-primary">New {selectedCategoryMeta.label} Slide</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-500/20 text-yellow-400">Unsaved Draft</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSlideDraft(null)}
                        className="text-xs text-text-light/40 hover:text-red-300 transition-colors"
                      >✕ Discard</button>
                    </div>

                    {/* Draft fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FieldInput
                        label="Badge / Tab Pill"
                        value={slideDraft.badge || ''}
                        onChange={v => setSlideDraft(prev => prev ? { ...prev, badge: v } : prev)}
                        placeholder="e.g. Cloud Architecture"
                        maxLength={47}
                      />
                      <FieldInput
                        label="Accent Highlight Word"
                        value={slideDraft.highlighted_text || ''}
                        onChange={v => setSlideDraft(prev => prev ? { ...prev, highlighted_text: v } : prev)}
                        placeholder="Word in headline"
                        maxLength={31}
                      />
                    </div>

                    <FieldInput
                      label="Headline *"
                      value={slideDraft.headline || ''}
                      onChange={v => setSlideDraft(prev => prev ? { ...prev, headline: v } : prev)}
                      placeholder="Slide headline"
                      maxLength={68}
                    />

                    <TextareaInput
                      label="Description"
                      value={slideDraft.subheadline || ''}
                      onChange={v => setSlideDraft(prev => prev ? { ...prev, subheadline: v } : prev)}
                      placeholder="Slide description text"
                      rows={2}
                      maxLength={165}
                    />

                    <div>
                      <Label>Slide Media (Image or Video)</Label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={slideDraft.media_url || ''}
                          onChange={e => setSlideDraft(prev => prev ? { ...prev, media_url: e.target.value } : prev)}
                          placeholder="Paste media URL or pick from file manager…"
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/60 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => openFilePicker('slide_draft_media')}
                          className="px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold"
                        >📁 Pick</button>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-xs text-text-light/60">Media Type:</span>
                        <button type="button" onClick={() => setSlideDraft(prev => prev ? { ...prev, media_type: 'image' } : prev)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold ${slideDraft.media_type !== 'video' ? 'bg-primary text-white' : 'bg-white/5 text-text-light/60'}`}
                        >🖼️ Image</button>
                        <button type="button" onClick={() => setSlideDraft(prev => prev ? { ...prev, media_type: 'video' } : prev)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold ${slideDraft.media_type === 'video' ? 'bg-primary text-white' : 'bg-white/5 text-text-light/60'}`}
                        >🎬 Video</button>
                      </div>
                    </div>

                    {/* Draft CTA Buttons (Max 3) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Label>Call-to-Action Buttons</Label>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${(slideDraft.cta_buttons || []).length >= 3 ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-text-light/60'}`}>
                            {(slideDraft.cta_buttons || []).length}/3 max
                          </span>
                        </div>
                        {(slideDraft.cta_buttons || []).length < 3 ? (
                          <button
                            type="button"
                            onClick={() => setSlideDraft(prev => prev ? { ...prev, cta_buttons: [...(prev.cta_buttons || []), { label: '', target: '', style: 'filled' }] } : prev)}
                            className="text-xs text-primary font-bold hover:underline"
                          >+ Add Button</button>
                        ) : (
                          <span className="text-[10px] text-amber-400 font-bold">Max 3 reached</span>
                        )}
                      </div>
                      {(slideDraft.cta_buttons || []).map((btn, bIdx) => (
                        <div key={bIdx} className="flex gap-2 items-center mb-2">
                          <input
                            type="text" value={btn.label}
                            maxLength={24}
                            onChange={e => setSlideDraft(prev => prev ? { ...prev, cta_buttons: prev.cta_buttons.map((b, i) => i === bIdx ? { ...b, label: e.target.value } : b) } : prev)}
                            placeholder="Button Label"
                            className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/60"
                          />
                          <input
                            type="text" value={btn.target}
                            onChange={e => setSlideDraft(prev => prev ? { ...prev, cta_buttons: prev.cta_buttons.map((b, i) => i === bIdx ? { ...b, target: e.target.value } : b) } : prev)}
                            placeholder="/link-target"
                            className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/60"
                          />
                          <button
                            type="button"
                            onClick={() => setSlideDraft(prev => prev ? { ...prev, cta_buttons: prev.cta_buttons.filter((_, i) => i !== bIdx) } : prev)}
                            className="text-red-400 text-xs px-2 hover:text-red-300"
                          >✕</button>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setSlideDraft(null)}
                        className="px-4 py-2 text-xs font-semibold text-text-light/60 hover:text-text-light"
                      >Cancel</button>
                      <button
                        type="button"
                        onClick={commitDraft}
                        disabled={!slideDraft.headline}
                        className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 disabled:opacity-40 transition-all shadow"
                      >✓ Add Slide</button>
                    </div>
                  </div>
                )}

                {/* ── LIST OF EXISTING SLIDES IN THIS CATEGORY ── */}
                {filteredCategorySlides.length === 0 && !slideDraft && (
                  <div className="text-center py-10 glass rounded-2xl border border-white/5 text-text-light/40">
                    <p className="text-2xl mb-2">{selectedCategoryMeta.icon}</p>
                    <p className="text-sm font-semibold">No {selectedCategoryMeta.label} slides yet</p>
                    <p className="text-xs mt-1 text-text-light/30">Click "+ New {selectedCategoryMeta.label} Slide" above to create one</p>
                  </div>
                )}

                {filteredCategorySlides.map(({ slide, globalIndex }) => {
                  const isExpanded = expandedSlideId === slide.id;
                  const slideMediaSrc = slide.media_url ? getFileUrl(slide.media_url) : null;

                  return (
                    <div
                      key={slide.id || globalIndex}
                      className={`glass rounded-2xl border transition-all overflow-hidden ${
                        isExpanded ? 'border-primary/50 shadow-lg shadow-primary/5' : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* ── Slide header / summary bar ── */}
                      <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                          {slideMediaSrc ? (
                            slide.media_type === 'video' ? (
                              <div className="w-12 h-9 rounded-lg bg-black flex items-center justify-center text-xs shrink-0 border border-white/10">🎬</div>
                            ) : (
                              <img src={slideMediaSrc} alt="" className="w-12 h-9 rounded-lg object-cover shrink-0 border border-white/10" />
                            )
                          ) : (
                            <div className="w-12 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs shrink-0 text-text-light/30">🖼️</div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-heading-light truncate max-w-[200px] sm:max-w-xs">{slide.headline || 'Untitled Slide'}</span>
                              {slide.badge && (
                                <span className="px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded-full text-[10px] font-bold shrink-0">{slide.badge}</span>
                              )}
                            </div>
                            <p className="text-[11px] text-text-light/50 truncate max-w-xs sm:max-w-md">{slide.subheadline || 'No description'}</p>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Active / Hidden badge */}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            slide.is_active !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {slide.is_active !== false ? 'Active' : 'Hidden'}
                          </span>
                          {/* Move */}
                          <button
                            type="button"
                            onClick={() => handleChange('slides', moveArrayItem(safeSlides, globalIndex, globalIndex - 1))}
                            disabled={globalIndex === 0}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-xs"
                            title="Move up"
                          >▲</button>
                          <button
                            type="button"
                            onClick={() => handleChange('slides', moveArrayItem(safeSlides, globalIndex, globalIndex + 1))}
                            disabled={globalIndex === safeSlides.length - 1}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-xs"
                            title="Move down"
                          >▼</button>
                          {/* Hide/Show */}
                          <button
                            type="button"
                            onClick={() => handleChange('slides', updateArrayItem(safeSlides, globalIndex, { is_active: !slide.is_active }))}
                            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-semibold"
                            title={slide.is_active !== false ? 'Hide slide' : 'Show slide'}
                          >
                            {slide.is_active !== false ? '👁 Hide' : '👁 Show'}
                          </button>
                          {/* Edit toggle */}
                          <button
                            type="button"
                            onClick={() => toggleExpandSlide(slide.id)}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                              isExpanded
                                ? 'bg-primary/20 text-primary border border-primary/40'
                                : 'bg-white/10 hover:bg-white/20 text-text-light/80'
                            }`}
                          >
                            {isExpanded ? '✕ Close' : '✏️ Edit'}
                          </button>
                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              if (expandedSlideId === slide.id) setExpandedSlideId(null);
                              handleChange('slides', removeArrayItem(safeSlides, globalIndex));
                            }}
                            className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs font-semibold"
                          >🗑 Delete</button>
                        </div>
                      </div>

                      {/* ── Inline edit form (expanded) ── */}
                      {isExpanded && (
                        <div className="border-t border-white/10 p-5 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FieldInput
                              label="Badge / Tab Pill"
                              value={slide.badge || ''}
                              onChange={v => handleChange('slides', updateArrayItem(safeSlides, globalIndex, { badge: v }))}
                              placeholder="e.g. Cloud Architecture"
                              maxLength={47}
                            />
                            <FieldInput
                              label="Accent Highlight Word"
                              value={slide.highlighted_text || ''}
                              onChange={v => handleChange('slides', updateArrayItem(safeSlides, globalIndex, { highlighted_text: v }))}
                              placeholder="Word in headline"
                              maxLength={31}
                            />
                          </div>

                          <FieldInput
                            label="Headline *"
                            value={slide.headline || ''}
                            onChange={v => handleChange('slides', updateArrayItem(safeSlides, globalIndex, { headline: v }))}
                            placeholder="Slide headline"
                            maxLength={68}
                          />

                          <TextareaInput
                            label="Description"
                            value={slide.subheadline || ''}
                            onChange={v => handleChange('slides', updateArrayItem(safeSlides, globalIndex, { subheadline: v }))}
                            placeholder="Slide description text"
                            rows={2}
                            maxLength={165}
                          />

                          <div>
                            <Label>Slide Media</Label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={slide.media_url || ''}
                                onChange={e => handleChange('slides', updateArrayItem(safeSlides, globalIndex, { media_url: e.target.value }))}
                                placeholder="Paste media URL or pick from file manager…"
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/60 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => openFilePicker(`slide_media_${slide.id}`)}
                                className="px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold"
                              >📁 Pick</button>
                            </div>
                            <div className="mt-2 flex items-center gap-3">
                              <span className="text-xs text-text-light/60">Media Type:</span>
                              <button type="button" onClick={() => handleChange('slides', updateArrayItem(safeSlides, globalIndex, { media_type: 'image' }))}
                                className={`px-2.5 py-1 rounded text-xs font-semibold ${slide.media_type !== 'video' ? 'bg-primary text-white' : 'bg-white/5 text-text-light/60'}`}
                              >🖼️ Image</button>
                              <button type="button" onClick={() => handleChange('slides', updateArrayItem(safeSlides, globalIndex, { media_type: 'video' }))}
                                className={`px-2.5 py-1 rounded text-xs font-semibold ${slide.media_type === 'video' ? 'bg-primary text-white' : 'bg-white/5 text-text-light/60'}`}
                              >🎬 Video</button>
                            </div>
                          </div>

                          {/* CTA Buttons (Max 3) */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Label>Call-to-Action Buttons</Label>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${(slide.cta_buttons || []).length >= 3 ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-text-light/60'}`}>
                                  {(slide.cta_buttons || []).length}/3 max
                                </span>
                              </div>
                              {(slide.cta_buttons || []).length < 3 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const btns = slide.cta_buttons || [];
                                    handleChange('slides', updateArrayItem(safeSlides, globalIndex, {
                                      cta_buttons: [...btns, { label: '', target: '', style: 'filled' }],
                                    }));
                                  }}
                                  className="text-xs text-primary font-bold hover:underline"
                                >+ Add Button</button>
                              ) : (
                                <span className="text-[10px] text-amber-400 font-bold">Max 3 reached</span>
                              )}
                            </div>
                            {(slide.cta_buttons || []).map((btn, bIdx) => (
                              <div key={bIdx} className="flex gap-2 items-center mb-2">
                                <input
                                  type="text" value={btn.label}
                                  maxLength={24}
                                  onChange={e => {
                                    const updatedBtns = (slide.cta_buttons || []).map((b, i) => i === bIdx ? { ...b, label: e.target.value } : b);
                                    handleChange('slides', updateArrayItem(safeSlides, globalIndex, { cta_buttons: updatedBtns }));
                                  }}
                                  placeholder="Button Label"
                                  className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/60"
                                />
                                <input
                                  type="text" value={btn.target}
                                  onChange={e => {
                                    const updatedBtns = (slide.cta_buttons || []).map((b, i) => i === bIdx ? { ...b, target: e.target.value } : b);
                                    handleChange('slides', updateArrayItem(safeSlides, globalIndex, { cta_buttons: updatedBtns }));
                                  }}
                                  placeholder="/link-target"
                                  className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/60"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedBtns = (slide.cta_buttons || []).filter((_, i) => i !== bIdx);
                                    handleChange('slides', updateArrayItem(safeSlides, globalIndex, { cta_buttons: updatedBtns }));
                                  }}
                                  className="text-red-400 text-xs px-2 hover:text-red-300"
                                >✕</button>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-end pt-2 border-t border-white/10">
                            <button
                              type="button"
                              onClick={() => setExpandedSlideId(null)}
                              className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all"
                            >
                              ✓ Done Editing
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── MAIN CONTENT TAB ─── */}
          {activeTab === 'content' && (
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-5">
              <h2 className="text-lg font-bold text-heading-light mb-2">✏️ Headline & Text (Default / Single Slide)</h2>

              {/* Promo badge */}
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3">
                <span className="text-2xl">🔥</span>
                <div className="flex-1">
                  <Label>Promo Badge <span className="font-normal normal-case text-text-light/40">Floating pill in top-right corner (optional)</span></Label>
                  <input
                    type="text"
                    value={formData.promo_badge || ''}
                    onChange={e => handleChange('promo_badge', e.target.value)}
                    placeholder="e.g. 🔥 Limited Offer — 20% Off This Month"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400/60 transition-all"
                  />
                </div>
              </div>

              <FieldInput
                label="Eyebrow / Badge Text"
                value={formData.company_tagline}
                onChange={v => handleChange('company_tagline', v)}
                placeholder="e.g. NEXT-GEN ENTERPRISE PLATFORMS & CLOUD SOLUTIONS"
                hint="Short pill text above headline"
                maxLength={47}
              />
              <FieldInput
                label="Main Headline *"
                value={formData.headline}
                onChange={v => handleChange('headline', v)}
                placeholder="e.g. Transforming Modern Business with High-Impact Digital Engineering"
                maxLength={68}
              />
              <FieldInput
                label="Highlighted / Accent Word"
                value={formData.highlighted_text}
                onChange={v => handleChange('highlighted_text', v)}
                placeholder="e.g. High-Impact Digital Engineering"
                hint="Must be present in headline"
                maxLength={31}
              />
              <TextareaInput
                label="Supporting Description"
                hint="1–2 sentences"
                value={formData.subheadline}
                onChange={v => handleChange('subheadline', v)}
                placeholder="e.g. We design, build, and scale resilient enterprise cloud infrastructure..."
                rows={3}
                maxLength={165}
              />

              {/* Call-to-Action Buttons in Main Content (Max 3) */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-heading-light flex items-center gap-2">
                      <span>🔗 Call-to-Action Buttons</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${safeCtaButtons.length >= 3 ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-text-light/60'}`}>
                        {safeCtaButtons.length}/3 max
                      </span>
                    </h3>
                    <p className="text-xs text-text-light/50">Primary and secondary action buttons on the banner</p>
                  </div>
                  {safeCtaButtons.length < 3 ? (
                    <button
                      type="button"
                      onClick={() => handleChange('cta_buttons', [...safeCtaButtons, { label: 'Explore', target: '/services', style: 'filled' }])}
                      className="px-3.5 py-1.5 text-xs font-bold bg-primary/20 text-primary border border-primary/30 rounded-xl hover:bg-primary/30 transition-colors"
                    >
                      + Add Button
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-400/80 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                      Limit reached (3/3)
                    </span>
                  )}
                </div>

                {safeCtaButtons.length === 0 && (
                  <p className="text-center text-xs text-text-light/40 py-3 bg-white/5 rounded-xl border border-white/5">
                    No custom buttons yet. Default "Get Started" and "Our Services" buttons will be displayed.
                  </p>
                )}

                {safeCtaButtons.map((btn, idx) => (
                  <div key={idx} className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-text-light/50 uppercase tracking-wider">Button {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleChange('cta_buttons', removeArrayItem(safeCtaButtons, idx))}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >✕ Remove</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FieldInput
                        label="Button Label"
                        value={btn.label}
                        onChange={v => handleChange('cta_buttons', updateArrayItem(safeCtaButtons, idx, { label: v }))}
                        placeholder="e.g. Schedule Consultation"
                        maxLength={24}
                      />
                      <FieldInput
                        label="Target Link / URL"
                        value={btn.target}
                        onChange={v => handleChange('cta_buttons', updateArrayItem(safeCtaButtons, idx, { target: v }))}
                        placeholder="/contact"
                        maxLength={100}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Hero image in Main Content */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div>
                  <Label>Hero Image <span className="font-normal normal-case text-text-light/40">Main visual for all devices (Team, product, office, illustration)</span></Label>
                  <div className="flex gap-3">
                    <input
                      type="text" value={formData.image_url || ''}
                      onChange={e => handleChange('image_url', e.target.value)}
                      placeholder="Paste image URL or pick a file…"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-all"
                    />
                    <button type="button" onClick={() => openFilePicker('image_url')} className="px-3 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors shrink-0">📁 Pick</button>
                  </div>
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Hero visual preview" className="mt-3 rounded-xl w-full h-44 object-cover border border-white/10 shadow-lg" />
                  )}
                </div>
              </div>

              {/* Save button */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                {saveStatus === 'saving' && <span className="text-xs text-yellow-400 animate-pulse">Saving…</span>}
                {saveStatus === 'saved'  && <span className="text-xs text-green-400">✓ Saved</span>}
                <button
                  type="button"
                  onClick={() => autoSave(formData)}
                  className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-colors shadow-md"
                >
                  Save Now
                </button>
              </div>
            </div>
          )}

          {/* ─── SHOW VIDEO TAB ─── */}
          {activeTab === 'video' && (
            <ShowVideoTab openFilePicker={openFilePicker} pickerCbRef={showVideoPickerCb} />
          )}

          {/* ─── MEDIA TAB ─── */}
          {activeTab === 'media' && (
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-6">
              <h2 className="text-lg font-bold text-heading-light mb-2">🖼️ Background Media & Overlay</h2>

              {/* Background type */}
              <div>
                <Label>Background Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'image', icon: '🖼️', label: 'Background Image' },
                    { value: 'video', icon: '🎬', label: 'Background Video' },
                  ].map(t => (
                    <button
                      key={t.value}
                      onClick={() => handleChange('bg_type', t.value)}
                      className={`px-3 py-3 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 justify-center ${
                        formData.bg_type === t.value
                          ? 'bg-primary/20 text-primary border-primary/50'
                          : 'bg-white/5 border-white/10 text-text-light/60 hover:border-white/20'
                      }`}
                    >
                      <span className="text-base">{t.icon}</span>{t.label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.bg_type === 'image' && (
                <div>
                  <Label>Background Image URL</Label>
                  <div className="flex gap-3">
                    <input type="text" value={formData.bg_image_url || ''} onChange={e => handleChange('bg_image_url', e.target.value)} placeholder="Paste URL…" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-all" />
                    <button onClick={() => openFilePicker('bg_image_url')} className="px-3 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold">📁</button>
                  </div>
                  {formData.bg_image_url && <img src={formData.bg_image_url} alt="BG preview" className="mt-3 rounded-xl w-full h-32 object-cover border border-white/10 opacity-70" />}
                </div>
              )}

              {formData.bg_type === 'video' && (
                <div>
                  <Label>Background Video <span className="font-normal normal-case text-text-light/40">Direct .mp4 or .webm URL (autoplays on desktop)</span></Label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={formData.bg_video_url || ''}
                      onChange={e => handleChange('bg_video_url', e.target.value)}
                      placeholder="Paste video URL or pick from file manager…"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-all"
                    />
                    <button onClick={() => openFilePicker('bg_video_url')} className="px-3 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors shrink-0">📁 Pick</button>
                  </div>
                  {formData.bg_video_url && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-white/10 max-h-40 bg-black flex items-center justify-center">
                      <video src={formData.bg_video_url} className="w-full h-40 object-cover opacity-80" controls autoPlay muted loop playsInline preload="metadata" />
                    </div>
                  )}
                </div>
              )}

              {(formData.bg_type === 'image' || formData.bg_type === 'video') && (
                <div>
                  <Label>Overlay Opacity — {Math.round((formData.bg_overlay_opacity ?? 0.45) * 100)}%
                    <span className="ml-2 font-normal normal-case text-text-light/40">Darkens background for readability</span>
                  </Label>
                  <input
                    type="range" min="0" max="1" step="0.05"
                    value={formData.bg_overlay_opacity ?? 0.45}
                    onChange={e => handleChange('bg_overlay_opacity', parseFloat(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              )}
            </div>
          )}

          {/* ─── SOCIAL PROOF TAB ─── */}
          {activeTab === 'proof' && (
            <div className="space-y-4">

              {/* Trust indicators (Max 3) */}
              <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-heading-light flex items-center gap-2">
                      <span>✅ Trust Indicators</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${safeTrust.length >= 3 ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-text-light/60'}`}>
                        {safeTrust.length}/3 max
                      </span>
                    </h2>
                    <p className="text-xs text-text-light/50 mt-0.5">e.g. ⭐ 5-Star Rated · 🔒 Secure · ✅ ISO Certified</p>
                  </div>
                  {safeTrust.length < 3 ? (
                    <button
                      type="button"
                      onClick={() => handleChange('trust_indicators', [...safeTrust, { icon: '✅', text: 'Verified & Trusted' }])}
                      className="px-4 py-2 text-xs font-bold bg-primary/20 text-primary border border-primary/30 rounded-xl hover:bg-primary/30 transition-colors"
                    >+ Add</button>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-400/80 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                      Limit reached (3/3)
                    </span>
                  )}
                </div>

                {safeTrust.length === 0 && (
                  <p className="text-center text-sm text-text-light/40 py-4">No trust items yet.</p>
                )}

                {safeTrust.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-end p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-20">
                      <Label>Icon / Emoji</Label>
                      <input type="text" value={item.icon} onChange={e => handleChange('trust_indicators', updateArrayItem(safeTrust, idx, { icon: e.target.value }))} placeholder="⭐" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60 transition-all text-center" />
                    </div>
                    <div className="flex-1">
                      <FieldInput
                        label="Text"
                        value={item.text}
                        onChange={v => handleChange('trust_indicators', updateArrayItem(safeTrust, idx, { text: v }))}
                        placeholder="e.g. SOC 2 Type II Certified"
                        maxLength={30}
                      />
                    </div>
                    <button onClick={() => handleChange('trust_indicators', removeArrayItem(safeTrust, idx))} className="text-xs text-red-400 hover:text-red-300 pb-2.5 shrink-0">✕</button>
                  </div>
                ))}
              </div>

              {/* Client logos */}
              <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-heading-light">🏢 Client / Partner Logos</h2>
                    <p className="text-xs text-text-light/50 mt-0.5">Shown as a strip at the bottom of the hero</p>
                  </div>
                  <button
                    onClick={() => handleChange('client_logos', [...safeLogos, { name: 'Partner', logo_url: '' }])}
                    className="px-4 py-2 text-xs font-bold bg-primary/20 text-primary border border-primary/30 rounded-xl hover:bg-primary/30 transition-colors"
                  >+ Add Logo</button>
                </div>

                {safeLogos.length === 0 && (
                  <p className="text-center text-sm text-text-light/40 py-4">No logos yet.</p>
                )}

                {safeLogos.map((logo, idx) => (
                  <div key={idx} className="flex gap-3 items-end p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-28">
                      <Label>Name</Label>
                      <input type="text" value={logo.name} onChange={e => handleChange('client_logos', updateArrayItem(safeLogos, idx, { name: e.target.value }))} placeholder="Acme Corp" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60 transition-all" />
                    </div>
                    <div className="flex-1">
                      <Label>Logo URL</Label>
                      <div className="flex gap-2">
                        <input type="text" value={logo.logo_url} onChange={e => handleChange('client_logos', updateArrayItem(safeLogos, idx, { logo_url: e.target.value }))} placeholder="Paste logo URL…" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/60 transition-all" />
                        <button onClick={() => { setFilePickerTarget(`client_logo_${idx}`); setShowFilePicker(true); }} className="px-2 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">📁</button>
                      </div>
                    </div>
                    {logo.logo_url && <img src={logo.logo_url} alt={logo.name} className="h-8 rounded object-contain border border-white/10 shrink-0" />}
                    <button onClick={() => handleChange('client_logos', removeArrayItem(safeLogos, idx))} className="text-xs text-red-400 hover:text-red-300 pb-2.5 shrink-0">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── LAYOUT TAB ─── */}
          {activeTab === 'layout' && (
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-6">
              <h2 className="text-lg font-bold text-heading-light">🎨 Layout & Style</h2>

              {/* Layout template */}
              <div>
                <Label>Hero Layout</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'centered',        label: '⬛ Centered',    desc: 'Content centered, image below' },
                    { value: 'split',            label: '◧ Split',        desc: 'Content + image side by side' },
                    { value: 'photo-background', label: '🌄 Immersive',   desc: 'Full-bleed background media' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleChange('layout_template', opt.value)}
                      className={`p-3 rounded-xl text-left text-xs transition-all border ${
                        formData.layout_template === opt.value
                          ? 'bg-primary/20 border-primary/50 text-primary'
                          : 'bg-white/5 border-white/10 text-text-light/60 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold mb-0.5">{opt.label}</div>
                      <div className="text-[10px] opacity-70">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text alignment */}
              <div>
                <Label>Text Alignment</Label>
                <div className="flex gap-2">
                  {[
                    { value: 'left',   label: '⬅ Left' },
                    { value: 'center', label: '⬜ Center' },
                    { value: 'right',  label: '➡ Right' },
                  ].map(a => (
                    <button
                      key={a.value}
                      onClick={() => handleChange('text_alignment', a.value)}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                        formData.text_alignment === a.value
                          ? 'bg-primary/20 border-primary/50 text-primary'
                          : 'bg-white/5 border-white/10 text-text-light/60 hover:border-white/20'
                      }`}
                    >{a.label}</button>
                  ))}
                </div>
              </div>

              {/* Section height */}
              <div>
                <Label>Section Height</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'auto',  label: 'Auto (Fit Content)' },
                    { value: '70vh',  label: '70% Screen' },
                    { value: '80vh',  label: '80% Screen' },
                    { value: '90vh',  label: '90% Screen' },
                    { value: '100vh', label: 'Full Screen' },
                    { value: '600px', label: '600 px' },
                  ].map(h => (
                    <button
                      key={h.value}
                      onClick={() => handleChange('section_height', h.value)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        (formData.section_height || 'auto') === h.value
                          ? 'bg-primary/20 border-primary/50 text-primary'
                          : 'bg-white/5 border-white/10 text-text-light/60 hover:border-white/20'
                      }`}
                    >{h.label}</button>
                  ))}
                </div>
              </div>

              {/* Animation */}
              <div>
                <Label>Entrance Animation</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'slide-up', label: '⬆ Slide Up' },
                    { value: 'slide-in', label: '➡ Slide In' },
                    { value: 'fade',     label: '🌫 Fade' },
                    { value: 'none',     label: '⬛ None' },
                  ].map(a => (
                    <button
                      key={a.value}
                      onClick={() => handleChange('animation_type', a.value)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        formData.animation_type === a.value
                          ? 'bg-primary/20 border-primary/50 text-primary'
                          : 'bg-white/5 border-white/10 text-text-light/60 hover:border-white/20'
                      }`}
                    >{a.label}</button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                {[
                  { field: 'show_scroll_indicator', label: 'Scroll Indicator', desc: 'Show animated arrow at the bottom' },
                ].map(t => (
                  <div key={t.field} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <p className="text-sm font-bold">{t.label}</p>
                      <p className="text-xs text-text-light/50">{t.desc}</p>
                    </div>
                    <button
                      onClick={() => handleChange(t.field, !(formData as any)[t.field])}
                      className={`relative w-12 h-6 rounded-full transition-colors ${(formData as any)[t.field] ? 'bg-primary' : 'bg-white/20'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${(formData as any)[t.field] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Live Preview Strip ── */}
          <div className="glass rounded-2xl border border-white/10 p-5">
            <p className="text-xs font-bold text-text-light/40 uppercase tracking-wider mb-3">Live Content Preview</p>
            <div className="bg-black/30 rounded-xl p-6 text-center space-y-3 relative overflow-hidden">
              {formData.promo_badge && (
                <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold uppercase">
                  {formData.promo_badge}
                </span>
              )}

              {/* Rotating slide pills preview if slides exist */}
              {safeSlides.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 mb-2">
                  {safeSlides.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 bg-white/10 text-text-light/80 text-[11px] font-semibold rounded-full border border-white/15">
                      {s.slide_type === 'service' ? '💼' : s.slide_type === 'announcement' ? '📢' : s.slide_type === 'marketing' ? '🎬' : '✨'} {s.badge || `Slide ${idx + 1}`}
                    </span>
                  ))}
                </div>
              )}

              {formData.company_tagline && safeSlides.length === 0 && (
                <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                  {formData.company_tagline}
                </span>
              )}
              <h2 className="text-xl md:text-3xl font-extrabold text-heading-light leading-tight">
                {formData.headline
                  ? formData.highlighted_text && formData.headline.includes(formData.highlighted_text)
                    ? <>
                        {formData.headline.split(formData.highlighted_text)[0]}
                        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{formData.highlighted_text}</span>
                        {formData.headline.split(formData.highlighted_text).slice(1).join(formData.highlighted_text)}
                      </>
                    : formData.headline
                  : <span className="text-white/20 italic">Your headline appears here…</span>
                }
              </h2>
              {formData.subheadline && <p className="text-sm text-text-light/60 max-w-lg mx-auto">{formData.subheadline}</p>}
              {safeCtaButtons.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {safeCtaButtons.map((btn, i) => (
                    <span key={i} className="px-4 py-1.5 text-xs font-bold rounded-full bg-primary text-white shadow-md">
                      {btn.label}
                    </span>
                  ))}
                </div>
              )}
              {safeStats.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 pt-2 border-t border-white/10 mt-3">
                  {safeStats.map((s, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xl font-black text-heading-light">{s.number}<span className="text-primary">{s.suffix}</span></div>
                      <div className="text-[10px] uppercase tracking-wider text-text-light/50">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
              {safeTrust.length > 0 && (
                <div className="flex flex-wrap justify-center gap-3 pt-1">
                  {safeTrust.map((t, i) => (
                    <span key={i} className="text-xs text-text-light/60 flex items-center gap-1">
                      <span>{t.icon}</span>{t.text}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* File Picker Modal */}
      {showFilePicker && (
        <FilePicker
          onSelect={(url) => {
            if (filePickerTarget?.startsWith('client_logo_')) {
              const idx = parseInt(filePickerTarget.split('_').pop() || '0', 10);
              handleChange('client_logos', updateArrayItem(safeLogos, idx, { logo_url: url }));
            } else {
              handleFileSelected(url);
            }
            setShowFilePicker(false);
            setFilePickerTarget(null);
          }}
          onClose={() => { setShowFilePicker(false); setFilePickerTarget(null); }}
          accept={filePickerTarget === 'bg_video_url' ? 'video' : 'all'}
        />
      )}
    </div>
  );
}
