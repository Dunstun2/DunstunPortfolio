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
    price: '',
    external_link: '',
    video_url: '',
    featured: false,
    status: 'published',
  };

  const [formData, setFormData] = useState<any>(initialForm);
  const [featureInput, setFeatureInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [uploadingVideo, setUploadingVideo] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingVideo(true);
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('folder', '/services/videos');

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
      setFormData((prev: any) => ({ ...prev, video_url: fullUrl }));
    } catch (error) {
      console.error(error);
      alert('Failed to upload video');
    } finally {
      setUploadingVideo(false);
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

    // Validate cover image is provided
    if (!formData.image_url || formData.image_url.trim() === '') {
      alert('⚠️ Cover Image is required. Please upload or provide an image URL.');
      return;
    }

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

    // Format external link
    let finalFormData = { ...formData };
    if (finalFormData.external_link && !finalFormData.external_link.match(/^https?:\/\//)) {
      finalFormData.external_link = `https://${finalFormData.external_link}`;
    }

    try {
      if (isEditing) {
        await fetchApi(`/services/${editId}`, { method: 'PUT', body: JSON.stringify(finalFormData) });
      } else {
        await fetchApi('/services', { method: 'POST', body: JSON.stringify(finalFormData) });
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
      price: item.price || '',
      external_link: item.external_link || '',
      video_url: item.video_url || '',
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

  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    try {
      await fetchApi(`/services/${deleteId}`, { method: 'DELETE' });
      loadData();
      setDeleteId(null);
      alert('✅ Service deleted successfully!');
    } catch (err: any) {
      console.error(err.message);
      alert('❌ Failed to delete service.');
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    
    // Update display_order based on new array order
    const orderData = newItems.map((item, i) => ({ id: item.id, display_order: i + 1 }));
    setItems(newItems); // Optimistic UI update
    
    try {
      await fetchApi('/services/reorder', {
        method: 'POST',
        body: JSON.stringify({ order: orderData })
      });
    } catch (err: any) {
      alert(err.message || 'Failed to reorder services');
      loadData(); // Revert on failure
    }
  };

  const moveDown = async (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    
    // Update display_order based on new array order
    const orderData = newItems.map((item, i) => ({ id: item.id, display_order: i + 1 }));
    setItems(newItems); // Optimistic UI update
    
    try {
      await fetchApi('/services/reorder', {
        method: 'POST',
        body: JSON.stringify({ order: orderData })
      });
    } catch (err: any) {
      alert(err.message || 'Failed to reorder services');
      loadData(); // Revert on failure
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
                <label className="block text-sm font-semibold mb-1 text-gray-300">Cover Image <span className="text-red-400">*</span></label>
                <div className="flex gap-2 items-center">
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-12 h-12 rounded object-cover border border-gray-700 bg-gray-800 shrink-0" />
                  )}
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    className="flex-1 min-w-0 bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
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
                  className="flex-1 min-w-0 bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  placeholder="Add a feature and press Enter"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-5 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 shrink-0"
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

            {/* Price & External Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-300">Price <span className="text-gray-500 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  placeholder='e.g. $50/hr, Starting at $500, Custom'
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-300">External Link <span className="text-gray-500 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={formData.external_link}
                  onChange={e => setFormData({ ...formData, external_link: e.target.value })}
                  onBlur={e => {
                    let val = e.target.value.trim();
                    if (val && !/^https?:\/\//i.test(val)) {
                      val = `https://${val}`;
                      setFormData({ ...formData, external_link: val });
                    }
                  }}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  placeholder="e.g. comrades360.shop or https://example.com"
                />
              </div>
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-300">Video <span className="text-gray-500 font-normal">(optional)</span></label>
              <div className="flex gap-2 items-center">
                {formData.video_url && (
                  <div className="relative w-20 h-14 rounded overflow-hidden border border-gray-700 bg-gray-800 shrink-0">
                    <video src={formData.video_url} className="w-full h-full object-cover" muted />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, video_url: '' })}
                      className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-1 rounded-bl font-bold hover:bg-red-500"
                    >✕</button>
                  </div>
                )}
                <input
                  type="text"
                  value={formData.video_url}
                  onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                  className="flex-1 min-w-0 bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
                  placeholder="Video URL or upload"
                />
                <label className="cursor-pointer bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white px-4 py-3 rounded-xl transition-colors whitespace-nowrap flex items-center justify-center shrink-0">
                  {uploadingVideo ? 'Uploading...' : '📹 Upload'}
                  <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} disabled={uploadingVideo} />
                </label>
              </div>
              <p className="text-gray-500 text-xs mt-1">Upload a video or paste a URL (YouTube, Cloudinary, etc.)</p>
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
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700 text-xs sm:text-sm text-gray-300">
                <th className="p-3 sm:p-4 font-semibold">Order</th>
                <th className="p-3 sm:p-4 font-semibold">Media</th>
                <th className="p-3 sm:p-4 font-semibold">Service Name</th>
                <th className="p-3 sm:p-4 font-semibold">Price</th>
                <th className="p-3 sm:p-4 font-semibold">Features</th>
                <th className="p-3 sm:p-4 font-semibold">Status</th>
                <th className="p-3 sm:p-4 font-semibold">Featured</th>
                <th className="p-3 sm:p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No services yet. Create your first service above!
                  </td>
                </tr>
              )}
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-700/50 hover:bg-gray-750">
                  <td className="p-3 sm:p-4">
                    <div className="flex flex-row gap-2 items-center justify-center bg-gray-800 rounded-lg border border-gray-700 p-1 w-max mx-auto shadow-inner">
                      <button onClick={() => moveUp(index)} disabled={index === 0} className={`text-gray-400 hover:text-white px-1 ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}>
                        ◀
                      </button>
                      <span className="text-xs text-gray-300 font-bold w-4 text-center">{index + 1}</span>
                      <button onClick={() => moveDown(index)} disabled={index === items.length - 1} className={`text-gray-400 hover:text-white px-1 ${index === items.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}>
                        ▶
                      </button>
                    </div>
                  </td>
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-1">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded object-cover border border-gray-700" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-800 border border-gray-700 flex items-center justify-center text-xs text-gray-500">—</div>
                      )}
                      {item.video_url && (
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-bold">📹</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 sm:p-4">
                    <div className="text-sm font-medium text-white">{item.name}</div>
                    {item.external_link && (
                      <a href={item.external_link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline truncate block max-w-[120px]">🔗 Link</a>
                    )}
                  </td>
                  <td className="p-3 sm:p-4 text-sm text-gray-400">
                    {item.price ? <span className="text-primary font-bold">{item.price}</span> : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="p-3 sm:p-4 text-sm text-gray-400">
                    {Array.isArray(item.features) ? item.features.length : 0}
                  </td>
                  <td className="p-3 sm:p-4">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-lg ${item.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 text-sm">
                    <button
                      onClick={() => toggleFeatured(item.id, item.featured)}
                      className={`text-2xl transition-opacity ${item.featured ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
                      title={item.featured ? 'Click to unmark as featured' : 'Click to mark as featured'}
                    >
                      ⭐
                    </button>
                  </td>
                  <td className="p-3 sm:p-4 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-3">
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
                      <button onClick={() => confirmDelete(item.id)} className="text-xs font-semibold text-red-400 hover:underline">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden">
          {items.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No services yet. Create your first service above!
            </div>
          )}
          <div className="flex flex-col gap-4 p-4">
            {items.map((item, index) => (
              <div key={item.id} className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col gap-3 relative shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Media */}
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded object-cover border border-gray-700" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-800 border border-gray-700 flex items-center justify-center text-xs text-gray-500">—</div>
                    )}
                    <div className="flex flex-col gap-1">
                      <h3 className="font-bold text-white text-sm leading-tight">{item.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${item.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {item.status.toUpperCase()}
                        </span>
                        {item.price && <span className="text-[10px] text-primary font-bold">{item.price}</span>}
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Controls */}
                  <div className="flex flex-row gap-2 items-center justify-center bg-gray-800 rounded-lg border border-gray-700 p-1 shrink-0 shadow-inner">
                    <button onClick={() => moveUp(index)} disabled={index === 0} className={`text-gray-400 hover:text-white px-1 ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}>◀</button>
                    <span className="text-[10px] text-gray-300 font-bold text-center w-3">{index + 1}</span>
                    <button onClick={() => moveDown(index)} disabled={index === items.length - 1} className={`text-gray-400 hover:text-white px-1 ${index === items.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}>▶</button>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-700/50 mt-1">
                  <button
                    onClick={() => toggleFeatured(item.id, item.featured)}
                    className={`text-xl transition-opacity ${item.featured ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
                    title={item.featured ? 'Click to unmark as featured' : 'Click to mark as featured'}
                  >
                    ⭐
                  </button>
                  
                  <div className="flex items-center gap-3">
                    {item.status !== 'published' ? (
                      <button onClick={() => handleStatusChange(item.id, 'published')} className="text-xs font-semibold text-green-400 hover:underline px-2 py-1 bg-green-500/10 rounded">
                        Publish
                      </button>
                    ) : (
                      <button onClick={() => handleStatusChange(item.id, 'draft')} className="text-xs font-semibold text-yellow-400 hover:underline px-2 py-1 bg-yellow-500/10 rounded">
                        Unpublish
                      </button>
                    )}
                    <button onClick={() => startEdit(item)} className="text-xs font-semibold text-primary hover:underline px-2 py-1 bg-blue-500/10 rounded">
                      Edit
                    </button>
                    <button onClick={() => confirmDelete(item.id)} className="text-xs font-semibold text-red-400 hover:underline px-2 py-1 bg-red-500/10 rounded">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-bg-dark border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Delete Service?</h3>
            <p className="text-gray-400 mb-6 text-sm">
              Are you sure you want to delete this service? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-bold text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
