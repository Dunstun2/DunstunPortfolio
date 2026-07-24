'use client';
import { useState, useEffect, useRef } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';

export default function AdminTestimonials() {
  const refreshKey = useRealtimeRefresh('testimonials');
  const [items, setItems] = useState<any[]>([]);
  const initialForm = {
    author_name: '',
    email: '',
    author_title: '',
    company: '',
    relationship: '',
    content: '',
    avatar_url: '',
    photo_consent: false,
    display_photo: true,
    display_name: true,
    display_title: true,
    display_company: true,
    featured: false,
    status: 'draft',
  };

  const [formData, setFormData] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    fetchApi('/testimonials').then(res => setItems(res.data)).catch(console.error);
  };

  useEffect(() => { loadData(); }, [refreshKey]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/media`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = await res.json();
      const url = json.success && json.data?.file_path 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${json.data.file_path}` 
        : null;
      if (url) {
        setFormData(prev => ({ ...prev, avatar_url: url }));
      }
    } catch (err) { console.error(err); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await fetchApi(`/testimonials/${editId}`, { method: 'PUT', body: JSON.stringify(formData) });
      } else {
        await fetchApi('/testimonials', { method: 'POST', body: JSON.stringify(formData) });
      }
      resetForm();
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetchApi(`/testimonials/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await fetchApi(`/testimonials/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) { console.error(err); }
  };

  const startEdit = (item: any) => {
    setFormData({
      author_name: item.author_name || '',
      email: item.email || '',
      author_title: item.author_title || '',
      company: item.company || '',
      relationship: item.relationship || '',
      content: item.content || '',
      avatar_url: item.avatar_url || '',
      photo_consent: item.photo_consent ?? false,
      display_photo: item.display_photo ?? true,
      display_name: item.display_name ?? true,
      display_title: item.display_title ?? true,
      display_company: item.display_company ?? true,
      featured: item.featured ?? false,
      status: item.status || 'draft',
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
      <h1 className="text-3xl font-bold">Testimonials & Feedback CMS</h1>

      {/* Editor Card */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-6">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h2 className="text-xl font-bold">{isEditing ? 'Edit Testimonial' : 'Add / Review Testimonial'}</h2>
          {isEditing && <button type="button" onClick={resetForm} className="text-sm text-gray-400 hover:text-white">Cancel Edit</button>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Submitter Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">1. Submitter Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name *</label>
                <input required type="text" value={formData.author_name} onChange={e => setFormData({...formData, author_name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white" placeholder="author@example.com" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Relationship / Context</label>
                <input type="text" value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white" placeholder="Colleague, Client, Mentor" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Professional Title</label>
                <input type="text" value={formData.author_title} onChange={e => setFormData({...formData, author_title: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white" placeholder="Senior Developer" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Organization / Company</label>
                <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white" placeholder="ABC Tech" />
              </div>
            </div>
          </div>

          {/* Feedback Content */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">2. Feedback Message</h3>
            <textarea required rows={4} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white" placeholder="Write or edit feedback content..."></textarea>
          </div>

          {/* Profile Photo & Consent */}
          <div className="space-y-3 pt-3 border-t border-gray-700">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">3. Profile Photo & Consent</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center text-xs text-gray-500 font-bold">
                  No Photo
                </div>
              )}
              <div className="flex-1 space-y-2 w-full">
                <div className="flex gap-2">
                  <input type="text" value={formData.avatar_url} onChange={e => setFormData({...formData, avatar_url: e.target.value})} className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-xs text-white" placeholder="Photo URL or upload..." />
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold text-white disabled:opacity-50">
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </button>
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-300">
                  <input type="checkbox" checked={formData.photo_consent} onChange={e => setFormData({...formData, photo_consent: e.target.checked})} className="rounded bg-gray-900 border-gray-700" />
                  <span>User gave photo display consent ✓</span>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy & Display Controls */}
          <div className="space-y-3 pt-3 border-t border-gray-700">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">4. Admin Display Privacy Settings</h3>
            <div className="flex flex-wrap gap-6 text-xs text-gray-200 bg-gray-900 p-4 rounded border border-gray-750">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.display_photo} onChange={e => setFormData({...formData, display_photo: e.target.checked})} className="rounded bg-gray-800" />
                <span>Display Photo on Card</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.display_name} onChange={e => setFormData({...formData, display_name: e.target.checked})} className="rounded bg-gray-800" />
                <span>Display Name</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.display_title} onChange={e => setFormData({...formData, display_title: e.target.checked})} className="rounded bg-gray-800" />
                <span>Display Title</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.display_company} onChange={e => setFormData({...formData, display_company: e.target.checked})} className="rounded bg-gray-800" />
                <span>Display Organization</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} className="rounded bg-gray-800" />
                <span>Feature on Homepage</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
            <button type="submit" className="px-6 py-2 bg-primary rounded font-bold hover:bg-blue-600 transition-colors text-white">
              {isEditing ? 'Save Changes' : 'Create Testimonial'}
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
        <div className="p-4 bg-gray-900 border-b border-gray-700 font-bold text-sm sm:text-base">
          Submitted Testimonials & Moderation
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/60 border-b border-gray-700 text-xs text-gray-400">
                <th className="p-3 sm:p-4">Submitter</th>
                <th className="p-3 sm:p-4">Feedback Preview</th>
                <th className="p-3 sm:p-4 hidden md:table-cell">Photo & Consent</th>
                <th className="p-3 sm:p-4 hidden sm:table-cell">Status</th>
                <th className="p-3 sm:p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500 text-sm">No feedback submitted yet.</td></tr>
              )}
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-750 text-xs sm:text-sm">
                  <td className="p-3 sm:p-4">
                    <div className="font-bold text-primary">{item.author_name}</div>
                    <div className="text-[11px] text-gray-400">{item.author_title} {item.company ? `@ ${item.company}` : ''}</div>
                    {item.email && <div className="text-[11px] text-gray-500 mt-0.5">{item.email}</div>}
                  </td>
                  <td className="p-3 sm:p-4 max-w-xs">
                    <p className="text-xs text-gray-300 line-clamp-2 italic">&ldquo;{item.content}&rdquo;</p>
                  </td>
                  <td className="p-3 sm:p-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      {item.avatar_url ? (
                        <img src={item.avatar_url} alt={item.author_name} className="w-8 h-8 rounded-full object-cover border border-gray-600" />
                      ) : (
                        <span className="text-xs text-gray-500 italic">No Photo</span>
                      )}
                      {item.photo_consent ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/30">Consent ✓</span>
                      ) : item.avatar_url ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">No Consent</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="p-3 sm:p-4 hidden sm:table-cell">
                    <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded ${
                      item.status === 'published' ? 'bg-green-500/20 text-green-400' :
                      item.status === 'archived' ? 'bg-gray-600/50 text-gray-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {item.status !== 'published' && (
                        <button type="button" onClick={() => handleStatusChange(item.id, 'published')} className="text-xs text-green-400 hover:underline font-bold">Approve</button>
                      )}
                      {item.status === 'published' && (
                        <button type="button" onClick={() => handleStatusChange(item.id, 'archived')} className="text-xs text-yellow-400 hover:underline">Archive</button>
                      )}
                      <button type="button" onClick={() => startEdit(item)} className="text-xs text-primary hover:underline">Edit</button>
                      <button type="button" onClick={() => handleDelete(item.id)} className="text-xs text-red-400 hover:underline">Delete</button>
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
