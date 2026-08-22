'use client';
import { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '@/utils/api';
import { getFileUrl } from '@/utils/urls';

/* ── Types ─────────────────────────────────────────────────── */
interface ShowVideoRecord {
  id: string;
  title: string;
  description: string;
  video_url: string;
  poster_url: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  is_active: boolean;
  scheduled_at: string | null;
  published_at: string | null;
  sort_order: number;
}

const emptyVideo: Omit<ShowVideoRecord, 'id' | 'sort_order' | 'published_at'> = {
  title: '',
  description: '',
  video_url: '',
  poster_url: '',
  status: 'published',
  is_active: true,
  scheduled_at: null,
};

/* ── Sub-components ────────────────────────────────────────── */
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-bold uppercase tracking-wider text-text-light/50 mb-1.5">{children}</label>
);

function StatusBadge({ status, scheduledAt }: { status: string; scheduledAt?: string | null }) {
  const cfg: Record<string, { cls: string; label: string }> = {
    published:  { cls: 'bg-green-500/20 text-green-400 border-green-500/30',  label: '● Published' },
    draft:      { cls: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',     label: '○ Draft' },
    scheduled:  { cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30',  label: '⏰ Scheduled' },
    archived:   { cls: 'bg-red-500/20 text-red-400 border-red-500/30',        label: '✕ Archived' },
  };
  const c = cfg[status] || cfg.draft;
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.cls}`}>
      {c.label}
      {status === 'scheduled' && scheduledAt && (
        <span className="ml-1 opacity-70">{new Date(scheduledAt).toLocaleDateString()}</span>
      )}
    </span>
  );
}

/* ── Main ShowVideoTab component ───────────────────────────── */
export default function ShowVideoTab({
  openFilePicker,
  pickerCbRef,
}: {
  openFilePicker: (field: string) => void;
  pickerCbRef: React.MutableRefObject<((field: string, url: string) => void) | null>;
}) {
  const [videos, setVideos] = useState<ShowVideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<typeof emptyVideo>({ ...emptyVideo });
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Register our file-pick handler so parent can route sv_* targets here
  useEffect(() => {
    pickerCbRef.current = (field: string, url: string) => {
      if (field === 'sv_video_url') setDraft(prev => ({ ...prev, video_url: url }));
      if (field === 'sv_poster_url') setDraft(prev => ({ ...prev, poster_url: url }));
    };
    return () => { pickerCbRef.current = null; };
  }, [pickerCbRef]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/corporate/show-videos');
      setVideos(res.data || []);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditingId(null);
    setDraft({ ...emptyVideo });
    setShowForm(true);
  };

  const openEdit = (v: ShowVideoRecord) => {
    setEditingId(v.id);
    setDraft({
      title: v.title,
      description: v.description,
      video_url: v.video_url,
      poster_url: v.poster_url,
      status: v.status,
      is_active: v.is_active,
      scheduled_at: v.scheduled_at,
    });
    setExpandedId(v.id);
    setShowForm(false);
  };

  const save = async () => {
    if (!draft.title.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await fetchApi(`/corporate/show-videos/${editingId}`, { method: 'PUT', body: JSON.stringify(draft) });
      } else {
        await fetchApi('/corporate/show-videos', { method: 'POST', body: JSON.stringify(draft) });
      }
      await load();
      setShowForm(false);
      setEditingId(null);
      setExpandedId(null);
      setSavedId('ok');
      setTimeout(() => setSavedId(null), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (v: ShowVideoRecord) => {
    await fetchApi(`/corporate/show-videos/${v.id}`, { method: 'PUT', body: JSON.stringify({ is_active: !v.is_active }) });
    load();
  };

  const deleteVideo = async (id: string) => {
    if (!confirm('Delete this video? This cannot be undone.')) return;
    await fetchApi(`/corporate/show-videos/${id}`, { method: 'DELETE' });
    load();
  };

  // Field change helper for draft
  const d = (k: keyof typeof emptyVideo, v: any) => setDraft(prev => ({ ...prev, [k]: v }));

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="glass rounded-2xl border border-white/10 p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-heading-light flex items-center gap-2">
              🎬 Show Videos
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-text-light/60 font-bold">
                {videos.length} video{videos.length !== 1 ? 's' : ''}
              </span>
            </h2>
            <p className="text-xs text-text-light/50 mt-0.5">
              Create multiple videos, schedule them, and they'll rotate on the hero banner alongside other slides
            </p>
          </div>
          <button
            type="button"
            onClick={openNew}
            className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow flex items-center gap-2"
          >
            <span>+</span> New Video
          </button>
        </div>
      </div>

      {/* Create / Edit Form */}
      {(showForm || (editingId && expandedId)) && (
        <VideoForm
          draft={draft}
          setDraft={setDraft}
          saving={saving}
          editingId={editingId}
          onSave={save}
          onCancel={() => { setShowForm(false); setEditingId(null); setExpandedId(null); setDraft({ ...emptyVideo }); }}
          openFilePicker={openFilePicker}
          d={d}
        />
      )}

      {/* Saved flash */}
      {savedId && <p className="text-xs text-green-400 text-center">✓ Video saved</p>}

      {/* Videos list */}
      {loading ? (
        <div className="text-center py-12 text-text-light/40 text-sm">Loading…</div>
      ) : videos.length === 0 ? (
        <div className="glass rounded-2xl border border-white/10 p-10 text-center">
          <p className="text-3xl mb-2">🎬</p>
          <p className="text-sm font-semibold text-text-light/60">No videos yet</p>
          <p className="text-xs text-text-light/30 mt-1">Click "+ New Video" to add your first showcase video</p>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((v) => (
            <div
              key={v.id}
              className={`glass rounded-2xl border transition-all overflow-hidden ${
                expandedId === v.id ? 'border-primary/50' : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Row */}
              <div className="p-4 flex items-center gap-3 flex-wrap">
                {/* Thumbnail */}
                {v.poster_url ? (
                  <img
                    src={getFileUrl(v.poster_url)}
                    alt={v.title}
                    className="w-16 h-11 rounded-lg object-cover shrink-0 border border-white/10"
                  />
                ) : v.video_url ? (
                  <div className="w-16 h-11 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                    <span className="text-xl">▶</span>
                  </div>
                ) : (
                  <div className="w-16 h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-text-light/30 text-xs">🎬</div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-heading-light truncate max-w-xs">{v.title || 'Untitled'}</span>
                    <StatusBadge status={v.status} scheduledAt={v.scheduled_at} />
                    {!v.is_active && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-zinc-700/50 text-zinc-400 rounded font-bold">Hidden</span>
                    )}
                  </div>
                  {v.description && (
                    <p className="text-[11px] text-text-light/40 mt-0.5 truncate max-w-sm">{v.description}</p>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => toggleActive(v)}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-semibold transition-colors"
                    title={v.is_active ? 'Hide from banner' : 'Show on banner'}
                  >
                    {v.is_active ? '👁 Hide' : '👁 Show'}
                  </button>
                  <button
                    type="button"
                    onClick={() => expandedId === v.id ? setExpandedId(null) : openEdit(v)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                      expandedId === v.id
                        ? 'bg-primary/20 text-primary border border-primary/40'
                        : 'bg-white/10 hover:bg-white/20 text-text-light/80'
                    }`}
                  >
                    {expandedId === v.id ? '✕ Close' : '✏️ Edit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteVideo(v.id)}
                    className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs font-semibold"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>

              {/* Inline edit form when expanded */}
              {expandedId === v.id && editingId === v.id && (
                <div className="border-t border-white/10">
                  <VideoForm
                    draft={draft}
                    setDraft={setDraft}
                    saving={saving}
                    editingId={editingId}
                    onSave={save}
                    onCancel={() => { setEditingId(null); setExpandedId(null); setDraft({ ...emptyVideo }); }}
                    openFilePicker={openFilePicker}
                    d={d}
                    inline
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Video Form (shared for create & inline edit) ─────────── */
function VideoForm({
  draft, setDraft, saving, editingId, onSave, onCancel, openFilePicker, d, inline = false,
}: {
  draft: any;
  setDraft: any;
  saving: boolean;
  editingId: string | null;
  onSave: () => void;
  onCancel: () => void;
  openFilePicker: (field: string) => void;
  d: (k: any, v: any) => void;
  inline?: boolean;
}) {
  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 transition-all";

  return (
    <div className={`${inline ? 'p-5' : 'glass rounded-2xl border border-primary/30 p-6'} space-y-5`}>
      {!inline && (
        <h3 className="text-base font-bold text-heading-light flex items-center gap-2">
          {editingId ? '✏️ Edit Video' : '+ New Showcase Video'}
        </h3>
      )}

      {/* Title */}
      <div>
        <Label>Video Title *</Label>
        <div className="flex items-center justify-between mb-1">
          <span />
          <span className={`text-[10px] ${draft.title.length >= 60 ? 'text-red-400' : 'text-text-light/30'}`}>{draft.title.length}/60</span>
        </div>
        <input
          type="text"
          value={draft.title}
          maxLength={60}
          onChange={e => d('title', e.target.value)}
          placeholder="e.g. Enterprise Cloud & AI Engineering Demo"
          className={inputCls}
        />
      </div>

      {/* Description */}
      <div>
        <Label>Short Description</Label>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-text-light/40">Brief summary shown with the video slide</span>
          <span className={`text-[10px] ${draft.description.length >= 165 ? 'text-red-400' : 'text-text-light/30'}`}>{draft.description.length}/165</span>
        </div>
        <textarea
          value={draft.description}
          maxLength={165}
          onChange={e => d('description', e.target.value)}
          placeholder="e.g. Take a 2-minute walkthrough of our high-scale microservices architecture…"
          rows={3}
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Video URL */}
      <div>
        <Label>Video URL <span className="font-normal normal-case text-text-light/30">(.mp4, .webm or CDN stream)</span></Label>
        <div className="flex gap-2">
          <input
            type="text"
            value={draft.video_url}
            onChange={e => d('video_url', e.target.value)}
            placeholder="Paste video URL or pick from file manager…"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 transition-all"
          />
          <button
            type="button"
            onClick={() => openFilePicker('sv_video_url')}
            className="px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors shrink-0"
          >📁</button>
        </div>
        {draft.video_url && (
          <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-black/60">
            <video
              src={getFileUrl(draft.video_url)}
              poster={draft.poster_url ? getFileUrl(draft.poster_url) : undefined}
              className="w-full max-h-48 object-cover"
              controls muted loop playsInline preload="metadata"
            />
          </div>
        )}
      </div>

      {/* Poster */}
      <div>
        <Label>Cover / Poster Image <span className="font-normal normal-case text-text-light/30">optional thumbnail</span></Label>
        <div className="flex gap-2">
          <input
            type="text"
            value={draft.poster_url}
            onChange={e => d('poster_url', e.target.value)}
            placeholder="Paste image URL or pick cover…"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 transition-all"
          />
          <button
            type="button"
            onClick={() => openFilePicker('sv_poster_url')}
            className="px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors shrink-0"
          >📁</button>
        </div>
        {draft.poster_url && (
          <img src={getFileUrl(draft.poster_url)} alt="Poster" className="mt-2 rounded-xl w-full h-28 object-cover border border-white/10" />
        )}
      </div>

      {/* Status + scheduling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Status</Label>
          <select
            value={draft.status}
            onChange={e => d('status', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 transition-all"
          >
            <option value="published">● Published — live now</option>
            <option value="draft">○ Draft — hidden</option>
            <option value="scheduled">⏰ Scheduled — goes live at date</option>
            <option value="archived">✕ Archived</option>
          </select>
        </div>

        {draft.status === 'scheduled' && (
          <div>
            <Label>Go Live At</Label>
            <input
              type="datetime-local"
              value={draft.scheduled_at ? draft.scheduled_at.slice(0, 16) : ''}
              onChange={e => d('scheduled_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/60 transition-all"
            />
          </div>
        )}
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => d('is_active', !draft.is_active)}
          className={`relative w-11 h-6 rounded-full transition-colors ${draft.is_active ? 'bg-primary' : 'bg-white/20'}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${draft.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
        <span className="text-xs font-semibold text-text-light/70">
          {draft.is_active ? 'Enabled on banner' : 'Hidden from banner'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-semibold text-text-light/60 hover:text-text-light">
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !draft.title.trim()}
          className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 disabled:opacity-40 transition-colors shadow"
        >
          {saving ? 'Saving…' : editingId ? '✓ Update Video' : '✓ Add Video'}
        </button>
      </div>
    </div>
  );
}
