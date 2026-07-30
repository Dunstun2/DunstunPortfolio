'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { API_BASE_URL, getFileUrl } from '@/utils/urls';

export default function AdminAbout() {
  const [activeTab, setActiveTab] = useState('general');
  const [editId, setEditId] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const skipNextAutoSave = useRef(false);

  const refreshKey = useRealtimeRefresh('about', false);

  const initialFormState = {
    title: '', content: '', image_url: '',
    professional_title: '',
    personal_introduction: '',
    professional_summary: '',
    mission_statement: '',
    vision_statement: '',
    interests: [] as string[],
    statistics: [] as { label: string; value: string }[],
    values: [], explorations: [], highlights: []
  };

  const [formData, setFormData] = useState<any>(initialFormState);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImage(fieldName);
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('folder', '/about');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/media`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: uploadData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const resData = await res.json();

      const filePath = resData.data.file_path;
      const fullUrl = getFileUrl(filePath);

      setFormData((prev: any) => ({ ...prev, [fieldName]: fullUrl }));
    } catch (error) {
      console.error(error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(null);
      e.target.value = '';
    }
  };

  const loadData = () => {
    fetchApi('/about').then(res => {
      const data = res.data && res.data.length > 0 ? res.data[0] : null;
      if (data) {
        startEdit(data);
      }
      setIsLoaded(true);
    }).catch(err => {
      console.error('Failed to fetch about data:', err);
      setIsLoaded(true);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveData = async (publish: boolean, dataToSave: any) => {
    const cleanedFormData = { ...dataToSave };
    let currentId = editId;

    if (currentId) {
      await fetchApi(`/about/${currentId}`, { method: 'PUT', body: JSON.stringify(cleanedFormData) });
    } else {
      const res = await fetchApi('/about', { method: 'POST', body: JSON.stringify(cleanedFormData) });
      if (res.data && res.data.id) {
        currentId = res.data.id;
        setEditId(currentId);
      }
    }

    if (publish && currentId) {
      await fetchApi(`/about/${currentId}/status`, { method: 'PUT', body: JSON.stringify({ status: 'published' }) });
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (skipNextAutoSave.current) {
      skipNextAutoSave.current = false;
      return;
    }

    autoSaveTimer.current = setTimeout(() => {
      saveData(false, formData)
        .catch((err) => {
          console.error(err);
        });
    }, 60000);
    
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [formData]);

  const handlePublish = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await saveData(true, formData);
      setCurrentStatus('published');
      loadData();
      alert('Saved and published successfully!');
    } catch (err) { console.error(err); }
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!editId) return;
    if (!confirm('Are you sure you want to archive this? It will be hidden from the public site.')) return;
    try {
      await fetchApi(`/about/${editId}/status`, { method: 'PUT', body: JSON.stringify({ status: 'archived' }) });
      setCurrentStatus('archived');
      alert('About section archived. It is now hidden from the public site.');
    } catch (err) { console.error(err); }
  };

  const startEdit = (item: any) => {
    const sanitizedItem = { ...item };

    // Replace nulls with empty strings to prevent React uncontrolled input warnings
    for (const key in sanitizedItem) {
      if (sanitizedItem[key] === null) {
        sanitizedItem[key] = '';
      }
    }

    // Strip HTML tags from text content fields
    const stripHtml = (html: string) => {
      if (!html) return '';
      return html
        .replace(/<\/p>\s*<p>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim();
    };
    if (sanitizedItem.content) sanitizedItem.content = stripHtml(sanitizedItem.content);
    if (sanitizedItem.personal_introduction) sanitizedItem.personal_introduction = stripHtml(sanitizedItem.personal_introduction);
    if (sanitizedItem.professional_summary) sanitizedItem.professional_summary = stripHtml(sanitizedItem.professional_summary);

    // Ensure arrays default to empty arrays
    const arrayFields = ['values', 'explorations', 'highlights'];
    arrayFields.forEach(field => {
      if (!sanitizedItem[field]) sanitizedItem[field] = [];
    });

    // Ensure JSON fields parse correctly
    if (typeof sanitizedItem.interests === 'string') {
      try { sanitizedItem.interests = JSON.parse(sanitizedItem.interests); } catch { sanitizedItem.interests = []; }
    }
    if (!Array.isArray(sanitizedItem.interests)) sanitizedItem.interests = [];

    if (typeof sanitizedItem.statistics === 'string') {
      try { sanitizedItem.statistics = JSON.parse(sanitizedItem.statistics); } catch { sanitizedItem.statistics = []; }
    }
    if (!Array.isArray(sanitizedItem.statistics)) sanitizedItem.statistics = [];

    skipNextAutoSave.current = true;
    setFormData({ ...initialFormState, ...sanitizedItem });
    setEditId(item.id);
    setCurrentStatus(item.status || 'draft');
  };

  const handleArrayChange = (key: string, index: number, field: string, value: any) => {
    const newArray = [...formData[key]];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData({ ...formData, [key]: newArray });
  };

  const addArrayItem = (key: string, template: any) => {
    setFormData({ ...formData, [key]: [...formData[key], template] });
  };

  const removeArrayItem = (key: string, index: number) => {
    const newArray = formData[key].filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, [key]: newArray });
  };

  // Simple array helpers for interests (string[])
  const addInterest = () => {
    setFormData({ ...formData, interests: [...(formData.interests || []), ''] });
  };
  const updateInterest = (index: number, value: string) => {
    const newInterests = [...(formData.interests || [])];
    newInterests[index] = value;
    setFormData({ ...formData, interests: newInterests });
  };
  const removeInterest = (index: number) => {
    const newInterests = (formData.interests || []).filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, interests: newInterests });
  };

  // Simple array helpers for statistics ({ label, value }[])
  const addStatistic = () => {
    setFormData({ ...formData, statistics: [...(formData.statistics || []), { label: '', value: '' }] });
  };
  const updateStatistic = (index: number, field: string, value: string) => {
    const newStats = [...(formData.statistics || [])];
    newStats[index] = { ...newStats[index], [field]: value };
    setFormData({ ...formData, statistics: newStats });
  };
  const removeStatistic = (index: number) => {
    const newStats = (formData.statistics || []).filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, statistics: newStats });
  };

  const handleInterestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === (formData.interests?.length || 0) - 1) {
        addInterest();
        setTimeout(() => {
          const inputs = document.querySelectorAll('input[data-interest-input="true"]');
          const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
          if (lastInput) lastInput.focus();
        }, 50);
      }
    }
  };

  const handleStatisticKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === (formData.statistics?.length || 0) - 1) {
        addStatistic();
        setTimeout(() => {
          const inputs = document.querySelectorAll('input[data-statistic-input="true"]');
          const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
          if (lastInput) lastInput.focus();
        }, 50);
      }
    }
  };

  const tabs = [
    { id: 'general', label: 'General & Profile' },
    { id: 'narrative', label: 'Narrative' },
    { id: 'lists', label: 'Values, Milestones & Lists' }
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8 whitespace-nowrap">About Page Management</h1>

      <div className="bg-gray-800 rounded-lg mb-12 border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Edit About Page</h2>
        </div>

        <div className="flex border-b border-gray-700 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-primary/20 text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white hover:bg-gray-750'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="p-6 space-y-6">

          {/* GENERAL & PROFILE TAB */}
          <div className={activeTab === 'general' ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm mb-1 text-gray-400">Your Name</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">Professional Title</label>
                <input type="text" value={formData.professional_title} onChange={e => setFormData({ ...formData, professional_title: e.target.value })} placeholder="e.g. Biomedical Engineer | Software Developer | UX/UI Designer" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none" />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm mb-1 text-gray-400">Profile Photograph</label>
              <div className="flex gap-2 items-center">
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="w-10 h-10 rounded object-cover border border-gray-700 bg-gray-800 shrink-0" />
                )}
                <input type="text" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none" />
                <label className="cursor-pointer bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors whitespace-nowrap flex items-center justify-center shrink-0">
                  {uploadingImage === 'image_url' ? 'Uploading...' : 'Upload'}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'image_url')} />
                </label>
              </div>
            </div>
          </div>

          {/* NARRATIVE TAB */}
          <div className={activeTab === 'narrative' ? 'block' : 'hidden'}>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold border-b border-gray-700 pb-2 mb-4 text-white">Personal Introduction</h3>
                <textarea rows={6} value={formData.personal_introduction} onChange={e => setFormData({ ...formData, personal_introduction: e.target.value })} placeholder="Tell your story — who you are, your background, interests, and goals..." className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none"></textarea>
              </div>
              <div>
                <h3 className="text-lg font-bold border-b border-gray-700 pb-2 mb-4 text-white">Professional Summary</h3>
                <textarea rows={6} value={formData.professional_summary} onChange={e => setFormData({ ...formData, professional_summary: e.target.value })} placeholder="Your professional identity — years of experience, industries, specializations, achievements..." className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none"></textarea>
              </div>
              <div>
                <h3 className="text-lg font-bold border-b border-gray-700 pb-2 mb-4 text-white">Mission Statement</h3>
                <textarea rows={3} value={formData.mission_statement} onChange={e => setFormData({ ...formData, mission_statement: e.target.value })} placeholder="e.g. To develop innovative, accessible, and impactful solutions that empower individuals..." className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none"></textarea>
              </div>
              <div>
                <h3 className="text-lg font-bold border-b border-gray-700 pb-2 mb-4 text-white">Vision Statement</h3>
                <textarea rows={3} value={formData.vision_statement} onChange={e => setFormData({ ...formData, vision_statement: e.target.value })} placeholder="e.g. To become a leading innovator who bridges healthcare, technology, and entrepreneurship..." className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none"></textarea>
              </div>
            </div>
          </div>

          {/* LISTS TAB */}
          <div className={activeTab === 'lists' ? 'block' : 'hidden'}>
            <div className="space-y-12">

              {/* Values */}
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                  <h3 className="text-lg font-bold text-white">Core Values</h3>
                  <button type="button" onClick={() => addArrayItem('values', { title: '', description: '', icon_name: '' })} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">Add Value</button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {formData.values?.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 items-start bg-gray-900 p-4 rounded border border-gray-700">
                      <div className="flex-1 space-y-2">
                        <input placeholder="Value Title" value={item.title} onChange={e => handleArrayChange('values', i, 'title', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:border-primary focus:outline-none" />
                        <textarea placeholder="Description" rows={2} value={item.description} onChange={e => handleArrayChange('values', i, 'description', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:border-primary focus:outline-none"></textarea>
                      </div>
                      <button type="button" onClick={() => removeArrayItem('values', i)} className="text-red-400 hover:text-red-300">X</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Milestones */}
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                  <h3 className="text-lg font-bold text-white">Key Milestones</h3>
                  <button type="button" onClick={() => addArrayItem('highlights', { title: '', date: '', description: '' })} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">Add Milestone</button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {formData.highlights?.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 items-start bg-gray-900 p-4 rounded border border-gray-700">
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <input placeholder="Date / Year" value={item.date} onChange={e => handleArrayChange('highlights', i, 'date', e.target.value)} className="w-1/3 bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:border-primary focus:outline-none" />
                          <input placeholder="Title" value={item.title} onChange={e => handleArrayChange('highlights', i, 'title', e.target.value)} className="w-2/3 bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:border-primary focus:outline-none" />
                        </div>
                        <textarea placeholder="Description" rows={2} value={item.description} onChange={e => handleArrayChange('highlights', i, 'description', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:border-primary focus:outline-none"></textarea>
                      </div>
                      <button type="button" onClick={() => removeArrayItem('highlights', i)} className="text-red-400 hover:text-red-300">X</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Currently Exploring */}
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                  <h3 className="text-lg font-bold text-white">Currently Exploring</h3>
                  <button type="button" onClick={() => addArrayItem('explorations', { category: '', title: '', link_url: '' })} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">Add Item</button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {formData.explorations?.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 items-center bg-gray-900 p-4 rounded border border-gray-700">
                      <input placeholder="Category (e.g. Learning)" value={item.category} onChange={e => handleArrayChange('explorations', i, 'category', e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:border-primary focus:outline-none" />
                      <input placeholder="Title / Name" value={item.title} onChange={e => handleArrayChange('explorations', i, 'title', e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:border-primary focus:outline-none" />
                      <input placeholder="Optional Link URL" value={item.link_url} onChange={e => handleArrayChange('explorations', i, 'link_url', e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:border-primary focus:outline-none" />
                      <button type="button" onClick={() => removeArrayItem('explorations', i)} className="text-red-400 hover:text-red-300">X</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Interests */}
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                  <h3 className="text-lg font-bold text-white">Personal Interests</h3>
                  <button type="button" onClick={addInterest} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">Add Interest</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(formData.interests || []).map((interest: string, i: number) => (
                    <div key={i} className="flex gap-2 items-center bg-gray-900 p-3 rounded border border-gray-700">
                      <input value={interest} onChange={e => updateInterest(i, e.target.value)} onKeyDown={e => handleInterestKeyDown(e, i)} data-interest-input="true" placeholder="e.g. Reading, Research, Volunteering" className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:border-primary focus:outline-none" />
                      <button type="button" onClick={() => removeInterest(i)} className="text-red-400 hover:text-red-300 text-sm">X</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                  <h3 className="text-lg font-bold text-white">Statistics / Impact Numbers</h3>
                  <button type="button" onClick={addStatistic} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">Add Statistic</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(formData.statistics || []).map((stat: any, i: number) => (
                    <div key={i} className="flex gap-3 items-center bg-gray-900 p-4 rounded border border-gray-700">
                      <input value={stat.value} onChange={e => updateStatistic(i, 'value', e.target.value)} onKeyDown={e => handleStatisticKeyDown(e, i)} data-statistic-input="true" placeholder="e.g. 25+" className="w-24 bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:border-primary focus:outline-none text-center font-bold" />
                      <input value={stat.label} onChange={e => updateStatistic(i, 'label', e.target.value)} onKeyDown={e => handleStatisticKeyDown(e, i)} data-statistic-input="true" placeholder="e.g. Projects Completed" className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:border-primary focus:outline-none" />
                      <button type="button" onClick={() => removeStatistic(i)} className="text-red-400 hover:text-red-300 text-sm">X</button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="pt-6 border-t border-gray-700 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-400">Current Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${currentStatus === 'published' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                currentStatus === 'archived' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                {currentStatus === 'published' ? '● Published' : currentStatus === 'archived' ? '● Archived' : '● Draft'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {currentStatus !== 'published' && (
                <button type="button" onClick={handlePublish} className="px-6 py-3 bg-green-600 rounded font-bold text-white hover:bg-green-500 transition-colors w-full sm:w-auto">
                  ✓ Publish
                </button>
              )}
              {currentStatus === 'published' && (
                <button type="button" onClick={handlePublish} className="px-6 py-3 bg-primary rounded font-bold text-white hover:bg-blue-600 transition-colors w-full sm:w-auto">
                  ↻ Update & Republish
                </button>
              )}
              {currentStatus !== 'archived' && editId && (
                <button type="button" onClick={handleArchive} className="px-6 py-3 bg-yellow-600/20 border border-yellow-600/40 rounded font-bold text-yellow-400 hover:bg-yellow-600/30 transition-colors w-full sm:w-auto">
                  Archive
                </button>
              )}
              {currentStatus === 'archived' && (
                <span className="text-sm text-gray-500 self-center">This section is hidden from the public site. Publish it to make it visible again.</span>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
