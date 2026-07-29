'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';

import { API_BASE_URL, getFileUrl } from '@/utils/urls';

export default function AdminServices() {
  const refreshKey = useRealtimeRefresh('services', false);
  const [items, setItems] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [featuredCount, setFeaturedCount] = useState(0);

  const initialForm = {
    name: '',
    description: '',
    image_url: '',
    features: [] as string[],
    featured: false,
    status: 'published',
  };

  const [formData, setFormData] = useState<any>(initialForm);
  const [featureInput, setFeatureInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImage(true);
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('folder', '/services');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/media`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: uploadData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const resData = await res.json();
      
      const fullUrl = getFileUrl(resData.data.file_path);
      setFormData((prev: any) => ({ ...prev, image_url: fullUrl }));
    } catch (error) {
      console.error(error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const loadData = () => {
    fetchApi('/services/admin/all').then(res => {
      setItems(res.data);
      const featured = res.data.filter((s: any) => s.featured).length;
      setFeaturedCount(featured);
    }).catch(err => console.error(err.message));
  };

  useEffect(() => { loadData(); }, [refreshKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate featured limit (max 3)
    if (formData.featured && !isEditing) {
      if (featuredCount >= 3) {
        alert('⚠️ Maximum 3 featured services allowed. Please unmark another service first.');
        return;
      }
    }

    if (formData.featured && isEditing) {
      const currentItem = items.find(s => s.id === editId);
      if (!currentItem?.featured && featuredCount >= 3) {
        alert('⚠️ Maximum 3 featured services allowed. Please unmark another service first.');
        return;
      }
    }

    try {
      if (isEditing) {
        await fetchApi(`/services/${editId}`, { method: 'PUT', body: JSON.stringify(formData) });
      } else {
        await fetchApi('/services', { method: 'POST', body: JSON.stringify(formData) });
      }
      resetForm();
      loadData();
      alert(isEditing ? '✅ Service updated successfully!' : '✅ Service created successfully!');
    } catch (err: any) {
      console.error(err.message);
      alert(err.message || '❌ Failed to save service. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setEditId('');
    setFeatureInput('');
  };

  const startEdit = (item: any) => {
    setFormData({
      name: item.name || '',
      description: item.description || '',
      image_url: item.image_url || '',
      features: Array.isArray(item.features) ? item.features : [],
      featured: !!item.featured,
      status: item.status || 'published',
    });
    setIsEditing(true);
    setEditId(item.id);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetchApi(`/services/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      loadData();
    } catch (err: any) {
      console.error(err.message);
      alert('❌ Failed to update status.');
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    // If marking as featured, check the limit
    if (!currentFeatured && featuredCount >= 3) {
      alert('⚠️ Maximum 3 featured services allowed. Please unmark another service first.');
      return;
    }

    try {
      await fetchApi(`/services/${id}/featured`, {
        method: 'PUT',
        body: JSON.stringify({ featured: !currentFeatured })
      });
      loadData();
    } catch (err: any) {
      console.error(err.message);
      if (err.message?.includes('Maximum 3')) {
        alert('⚠️ Maximum 3 featured services allowed.');
      } else {
        alert('❌ Failed to update featured status.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('⚠️ Are you sure you want to delete this service? This action cannot be undone.')) return;
    try {
      await fetchApi(`/services/${id}`, { method: 'DELETE' });
      loadData();
      alert('✅ Service deleted successfully!');
    } catch (err: any) {
      console.error(err.message);
      alert('❌ Failed to delete service.');
    }
  };

  // Feature management
  const addFeature = () => {
    if (!featureInput.trim()) return;
    if (!formData.features.includes(featureInput.trim())) {
      setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
    }
    setFeatureInput('');
  };

  const removeFeature = (feature: string) => {
    setFormData({ ...formData, features: formData.features.filter((f: string) => f !== feature) });
  };

  return (
    <div className="pb-16">
      <h1 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8 whitespace-nowrap">Services Management</h1>

      {/* Info Banner */}
      <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-200">
          <span className="font-bold">⭐ Featured Services:</span> You can mark up to 3 services as featured.
          Featured services appear on the homepage Services section. {featuredCount}/3 slots used.
        </p>
      </div>

      {/* CMS Form Card */}
      <div className="bg-gray-800 p-6 rounded-2xl mb-12 border border-gray-700 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{isEditing ? 'Edit Service' : 'Create New Service'}</h2>
          {isEditing && (
            <button onClick={resetForm} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg text-gray-300">
              Cancel Editing
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-300">Service Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  placeholder="e.g. Web Development"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-300">Cover Image</label>
                <div className="flex gap-2 items-center">
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-12 h-12 rounded object-cover border border-gray-700 bg-gray-800 shrink-0" />
                  )}
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                    placeholder="Image URL"
                  />
                  <label className="cursor-pointer bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white px-4 py-3 rounded-xl transition-colors whitespace-nowrap flex items-center justify-center shrink-0">
                    {uploadingImage ? 'Uploading...' : 'Upload'}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-300">Description *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                placeholder="Describe what this service includes..."
              ></textarea>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Key Features</label>
              <div className="flex gap-3 mb-3">
                <input
                  type="text"
                  value={featureInput}
                  onChange={e => setFeatureInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  placeholder="Add a feature and press Enter"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-5 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((f: string) => (
                  <span key={f} className="px-3 py-1.5 bg-secondary/20 text-secondary border border-secondary/30 rounded-xl text-sm font-semibold flex items-center gap-2">
                    ✓ {f}
                    <button
                      type="button"
                      onClick={() => removeFeature(f)}
                      className="text-gray-400 hover:text-white font-bold text-xs"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              {formData.features.length === 0 && (
                <p className="text-gray-500 text-sm italic mt-2">No features added yet.</p>
              )}
            </div>

            {/* Status & Featured */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-900 border-gray-700 text-primary focus:ring-primary"
                  disabled={!isEditing && featuredCount >= 3 && !formData.featured}
                />
                <label htmlFor="featured" className="text-sm font-semibold text-gray-200 cursor-pointer">
                  ⭐ Mark as Featured Service {!isEditing && featuredCount >= 3 && !formData.featured && '(Limit reached)'}
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
            >
              {isEditing ? 'Save Changes' : 'Create Service'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-700 text-gray-300 font-bold rounded-xl hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Services Table */}
      <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700 text-xs sm:text-sm text-gray-300">
                <th className="p-3 sm:p-4 font-semibold">Cover Image</th>
                <th className="p-3 sm:p-4 font-semibold">Service Name</th>
                <th className="p-3 sm:p-4 font-semibold hidden md:table-cell">Features Count</th>
                <th className="p-3 sm:p-4 font-semibold hidden sm:table-cell">Status</th>
                <th className="p-3 sm:p-4 font-semibold">Featured</th>
                <th className="p-3 sm:p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No services yet. Create your first service above!
                  </td>
                </tr>
              )}
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-700/50 hover:bg-gray-750">
                  <td className="p-3 sm:p-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded object-cover border border-gray-700" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-800 border border-gray-700 flex items-center justify-center text-xs text-gray-500">None</div>
                    )}
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-white">{item.name}</td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-400 hidden md:table-cell">
                    {Array.isArray(item.features) ? item.features.length : 0} features
                  </td>
                  <td className="p-3 sm:p-4 hidden sm:table-cell">
                    <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-lg ${item.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm">
                    <button
                      onClick={() => toggleFeatured(item.id, item.featured)}
                      className={`text-2xl transition-opacity ${item.featured ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
                      title={item.featured ? 'Click to unmark as featured' : 'Click to mark as featured'}
                    >
                      ⭐
                    </button>
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm whitespace-nowrap">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {item.status !== 'published' ? (
                        <button onClick={() => handleStatusChange(item.id, 'published')} className="text-xs font-semibold text-green-400 hover:underline">
                          Publish
                        </button>
                      ) : (
                        <button onClick={() => handleStatusChange(item.id, 'draft')} className="text-xs font-semibold text-yellow-400 hover:underline">
                          Unpublish
                        </button>
                      )}
                      <button onClick={() => startEdit(item)} className="text-xs font-semibold text-primary hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-xs font-semibold text-red-400 hover:underline">
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
