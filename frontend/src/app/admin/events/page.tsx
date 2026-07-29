'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { API_BASE_URL, getFileUrl } from '@/utils/urls';

const EVENT_CATEGORIES = [
  'Conferences', 'Workshops', 'Networking Events', 'Forums', 'Seminars',
  'Hackathons', 'Webinars', 'Career Fairs', 'Industry Events',
  'Innovation Expos', 'Community Events', 'Meetups', 'Professional Gatherings',
];

const PARTICIPATION_TYPES = ['Attendee', 'Speaker', 'Panelist', 'Organizer', 'Volunteer', 'Mentor', 'Judge', 'Exhibitor'];

export default function AdminEvents() {
  const refreshKey = useRealtimeRefresh('events', false);
  const [items, setItems] = useState<any[]>([]);

  const initialForm = {
    title: '', category: '', organizer: '',
    logo_url: '', cover_image_url: '',
    date: '', location: '', city: '', country: '',
    format: 'Physical' as 'Physical' | 'Virtual' | 'Hybrid',
    venue: '', short_description: '', website_url: '',
    participation_type: '',
    my_experience: '', reflection: '',
    lessons: [] as string[], takeaways: [] as string[],
    people_met: [] as { name: string; role: string; contact: string }[],
    photos: [] as string[], videos: [] as string[],
    related_projects: [] as string[], related_skills: [] as string[],
    featured: false, status: 'draft',
  };

  const [formData, setFormData] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [categorySelectVal, setCategorySelectVal] = useState('');

  // Temp inputs for array fields
  const [tempLesson, setTempLesson] = useState('');
  const [tempTakeaway, setTempTakeaway] = useState('');
  const [tempProject, setTempProject] = useState('');
  const [tempSkill, setTempSkill] = useState('');
  const [tempPhotoUrl, setTempPhotoUrl] = useState('');
  const [tempVideoUrl, setTempVideoUrl] = useState('');
  const [tempPersonName, setTempPersonName] = useState('');
  const [tempPersonRole, setTempPersonRole] = useState('');
  const [tempPersonContact, setTempPersonContact] = useState('');

  // File Upload states
  const [coverUploading, setCoverUploading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Autosave state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isDraft, setIsDraft] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const editIdRef = useRef(editId);
  const isEditingRef = useRef(isEditing);
  editIdRef.current = editId;
  isEditingRef.current = isEditing;

  const loadData = () => {
    fetchApi('/events').then(res => setItems(res.data)).catch(console.error);
  };

  useEffect(() => { loadData(); }, [refreshKey]);

  // ─── File Upload Helpers ─────────────────────────────────────────────
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const res = await fetch(`${API_BASE_URL}/media`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = await res.json();
      return json.success && json.data?.file_path
        ? getFileUrl(json.data.file_path)
        : null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleCoverUpload = async (file: File) => {
    if (!file) return;
    setCoverUploading(true);
    const url = await uploadFile(file);
    if (url) setFormData(prev => ({ ...prev, cover_image_url: url }));
    setCoverUploading(false);
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    setPhotoUploading(true);
    const url = await uploadFile(file);
    if (url) setFormData(prev => ({ ...prev, photos: [...prev.photos, url] }));
    setPhotoUploading(false);
  };

  // ─── Autosave ───────────────────────────────────────────────────────
  const doAutosave = useCallback(async (data: typeof initialForm, id: string, editing: boolean) => {
    const hasAnyData = (
      data.title || data.category || data.organizer || data.date ||
      data.location || data.city || data.country || data.venue ||
      data.short_description || data.my_experience || data.reflection ||
      data.photos.length > 0 || data.videos.length > 0
    );
    if (!hasAnyData) return;

    setSaveStatus('saving');
    try {
      const payload = {
        ...data,
        title: data.title || '(Draft)',
      };

      if (editing && id) {
        await fetchApi(`/events/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        if (data.title && data.title !== '(Draft)') {
          setIsDraft(false);
        }
      } else {
        const res = await fetchApi('/events', { method: 'POST', body: JSON.stringify(payload) });
        const newId = res.data?.id;
        if (newId) {
          setIsEditing(true);
          setEditId(newId);
          setIsDraft(true);
        }
      }
      setSaveStatus('saved');
      loadData();
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, []);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      doAutosave(formData, editIdRef.current, isEditingRef.current);
    }, 1500);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [formData, doAutosave]);

  // ─── CRUD ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await fetchApi(`/events/${editId}`, { method: 'PUT', body: JSON.stringify(formData) });
      } else {
        await fetchApi('/events', { method: 'POST', body: JSON.stringify(formData) });
      }
      resetForm();
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await fetchApi(`/events/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetchApi(`/events/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      loadData();
    } catch (err) { console.error(err); }
  };

  const startEdit = (item: any) => {
    const cat = item.category || '';
    setCategorySelectVal(EVENT_CATEGORIES.includes(cat) ? cat : cat ? 'Other' : '');
    const isDraftRecord = item.title === '(Draft)';
    setIsDraft(isDraftRecord);
    setFormData({
      title: isDraftRecord ? '' : (item.title || ''),
      category: item.category || '', organizer: item.organizer || '',
      logo_url: item.logo_url || '', cover_image_url: item.cover_image_url || '',
      date: item.date || '', location: item.location || '',
      city: item.city || '', country: item.country || '',
      format: item.format || 'Physical',
      venue: item.venue || '', short_description: item.short_description || '',
      website_url: item.website_url || '',
      participation_type: item.participation_type || '',
      my_experience: item.my_experience || '', reflection: item.reflection || '',
      lessons: item.lessons || [], takeaways: item.takeaways || [],
      people_met: item.people_met || [],
      photos: item.photos || [], videos: item.videos || [],
      related_projects: item.related_projects || [],
      related_skills: item.related_skills || [],
      featured: item.featured || false, status: item.status || 'draft',
    });
    isFirstRender.current = true;
    setIsEditing(true);
    setEditId(item.id);
    setActiveTab('basic');
    setTimeout(() => { isFirstRender.current = false; }, 200);
  };

  const resetForm = () => {
    isFirstRender.current = true;
    setFormData(initialForm);
    setCategorySelectVal('');
    setIsEditing(false);
    setEditId('');
    setIsDraft(false);
    setActiveTab('basic');
    setSaveStatus('idle');
    setTimeout(() => { isFirstRender.current = false; }, 200);
  };

  // Array helpers
  const addLesson = () => { if (!tempLesson.trim()) return; setFormData(prev => ({ ...prev, lessons: [...prev.lessons, tempLesson.trim()] })); setTempLesson(''); };
  const addTakeaway = () => { if (!tempTakeaway.trim()) return; setFormData(prev => ({ ...prev, takeaways: [...prev.takeaways, tempTakeaway.trim()] })); setTempTakeaway(''); };
  const addProject = () => { if (!tempProject.trim()) return; setFormData(prev => ({ ...prev, related_projects: [...prev.related_projects, tempProject.trim()] })); setTempProject(''); };
  const addSkill = () => { if (!tempSkill.trim()) return; setFormData(prev => ({ ...prev, related_skills: [...prev.related_skills, tempSkill.trim()] })); setTempSkill(''); };
  const addPhotoUrl = () => { if (!tempPhotoUrl.trim()) return; setFormData(prev => ({ ...prev, photos: [...prev.photos, tempPhotoUrl.trim()] })); setTempPhotoUrl(''); };
  const addVideoUrl = () => { if (!tempVideoUrl.trim()) return; setFormData(prev => ({ ...prev, videos: [...prev.videos, tempVideoUrl.trim()] })); setTempVideoUrl(''); };

  const addPerson = () => {
    if (!tempPersonName.trim()) return;
    setFormData(prev => ({ ...prev, people_met: [...prev.people_met, { name: tempPersonName.trim(), role: tempPersonRole.trim(), contact: tempPersonContact.trim() }] }));
    setTempPersonName(''); setTempPersonRole(''); setTempPersonContact('');
  };

  const removeFromArray = (field: string, index: number) => {
    setFormData(prev => ({ ...prev, [field]: (prev as any)[field].filter((_: any, i: number) => i !== index) }));
  };

  // Save status indicator
  const SaveIndicator = () => {
    const statusStyles: Record<string, string> = {
      saving: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      saved: 'bg-green-500/20 text-green-400 border-green-500/40',
      error: 'bg-red-500/20 text-red-400 border-red-500/40',
    };
    const statusLabels: Record<string, string> = {
      saving: '⟳ Autosaving…',
      saved: '✓ Draft saved',
      error: '✕ Save failed',
    };
    return (
      <div className="flex items-center gap-2">
        {isDraft && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Unsaved Draft
          </span>
        )}
        {saveStatus !== 'idle' && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${statusStyles[saveStatus]}`}>
            {statusLabels[saveStatus]}
          </span>
        )}
      </div>
    );
  };

  const inputClass = 'w-full bg-gray-900 border border-gray-700 rounded p-2 text-white';
  const labelClass = 'block text-sm mb-1 text-gray-400';

  return (
    <div>
      <h1 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8 whitespace-nowrap">Events & Networking</h1>

      <div className="bg-gray-800 rounded-lg mb-12 border border-gray-700 overflow-hidden">
        <div className="bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{isEditing ? 'Edit Event' : 'Add New Event'}</h2>
            <SaveIndicator />
          </div>
          {isEditing && <button onClick={resetForm} className="text-sm text-gray-400 hover:text-white">Cancel Edit</button>}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-800/50 overflow-x-auto">
          {['basic', 'location', 'content', 'media', 'connections', 'publishing'].map(tab => (
            <button
              key={tab}
              onClick={(e) => { e.preventDefault(); setActiveTab(tab); }}
              className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
            >
              {tab === 'media' ? 'Gallery & Media' : tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6">

          {/* TAB: BASIC */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Event Title *</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputClass} placeholder="e.g. Africa Tech Summit 2025" />
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    value={categorySelectVal}
                    onChange={e => {
                      const val = e.target.value;
                      setCategorySelectVal(val);
                      if (val !== 'Other') setFormData({ ...formData, category: val });
                      else setFormData({ ...formData, category: '' });
                    }}
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    {EVENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    <option value="Other">Other…</option>
                  </select>
                  {categorySelectVal === 'Other' && (
                    <input
                      type="text" autoFocus value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Specify category…"
                      className="w-full mt-2 bg-gray-900 border border-primary/50 rounded p-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  )}
                </div>
                <div>
                  <label className={labelClass}>Organizer</label>
                  <input type="text" value={formData.organizer} onChange={e => setFormData({ ...formData, organizer: e.target.value })} className={inputClass} placeholder="Organization or person" />
                </div>
                <div>
                  <label className={labelClass}>Event Date</label>
                  <input type="text" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className={inputClass} placeholder="e.g. March 12-14, 2025" />
                </div>
                <div>
                  <label className={labelClass}>Participation Type</label>
                  <select value={formData.participation_type} onChange={e => setFormData({ ...formData, participation_type: e.target.value })} className={inputClass}>
                    <option value="">Select…</option>
                    {PARTICIPATION_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Event Website</label>
                  <input type="text" value={formData.website_url} onChange={e => setFormData({ ...formData, website_url: e.target.value })} className={inputClass} placeholder="https://..." />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className={labelClass}>Cover Image</label>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={formData.cover_image_url}
                    onChange={e => setFormData({ ...formData, cover_image_url: e.target.value })}
                    className="flex-grow bg-gray-900 border border-gray-700 rounded p-2 text-white"
                    placeholder="Paste URL or upload…"
                  />
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleCoverUpload(e.target.files[0]); }} />
                  <button type="button" onClick={() => coverInputRef.current?.click()} disabled={coverUploading} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-bold text-sm disabled:opacity-50">
                    {coverUploading ? 'Uploading…' : 'Upload'}
                  </button>
                </div>
                {formData.cover_image_url && (
                  <div className="mt-3 relative inline-block">
                    <img src={formData.cover_image_url} alt="Cover" className="h-24 rounded border border-gray-700 object-cover" />
                    <button type="button" onClick={() => setFormData({ ...formData, cover_image_url: '' })} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold hover:bg-red-400">×</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: LOCATION */}
          {activeTab === 'location' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Format</label>
                  <select value={formData.format} onChange={e => setFormData({ ...formData, format: e.target.value as any })} className={inputClass}>
                    <option>Physical</option><option>Virtual</option><option>Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Venue</label>
                  <input type="text" value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })} className={inputClass} placeholder="Venue name" />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className={inputClass} placeholder="Full address or area" />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className={inputClass} placeholder="City" />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input type="text" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} className={inputClass} placeholder="Country" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Short Description</label>
                <textarea rows={3} value={formData.short_description} onChange={e => setFormData({ ...formData, short_description: e.target.value })} className={inputClass} placeholder="Brief summary of the event…" />
              </div>
            </div>
          )}

          {/* TAB: CONTENT */}
          {activeTab === 'content' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className={labelClass}>My Experience</label>
                <textarea rows={5} value={formData.my_experience} onChange={e => setFormData({ ...formData, my_experience: e.target.value })} className={inputClass} placeholder="Describe your experience at this event…" />
              </div>

              {/* Lessons Learned */}
              <div>
                <label className={labelClass}>Lessons Learned</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={tempLesson} onChange={e => setTempLesson(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLesson())} className="flex-grow bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="Add a lesson…" />
                  <button type="button" onClick={addLesson} className="px-4 bg-gray-700 hover:bg-gray-600 rounded font-bold">Add</button>
                </div>
                <ul className="space-y-2">
                  {formData.lessons.map((l, i) => (
                    <li key={i} className="flex justify-between items-center p-2 bg-gray-900 rounded border border-gray-800 text-sm">
                      <span>• {l}</span><button type="button" onClick={() => removeFromArray('lessons', i)} className="text-red-400 hover:text-red-300">Remove</button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Takeaways */}
              <div>
                <label className={labelClass}>Key Takeaways</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={tempTakeaway} onChange={e => setTempTakeaway(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTakeaway())} className="flex-grow bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="Add a takeaway…" />
                  <button type="button" onClick={addTakeaway} className="px-4 bg-gray-700 hover:bg-gray-600 rounded font-bold">Add</button>
                </div>
                <ul className="space-y-2">
                  {formData.takeaways.map((t, i) => (
                    <li key={i} className="flex justify-between items-center p-2 bg-gray-900 rounded border border-gray-800 text-sm">
                      <span>• {t}</span><button type="button" onClick={() => removeFromArray('takeaways', i)} className="text-red-400 hover:text-red-300">Remove</button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reflection */}
              <div>
                <label className={labelClass}>Personal Reflection</label>
                <textarea rows={4} value={formData.reflection} onChange={e => setFormData({ ...formData, reflection: e.target.value })} className={inputClass} placeholder="Your personal reflection on the event…" />
              </div>
            </div>
          )}

          {/* TAB: MEDIA & GALLERY */}
          {activeTab === 'media' && (
            <div className="space-y-8 animate-fade-in">
              {/* Photo Gallery */}
              <div>
                <label className={labelClass}>Event Photo Gallery</label>
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="text"
                    value={tempPhotoUrl}
                    onChange={e => setTempPhotoUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPhotoUrl())}
                    className="flex-grow bg-gray-900 border border-gray-700 rounded p-2 text-white"
                    placeholder="Paste image URL…"
                  />
                  <button type="button" onClick={addPhotoUrl} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-bold text-sm">Add URL</button>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]); }} />
                  <button type="button" onClick={() => photoInputRef.current?.click()} disabled={photoUploading} className="px-4 py-2 bg-primary hover:bg-blue-600 rounded font-bold text-sm disabled:opacity-50">
                    {photoUploading ? 'Uploading…' : 'Upload File'}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.photos.map((photo, i) => (
                    <div key={i} className="relative group rounded border border-gray-700 overflow-hidden bg-gray-900 aspect-video">
                      <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFromArray('photos', i)}
                        className="absolute top-2 right-2 p-1 rounded bg-red-600 text-white opacity-90 hover:opacity-100 transition-opacity text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {formData.photos.length === 0 && (
                    <p className="text-gray-500 text-xs italic col-span-full">No gallery photos added yet.</p>
                  )}
                </div>
              </div>

              {/* Video Embeds */}
              <div className="pt-6 border-t border-gray-700">
                <label className={labelClass}>Event Videos (YouTube / Vimeo / MP4 Links)</label>
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="text"
                    value={tempVideoUrl}
                    onChange={e => setTempVideoUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addVideoUrl())}
                    className="flex-grow bg-gray-900 border border-gray-700 rounded p-2 text-white"
                    placeholder="Paste video URL (e.g. https://www.youtube.com/watch?v=...)"
                  />
                  <button type="button" onClick={addVideoUrl} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-bold text-sm">Add Video</button>
                </div>

                <div className="space-y-2">
                  {formData.videos.map((vid, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-900 rounded border border-gray-800 text-sm">
                      <span className="truncate text-gray-300 font-mono text-xs">{vid}</span>
                      <button type="button" onClick={() => removeFromArray('videos', i)} className="text-red-400 hover:text-red-300 text-xs font-bold ml-4">Remove</button>
                    </div>
                  ))}
                  {formData.videos.length === 0 && (
                    <p className="text-gray-500 text-xs italic">No video links added yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONNECTIONS */}
          {activeTab === 'connections' && (
            <div className="space-y-6 animate-fade-in">
              {/* People Met */}
              <div>
                <label className={labelClass}>People Met / Connections Made</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <input type="text" value={tempPersonName} onChange={e => setTempPersonName(e.target.value)} className="bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="Name" />
                  <input type="text" value={tempPersonRole} onChange={e => setTempPersonRole(e.target.value)} className="bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="Role / Title" />
                  <div className="flex gap-2">
                    <input type="text" value={tempPersonContact} onChange={e => setTempPersonContact(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPerson())} className="flex-grow bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="Contact / LinkedIn" />
                    <button type="button" onClick={addPerson} className="px-4 bg-gray-700 hover:bg-gray-600 rounded font-bold">Add</button>
                  </div>
                </div>
                <div className="space-y-2">
                  {formData.people_met.map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-900 rounded border border-gray-800 text-sm">
                      <div>
                        <span className="font-bold text-primary">{p.name}</span>
                        {p.role && <span className="text-gray-400 ml-2">— {p.role}</span>}
                        {p.contact && <span className="text-gray-500 ml-2 text-xs">({p.contact})</span>}
                      </div>
                      <button type="button" onClick={() => removeFromArray('people_met', i)} className="text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Skills */}
              <div>
                <label className={labelClass}>Related Skills</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={tempSkill} onChange={e => setTempSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} className="flex-grow bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="Skill name…" />
                  <button type="button" onClick={addSkill} className="px-4 bg-gray-700 hover:bg-gray-600 rounded font-bold">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.related_skills.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-primary/20 border border-primary/40 text-primary rounded-full text-xs font-bold flex items-center gap-2">
                      {s} <button type="button" onClick={() => removeFromArray('related_skills', i)} className="text-red-400 ml-1">&times;</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Related Projects */}
              <div>
                <label className={labelClass}>Related Projects</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={tempProject} onChange={e => setTempProject(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addProject())} className="flex-grow bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="Project name…" />
                  <button type="button" onClick={addProject} className="px-4 bg-gray-700 hover:bg-gray-600 rounded font-bold">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.related_projects.map((p, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-full text-xs flex items-center gap-2">
                      {p} <button type="button" onClick={() => removeFromArray('related_projects', i)} className="text-red-400 ml-1">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PUBLISHING */}
          {activeTab === 'publishing' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className={labelClass}>Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className={inputClass}>
                  <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                </select>
              </div>
              <label className="flex items-center gap-2 mt-1 text-sm text-gray-300">
                <input type="checkbox" checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} className="w-4 h-4 rounded bg-gray-900 border-gray-700" />
                Feature this event prominently
              </label>

              <div className="pt-6 border-t border-gray-700 flex items-center gap-4">
                <button type="submit" className="px-8 py-2 bg-primary rounded font-bold hover:bg-blue-600 transition-colors">
                  {isEditing ? 'Save & Finalise' : 'Create Event'}
                </button>
                <SaveIndicator />
              </div>
            </div>
          )}

        </form>
      </div>

      {/* Events Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700 text-xs sm:text-sm text-gray-300">
                <th className="p-3 sm:p-4">Event</th>
                <th className="p-3 sm:p-4 hidden md:table-cell">Category</th>
                <th className="p-3 sm:p-4 hidden sm:table-cell">Date</th>
                <th className="p-3 sm:p-4 hidden sm:table-cell">Status</th>
                <th className="p-3 sm:p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500 text-sm">No events yet. Create your first one above!</td></tr>
              )}
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="p-3 sm:p-4 text-xs sm:text-sm">
                    <div className="font-bold text-primary">{item.title}</div>
                    {item.organizer && <div className="text-[11px] text-gray-400 mt-0.5">by {item.organizer}</div>}
                  </td>
                  <td className="p-3 sm:p-4 hidden md:table-cell">
                    {item.category && (
                      <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded bg-blue-500/20 text-blue-400">{item.category}</span>
                    )}
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-300 whitespace-nowrap hidden sm:table-cell">{item.date || '—'}</td>
                  <td className="p-3 sm:p-4 hidden sm:table-cell">
                    <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded ${item.status === 'published' ? 'bg-green-500/20 text-green-400' :
                        item.status === 'archived' ? 'bg-gray-600/50 text-gray-400' :
                          'bg-yellow-500/20 text-yellow-400'
                      }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => startEdit(item)} className="text-primary hover:underline font-medium">Edit</button>
                      {item.status === 'draft' && (
                        <button type="button" onClick={() => handleStatusChange(item.id, 'published')} className="text-green-400 hover:underline font-medium">Publish</button>
                      )}
                      {item.status === 'published' && (
                        <button type="button" onClick={() => handleStatusChange(item.id, 'archived')} className="text-yellow-400 hover:underline font-medium">Archive</button>
                      )}
                      <button type="button" onClick={() => handleDelete(item.id)} className="text-red-400 hover:underline font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
