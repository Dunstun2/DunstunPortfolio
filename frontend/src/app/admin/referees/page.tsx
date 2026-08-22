'use client';
import { useState, useEffect, useRef } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { API_BASE_URL, getFileUrl } from '@/utils/urls';
import { UserCheck, Upload, Shield, Mail, Phone, LayoutGrid, Loader2 } from 'lucide-react';

// Pages where the referees section can be placed
const PLACEABLE_PAGES = [
  { key: 'home', label: 'Homepage', description: 'Shows on the main / page' },
  { key: 'about', label: 'About Page', description: 'Shows on /about' },
  { key: 'contact', label: 'Contact Page', description: 'Shows on /contact' },
  { key: 'experience', label: 'Experience Page', description: 'Shows on /experience' },
];

export default function AdminReferees() {
  const refreshKey = useRealtimeRefresh('referees');
  const [items, setItems] = useState<any[]>([]);

  // --- Section Placement State ---
  const [activeTemplate, setActiveTemplate] = useState<any>(null);
  const [activePlacements, setActivePlacements] = useState<Set<string>>(new Set());
  const [placementSaving, setPlacementSaving] = useState(false);
  const [placementSaved, setPlacementSaved] = useState(false);

  // Load active template and compute current placements
  useEffect(() => {
    fetchApi('/templates/active')
      .then(res => {
        if (res.data) {
          const tmpl = res.data;
          if (typeof tmpl.config === 'string') {
            try { tmpl.config = JSON.parse(tmpl.config); } catch { tmpl.config = {}; }
          }
          setActiveTemplate(tmpl);
          const config = tmpl.config || {};
          const placed = new Set<string>();
          // Check homepage
          if ((config.homepageSections || []).includes('referees')) placed.add('home');
          // Check sub-pages
          const pageSections: Record<string, string[]> = config.pageSections || {};
          for (const [page, sections] of Object.entries(pageSections)) {
            if ((sections as string[]).includes('referees')) placed.add(page);
          }
          setActivePlacements(placed);
        }
      })
      .catch(console.error);
  }, []);

  const togglePlacement = (pageKey: string) => {
    setActivePlacements(prev => {
      const next = new Set(prev);
      if (next.has(pageKey)) next.delete(pageKey); else next.add(pageKey);
      return next;
    });
    setPlacementSaved(false);
  };

  const savePlacements = async () => {
    if (!activeTemplate) return;
    setPlacementSaving(true);
    try {
      const config = JSON.parse(JSON.stringify(activeTemplate.config || {}));
      // Update homepageSections
      const homeSections: string[] = config.homepageSections || [];
      if (activePlacements.has('home')) {
        if (!homeSections.includes('referees')) homeSections.push('referees');
      } else {
        const idx = homeSections.indexOf('referees');
        if (idx !== -1) homeSections.splice(idx, 1);
      }
      config.homepageSections = homeSections;
      // Update pageSections — ensure the page's default section is always preserved
      // e.g. contact page must keep 'contact', experience page must keep 'experience'
      const PAGE_DEFAULTS: Record<string, string> = {
        contact: 'contact',
        experience: 'experience',
        about: 'about',
      };
      const pageSections: Record<string, string[]> = config.pageSections || {};
      for (const { key } of PLACEABLE_PAGES) {
        if (key === 'home') continue;
        // Start from existing or seed with the page's own default section
        const defaultSec = PAGE_DEFAULTS[key] || key;
        const current: string[] = pageSections[key]?.length
          ? [...pageSections[key]]
          : [defaultSec];
        // Ensure default section is always present
        if (!current.includes(defaultSec)) current.unshift(defaultSec);
        if (activePlacements.has(key)) {
          if (!current.includes('referees')) current.push('referees');
        } else {
          const idx = current.indexOf('referees');
          if (idx !== -1) current.splice(idx, 1);
        }
        pageSections[key] = current;
      }
      config.pageSections = pageSections;
      await fetchApi(`/templates/${activeTemplate.id}`, {
        method: 'PUT',
        body: JSON.stringify({ config }),
      });
      setActiveTemplate((prev: any) => prev ? { ...prev, config } : null);
      setPlacementSaved(true);
      setTimeout(() => setPlacementSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save placements:', err);
    } finally {
      setPlacementSaving(false);
    }
  };
  // --- End Section Placement ---

  const initialForm = {
    full_name: '',
    job_title: '',
    organization: '',
    relationship: '',
    email: '',
    phone: '',
    linkedin_url: '',
    avatar_url: '',
    years_known: '',
    context: '',
    display_email: false,
    display_phone: false,
    status: 'draft',
    order: 0,
  };

  const [formData, setFormData] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    fetchApi('/referees')
      .then(res => setItems(res.data || []))
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
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
      const url = json.success && json.data?.file_path ? getFileUrl(json.data.file_path) : null;
      if (url) {
        setFormData(prev => ({ ...prev, avatar_url: url }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await fetchApi(`/referees/${editId}`, { method: 'PUT', body: JSON.stringify(formData) });
      } else {
        await fetchApi('/referees', { method: 'POST', body: JSON.stringify(formData) });
      }
      resetForm();
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetchApi(`/referees/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this referee?')) return;
    try {
      await fetchApi(`/referees/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (item: any) => {
    setFormData({
      full_name: item.full_name || '',
      job_title: item.job_title || '',
      organization: item.organization || '',
      relationship: item.relationship || '',
      email: item.email || '',
      phone: item.phone || '',
      linkedin_url: item.linkedin_url || '',
      avatar_url: item.avatar_url || '',
      years_known: item.years_known || '',
      context: item.context || '',
      display_email: item.display_email ?? false,
      display_phone: item.display_phone ?? false,
      status: item.status || 'draft',
      order: item.order || 0,
    });
    setIsEditing(true);
    setEditId(item.id);
  };

  const resetForm = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setEditId('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Referees CMS</h1>
        <p className="text-sm text-gray-400 mt-1">Manage professional references and their contact display privacy.</p>
      </div>

      {/* Section Placement Panel */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Section Placement</h2>
          </div>
          {activeTemplate && (
            <span className="text-xs text-gray-400">
              Active template: <span className="text-primary font-semibold capitalize">{activeTemplate.name || activeTemplate.slug}</span>
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400">
          Choose which public pages display the Referees section. Changes are saved to the active template config.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PLACEABLE_PAGES.map(({ key, label, description }) => {
            const active = activePlacements.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => togglePlacement(key)}
                className={`relative flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all ${
                  active
                    ? 'bg-primary/10 border-primary text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {active && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                <span className="font-semibold text-sm">{label}</span>
                <span className="text-xs opacity-60">{description}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={savePlacements}
            disabled={placementSaving || !activeTemplate}
            className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-sm transition-all ${
              placementSaved
                ? 'bg-green-600 text-white'
                : 'bg-primary hover:bg-blue-600 text-white disabled:opacity-50'
            }`}
          >
            {placementSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : placementSaved ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : null}
            {placementSaving ? 'Saving...' : placementSaved ? 'Saved!' : 'Save Placement'}
          </button>
          {!activeTemplate && (
            <span className="text-xs text-yellow-400">⚠️ No active template found</span>
          )}
        </div>
      </div>

      {/* Editor Card */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-6">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h2 className="text-xl font-bold">{isEditing ? 'Edit Referee' : 'Add New Referee'}</h2>
          {isEditing && (
            <button type="button" onClick={resetForm} className="text-sm text-gray-400 hover:text-white">
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Basic Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">1. Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Full Name *</label>
                <input
                  required
                  type="text"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                  placeholder="Dr. John Doe"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Job Title *</label>
                <input
                  required
                  type="text"
                  value={formData.job_title}
                  onChange={e => setFormData({ ...formData, job_title: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                  placeholder="Senior Engineering Manager"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Organization / Institution *</label>
                <input
                  required
                  type="text"
                  value={formData.organization}
                  onChange={e => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                  placeholder="Acme Corp / University of Technology"
                />
              </div>
            </div>
          </div>

          {/* 2. Relationship & Context */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">2. Relationship & Context</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Relationship / Role *</label>
                <input
                  required
                  type="text"
                  value={formData.relationship}
                  onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                  placeholder="Direct Supervisor, Academic Advisor, Client"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Years Known / Duration</label>
                <input
                  type="text"
                  value={formData.years_known}
                  onChange={e => setFormData({ ...formData, years_known: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                  placeholder="3 years, Since 2021"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Context / Reference Summary</label>
              <textarea
                rows={3}
                value={formData.context}
                onChange={e => setFormData({ ...formData, context: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                placeholder="Brief summary of how this person knows your work, key projects collaborated on..."
              ></textarea>
            </div>
          </div>

          {/* 3. Contact & Social Details */}
          <div className="space-y-3 pt-3 border-t border-gray-700">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">3. Contact Details & Social</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                  placeholder="john.doe@example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">LinkedIn Profile URL</label>
                <input
                  type="text"
                  value={formData.linkedin_url}
                  onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                  placeholder="https://linkedin.in/in/johndoe"
                />
              </div>
            </div>
          </div>

          {/* 4. Privacy Controls & Display Settings */}
          <div className="space-y-3 pt-3 border-t border-gray-700">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>4. Public Display Privacy Controls</span>
            </h3>
            <div className="bg-gray-900 p-4 rounded border border-gray-750 space-y-3 text-xs text-gray-200">
              <p className="text-gray-400">
                By default, sensitive contact details (email and phone) are hidden from the public portfolio, and a &ldquo;Contact details available upon request&rdquo; message is displayed instead. Check below to explicitly publish details.
              </p>
              <div className="flex flex-wrap gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.display_email}
                    onChange={e => setFormData({ ...formData, display_email: e.target.checked })}
                    className="rounded bg-gray-800 border-gray-700"
                  />
                  <span>Display Email publicly on card</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.display_phone}
                    onChange={e => setFormData({ ...formData, display_phone: e.target.checked })}
                    className="rounded bg-gray-800 border-gray-700"
                  />
                  <span>Display Phone publicly on card</span>
                </label>
              </div>
            </div>
          </div>

          {/* 5. Photo & Status */}
          <div className="space-y-3 pt-3 border-t border-gray-700">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">5. Photo & Publishing Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex items-center gap-4">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Profile" className="w-14 h-14 rounded-full object-cover border-2 border-primary" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-xs text-gray-500 font-bold">
                    No Photo
                  </div>
                )}
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={formData.avatar_url}
                    onChange={e => setFormData({ ...formData, avatar_url: e.target.value })}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-xs text-white"
                    placeholder="Photo URL or upload..."
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold text-white disabled:opacity-50 flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
            <button type="submit" className="px-6 py-2 bg-primary rounded font-bold hover:bg-blue-600 transition-colors text-white">
              {isEditing ? 'Save Changes' : 'Create Referee'}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-700 rounded font-bold hover:bg-gray-600 text-gray-300">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Moderation & Overview Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <div className="p-4 bg-gray-900 border-b border-gray-700 font-bold text-sm sm:text-base flex items-center justify-between">
          <span>Registered Referees</span>
          <span className="text-xs text-gray-400 font-normal">{items.length} Total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/60 border-b border-gray-700 text-xs text-gray-400">
                <th className="p-3 sm:p-4">Referee</th>
                <th className="p-3 sm:p-4">Relationship</th>
                <th className="p-3 sm:p-4 hidden md:table-cell">Contact & Privacy</th>
                <th className="p-3 sm:p-4 hidden sm:table-cell">Status</th>
                <th className="p-3 sm:p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">
                    No referees added yet.
                  </td>
                </tr>
              )}
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-750 text-xs sm:text-sm">
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      {item.avatar_url ? (
                        <img src={item.avatar_url} alt={item.full_name} className="w-9 h-9 rounded-full object-cover border border-gray-600" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-gray-400 font-bold">
                          <UserCheck className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-primary">{item.full_name}</div>
                        <div className="text-[11px] text-gray-400">
                          {item.job_title} @ {item.organization}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                      {item.relationship}
                    </span>
                    {item.years_known && <div className="text-[11px] text-gray-400 mt-1">{item.years_known}</div>}
                  </td>
                  <td className="p-3 sm:p-4 hidden md:table-cell">
                    <div className="space-y-1 text-xs">
                      {item.email && (
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <Mail className="w-3 h-3 text-gray-500" />
                          <span>{item.email}</span>
                          {item.display_email ? (
                            <span className="text-[10px] text-green-400 font-bold ml-1">(Public)</span>
                          ) : (
                            <span className="text-[10px] text-gray-500 ml-1">(Hidden)</span>
                          )}
                        </div>
                      )}
                      {item.phone && (
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <span>{item.phone}</span>
                          {item.display_phone ? (
                            <span className="text-[10px] text-green-400 font-bold ml-1">(Public)</span>
                          ) : (
                            <span className="text-[10px] text-gray-500 ml-1">(Hidden)</span>
                          )}
                        </div>
                      )}
                      {!item.email && !item.phone && <span className="text-gray-500 italic">No contact details</span>}
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 hidden sm:table-cell">
                    <span
                      className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded ${
                        item.status === 'published'
                          ? 'bg-green-500/20 text-green-400'
                          : item.status === 'archived'
                          ? 'bg-gray-600/50 text-gray-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {item.status !== 'published' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'published')}
                          className="text-xs text-green-400 hover:underline font-bold"
                        >
                          Publish
                        </button>
                      )}
                      {item.status === 'published' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'archived')}
                          className="text-xs text-yellow-400 hover:underline"
                        >
                          Archive
                        </button>
                      )}
                      <button type="button" onClick={() => startEdit(item)} className="text-xs text-primary hover:underline">
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(item.id)} className="text-xs text-red-400 hover:underline">
                        Delete
                      </button>
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
