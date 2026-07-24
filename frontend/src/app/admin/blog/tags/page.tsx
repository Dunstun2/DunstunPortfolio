'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';

export default function AdminBlogTags() {
  const refreshKey = useRealtimeRefresh('blogTags');
  const [items, setItems] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  
  const initialForm = {
    name: '',
    slug: '',
    description: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const loadData = () => {
    fetchApi('/blog-tags').then(res => setItems(res.data)).catch(console.error);
  };

  useEffect(() => { loadData(); }, [refreshKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await fetchApi(`/blog-tags/${editId}`, { method: 'PUT', body: JSON.stringify(formData) });
      } else {
        await fetchApi('/blog-tags', { method: 'POST', body: JSON.stringify(formData) });
      }
      setIsEditing(false);
      setFormData(initialForm);
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEdit = (item: any) => {
    setFormData({
      name: item.name,
      slug: item.slug,
      description: item.description || ''
    });
    setEditId(item.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    try {
      await fetchApi(`/blog-tags/${id}`, { method: 'DELETE' });
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Blog Tags</h1>
          <p className="text-gray-400 text-sm">Manage tags for your blog posts.</p>
        </div>
        {isEditing && (
          <button onClick={() => { setIsEditing(false); setFormData(initialForm); }} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">Cancel Edit</button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">{isEditing ? 'Edit Tag' : 'Add Tag'}</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Slug (optional)</label>
              <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary h-24" />
            </div>

            <button type="submit" className="w-full py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary-dark transition-colors">
              {isEditing ? 'Save Changes' : 'Add Tag'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800/50 border-b border-gray-800 text-gray-400 text-sm">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Slug</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {items.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-gray-500">No tags found.</td></tr>
                ) : items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 font-medium text-white">{item.name}</td>
                    <td className="p-4 text-gray-400 text-sm">{item.slug}</td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleEdit(item)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
