'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';

export default function AdminSkills() {
  const refreshKey = useRealtimeRefresh('skills');
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', proficiency: 50, category: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');

  const loadData = () => {
    fetchApi('/skills').then(res => setItems(res.data)).catch(console.error);
  };

  useEffect(() => { loadData(); }, [refreshKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await fetchApi(`/skills/${editId}`, { method: 'PUT', body: JSON.stringify(formData) });
      } else {
        await fetchApi('/skills', { method: 'POST', body: JSON.stringify(formData) });
      }
      setFormData({ name: '', proficiency: 50, category: '' });
      setIsEditing(false);
      setEditId('');
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetchApi(`/skills/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) { console.error(err); }
  };

  const startEdit = (item: any) => {
    setFormData({ 
      name: item.name, proficiency: item.proficiency, category: item.category || '' 
    });
    setIsEditing(true);
    setEditId(item.id);
  };

  return (
    <div>
      <h1 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8 whitespace-nowrap">Skills Management</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg mb-12 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Skill' : 'Add Skill'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm mb-1">Category (e.g. Frontend, Backend)</label>
              <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Proficiency ({formData.proficiency}%)</label>
            <input required type="range" min="1" max="100" value={formData.proficiency} onChange={e => setFormData({...formData, proficiency: parseInt(e.target.value)})} className="w-full" />
          </div>

          <div className="flex gap-4 pt-2">
            <button type="submit" className="px-4 py-2 bg-primary rounded font-bold hover:bg-blue-600 transition-colors">
              {isEditing ? 'Update' : 'Add'}
            </button>
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(false); setFormData({name:'', proficiency:50, category:''}); }} className="px-4 py-2 bg-gray-600 rounded font-bold hover:bg-gray-500">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700 text-xs sm:text-sm text-gray-300">
                <th className="p-3 sm:p-4">Name</th>
                <th className="p-3 sm:p-4">Category</th>
                <th className="p-3 sm:p-4 hidden sm:table-cell">Proficiency</th>
                <th className="p-3 sm:p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-white">{item.name}</td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-300">{item.category}</td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-300 hidden sm:table-cell">{item.proficiency}%</td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(item)} className="text-primary hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:underline font-medium">Delete</button>
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
