'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';

const initialForm = {
  certification_name: '', slug: '', issuing_organization: '', category: '', issue_date: '', expiration_date: '',
  does_not_expire: false, credential_id: '', credential_url: '', verification_url: '', short_description: '',
  skills_covered: '', certificate_image: '', certificate_document: '', status: 'draft', featured: false, order: 0
};

export default function AdminCertifications() {
  const refreshKey = useRealtimeRefresh('certifications');
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadData(); }, [refreshKey]);

  const loadData = () => {
    fetchApi('/certifications').then(res => setItems(res.data)).catch(console.error);
  };

  const uploadFile = async (file: File, folder = '/certifications') => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('folder', folder);
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/media', {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: uploadData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const resData = await res.json();
    return `http://localhost:5000${resData.data.file_path}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) await fetchApi(`/certifications/${editId}`, { method: 'PUT', body: JSON.stringify(formData) });
      else await fetchApi('/certifications', { method: 'POST', body: JSON.stringify(formData) });
      setFormData(initialForm); setIsEditing(false); setEditId(''); setShowForm(false); loadData();
      alert('Saved successfully!');
    } catch (err) { console.error(err); alert('Save failed'); }
  };

  const startEdit = (item: any) => {
    const cleanItem = {
      ...initialForm,
      certification_name: item.certification_name || '',
      slug: item.slug || '',
      issuing_organization: item.issuing_organization || '',
      category: item.category || '',
      issue_date: item.issue_date || '',
      expiration_date: item.expiration_date || '',
      does_not_expire: item.does_not_expire || false,
      credential_id: item.credential_id || '',
      credential_url: item.credential_url || '',
      verification_url: item.verification_url || '',
      short_description: item.short_description || '',
      skills_covered: item.skills_covered || '',
      certificate_image: item.certificate_image || '',
      certificate_document: item.certificate_document || '',
      status: item.status || 'draft',
      featured: item.featured || false,
      order: item.order || 0,
    };
    setFormData(cleanItem);
    setIsEditing(true);
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this certification?')) return;
    try { await fetchApi(`/certifications/${id}`, { method: 'DELETE' }); loadData(); } catch (e) { console.error(e); }
  };

  const openNewForm = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setEditId('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData(initialForm);
    setIsEditing(false);
    setEditId('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-3xl font-bold">Certifications Management</h1>
        <button
          onClick={openNewForm}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Certification
        </button>
      </div>

      {/* Certifications Table/Grid */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <p className="text-lg font-medium mb-2">No certifications yet</p>
            <p className="text-sm mb-4">Add your first certification to get started</p>
            <button
              onClick={openNewForm}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Certification
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-700">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Certification</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Issuer</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Issue Date</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {items.map(item => (
                    <tr key={item.id} className="hover:bg-gray-750 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.certificate_image && (
                            <img src={item.certificate_image} alt={item.certification_name} className="w-12 h-12 rounded object-cover" />
                          )}
                          <div>
                            <div className="font-semibold text-white">{item.certification_name}</div>
                            {item.featured && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{item.issuing_organization || '-'}</td>
                      <td className="px-6 py-4">
                        {item.category ? (
                          <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">{item.category}</span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{item.issue_date || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'published' ? 'bg-green-500/20 text-green-400' :
                          item.status === 'draft' ? 'bg-gray-600/50 text-gray-300' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => startEdit(item)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition"
                          >
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
            <div className="md:hidden divide-y divide-gray-700">
              {items.map(item => (
                <div key={item.id} className="p-4 hover:bg-gray-750 transition">
                  <div className="flex gap-3 mb-3">
                    {item.certificate_image && (
                      <img src={item.certificate_image} alt={item.certification_name} className="w-16 h-16 rounded object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1 truncate">{item.certification_name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {item.featured && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                            ⭐ Featured
                          </span>
                        )}
                        {item.category && (
                          <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs">
                            {item.category}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.status === 'published' ? 'bg-green-500/20 text-green-400' :
                          item.status === 'draft' ? 'bg-gray-600/50 text-gray-300' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm mb-3">
                    {item.issuing_organization && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="truncate">{item.issuing_organization}</span>
                      </div>
                    )}
                    {item.issue_date && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{item.issue_date}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeForm} />
          <div className="absolute inset-0 flex items-center justify-center p-4 lg:p-8">
            <div
              className="w-full max-w-4xl max-h-full bg-gray-900 shadow-2xl rounded-lg overflow-y-auto scrollbar-hide"
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' } as React.CSSProperties}
            >
              <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-lg">
                <h2 className="text-xl font-bold">{isEditing ? 'Edit Certification' : 'Add Certification'}</h2>
                <button onClick={closeForm} className="text-gray-400 hover:text-white transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-400 mb-1">Certification Name *</label>
                      <input
                        required
                        placeholder="e.g., AWS Certified Solutions Architect"
                        value={formData.certification_name}
                        onChange={e => setFormData({ ...formData, certification_name: e.target.value })}
                        className="w-full bg-gray-800 p-2 rounded border border-gray-700 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Slug (auto-generated if empty)</label>
                      <input
                        placeholder="url-friendly-slug"
                        value={formData.slug}
                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full bg-gray-800 p-2 rounded border border-gray-700 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Issuing Organization *</label>
                      <input
                        required
                        placeholder="e.g., Amazon Web Services"
                        value={formData.issuing_organization}
                        onChange={e => setFormData({ ...formData, issuing_organization: e.target.value })}
                        className="w-full bg-gray-800 p-2 rounded border border-gray-700 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Category</label>
                      <input
                        placeholder="e.g., Cloud Computing, Programming"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-gray-800 p-2 rounded border border-gray-700 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Issue Date</label>
                      <input
                        placeholder="e.g., June 2024, 2024"
                        value={formData.issue_date}
                        onChange={e => setFormData({ ...formData, issue_date: e.target.value })}
                        className="w-full bg-gray-800 p-2 rounded border border-gray-700 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Expiration Date</label>
                      <input
                        placeholder="e.g., June 2027"
                        value={formData.expiration_date}
                        onChange={e => setFormData({ ...formData, expiration_date: e.target.value })}
                        disabled={formData.does_not_expire}
                        className="w-full bg-gray-800 p-2 rounded border border-gray-700 focus:border-primary focus:outline-none disabled:opacity-50"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.does_not_expire}
                          onChange={e => setFormData({ ...formData, does_not_expire: e.target.checked, expiration_date: e.target.checked ? '' : formData.expiration_date })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-400">This certification does not expire</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Credential Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2">Credential Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Credential ID</label>
                      <input
                        placeholder="Certificate/Credential ID"
                        value={formData.credential_id}
                        onChange={e => setFormData({ ...formData, credential_id: e.target.value })}
                        className="w-full bg-gray-800 p-2 rounded border border-gray-700 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Credential URL</label>
                      <input
                        type="url"
                        placeholder="https://credentials.example.com/..."
                        value={formData.credential_url}
                        onChange={e => setFormData({ ...formData, credential_url: e.target.value })}
                        className="w-full bg-gray-800 p-2 rounded border border-gray-700 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-400 mb-1">Verification URL</label>
                      <input
                        type="url"
                        placeholder="https://verify.example.com/..."
                        value={formData.verification_url}
                        onChange={e => setFormData({ ...formData, verification_url: e.target.value })}
                        className="w-full bg-gray-800 p-2 rounded border border-gray-700 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2">Description</h3>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Short Description</label>
                    <textarea
                      value={formData.short_description}
                      onChange={e => setFormData({ ...formData, short_description: e.target.value })}
                      placeholder="Brief description of this certification"
                      maxLength={1000}
                      rows={3}
                      className="w-full bg-gray-800 p-2 rounded border border-gray-700 focus:border-primary focus:outline-none"
                    />
                    <div className="text-xs text-gray-500 mt-1">{formData.short_description?.length || 0}/1000 characters</div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Skills Covered</label>
                    <textarea
                      value={formData.skills_covered}
                      onChange={e => setFormData({ ...formData, skills_covered: e.target.value })}
                      placeholder="List the skills and competencies covered (e.g., JavaScript · React · Node.js)"
                      rows={2}
                      className="w-full bg-gray-800 p-2 rounded border border-gray-700 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Evidence */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2">Evidence</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Certificate Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          if (!e.target.files || e.target.files.length === 0) return;
                          try {
                            const url = await uploadFile(e.target.files[0], '/certifications');
                            setFormData((prev: any) => ({ ...prev, certificate_image: url }));
                          } catch (err) { console.error(err); alert('Upload failed'); }
                          e.target.value = '';
                        }}
                        className="w-full text-sm"
                      />
                      {formData.certificate_image && (
                        <div className="mt-2 relative">
                          <img src={formData.certificate_image} alt="certificate" className="w-full h-40 object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, certificate_image: '' })}
                            className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Certificate Document (PDF)</label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={async (e) => {
                          if (!e.target.files || e.target.files.length === 0) return;
                          try {
                            const url = await uploadFile(e.target.files[0], '/certifications');
                            setFormData((prev: any) => ({ ...prev, certificate_document: url }));
                          } catch (err) { console.error(err); alert('Upload failed'); }
                          e.target.value = '';
                        }}
                        className="w-full text-sm"
                      />
                      {formData.certificate_document && (
                        <div className="mt-2 flex items-center justify-between bg-gray-800 p-2 rounded border border-gray-700">
                          <a className="text-primary text-sm" href={formData.certificate_document} target="_blank" rel="noreferrer">View Document</a>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, certificate_document: '' })}
                            className="text-red-500 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Display Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2">Display Settings</h3>
                  <div className="flex flex-wrap gap-4 items-center">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!formData.featured}
                        onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Featured Certification</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-400">Status:</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        className="bg-gray-800 p-2 rounded border border-gray-700 focus:border-primary focus:outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-400">Display Order:</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.order}
                        onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                        className="w-20 bg-gray-800 p-2 rounded border border-gray-700 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-700 sticky bottom-0 bg-gray-900 pb-4">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary hover:bg-primary/90 rounded text-white font-medium transition"
                  >
                    {isEditing ? 'Update Certification' : 'Add Certification'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
