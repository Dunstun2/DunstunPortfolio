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

  const refreshKey = useRealtimeRefresh('about', isLoaded);

  const initialFormState = {
    title: '', content: '', image_url: '',
    hero_title: '', hero_image_url: '',
    story_title: '', story_content: '',
    philosophy_title: '', philosophy_statement: '', philosophy_description: '',
    vision_title: '', vision_statement: '', vision_description: '',
    drive_title: '', drive_statement: '', drive_description: '', drive_image_url: '',
    identity_cards: [], values: [], explorations: [], highlights: []
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
    Promise.all([
      fetchApi('/about').then(res => {
        return { data: res.data && res.data.length > 0 ? res.data[0] : null };
      }),
      fetchApi('/hero/published').catch(err => {
        console.warn('Could not fetch hero data:', err);
        return { data: null };
      })
    ]).then(([aboutRes, heroRes]) => {
      if (aboutRes.data) {
        startEdit(aboutRes.data, heroRes.data);
      }
      setIsLoaded(true);
    }).catch(err => {
      console.error(err);
      setIsLoaded(true);
    });
  };

  useEffect(() => { loadData(); }, [refreshKey]);

  const saveData = async (publish: boolean, dataToSave: any) => {
    // Clean temporary isHeroTitle flags before sending to database
    const cleanedCards = (dataToSave.identity_cards || []).map(({ isHeroTitle, ...card }: any) => card);
    const cleanedFormData = { ...dataToSave, identity_cards: cleanedCards };
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

  const startEdit = (item: any, heroData?: any) => {
    const sanitizedItem = { ...item };

    // Replace nulls with empty strings to prevent React uncontrolled input warnings
    for (const key in sanitizedItem) {
      if (sanitizedItem[key] === null) {
        sanitizedItem[key] = '';
      }
    }

    // Ensure arrays default to empty arrays
    const arrayFields = ['identity_cards', 'values', 'explorations', 'highlights'];
    arrayFields.forEach(field => {
      if (!sanitizedItem[field]) sanitizedItem[field] = [];
    });

    // Merge hero professional titles
    const heroTitles = heroData?.professional_title
      ? heroData.professional_title.split('|').map((t: string) => t.trim()).filter(Boolean)
      : [];

    const existingCards = [...sanitizedItem.identity_cards];
    const mergedCards: any[] = [];

    heroTitles.forEach((title: string) => {
      const matchIndex = existingCards.findIndex((c: any) => c.title.toLowerCase() === title.toLowerCase());
      if (matchIndex > -1) {
        mergedCards.push({ ...existingCards[matchIndex], isHeroTitle: true, title: title }); // Force casing
        existingCards.splice(matchIndex, 1);
      } else {
        mergedCards.push({ title, description: '', icon_name: '', isHeroTitle: true });
      }
    });

    existingCards.forEach((c: any) => {
      mergedCards.push({ ...c, isHeroTitle: false });
    });

    sanitizedItem.identity_cards = mergedCards;

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

  const tabs = [
    { id: 'general', label: 'General & Hero' },
    { id: 'story', label: 'Story & Narrative' },
    { id: 'philosophy', label: 'Philosophy & Drive' },
    { id: 'vision', label: 'Vision' },
    { id: 'lists', label: 'Cards & Lists' }
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

          {/* GENERAL TAB */}
          <div className={activeTab === 'general' ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm mb-1 text-gray-400">Profile Image URL (Home section)</label>
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
            <h3 className="text-lg font-bold border-b border-gray-700 pb-2 mb-4 text-white">Full Page Hero</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-1 text-gray-400">Hero Title</label>
                <input type="text" value={formData.hero_title} onChange={e => setFormData({ ...formData, hero_title: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">Hero Media URL (Image or Video Background)</label>
                <div className="flex gap-2 items-center">
                  {formData.hero_image_url && formData.hero_image_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) && (
                    <img src={formData.hero_image_url} alt="Preview" className="w-10 h-10 rounded object-cover border border-gray-700 bg-gray-800 shrink-0" />
                  )}
                  <input type="text" value={formData.hero_image_url} onChange={e => setFormData({ ...formData, hero_image_url: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none" />
                  <label className="cursor-pointer bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors whitespace-nowrap flex items-center justify-center shrink-0">
                    {uploadingImage === 'hero_image_url' ? 'Uploading...' : 'Upload'}
                    <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleImageUpload(e, 'hero_image_url')} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* STORY TAB */}
          <div className={activeTab === 'story' ? 'block' : 'hidden'}>
            <div className="mb-6">
              <label className="block text-sm mb-1 text-gray-400">Intro Content</label>
              <textarea required rows={5} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none"></textarea>
            </div>
            <h3 className="text-lg font-bold border-b border-gray-700 pb-2 mb-4 text-white">My Story / Journey</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-400">Story Title</label>
                <input type="text" value={formData.story_title} onChange={e => setFormData({ ...formData, story_title: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">Story Content</label>
                <textarea rows={8} value={formData.story_content} onChange={e => setFormData({ ...formData, story_content: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none"></textarea>
              </div>
            </div>
          </div>

          {/* PHILOSOPHY TAB */}
          <div className={activeTab === 'philosophy' ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold border-b border-gray-700 pb-2 mb-4 text-white">My Philosophy</h3>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Title</label>
                  <input type="text" value={formData.philosophy_title} onChange={e => setFormData({ ...formData, philosophy_title: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Statement</label>
                  <textarea rows={3} value={formData.philosophy_statement} onChange={e => setFormData({ ...formData, philosophy_statement: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Description</label>
                  <textarea rows={5} value={formData.philosophy_description} onChange={e => setFormData({ ...formData, philosophy_description: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none"></textarea>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold border-b border-gray-700 pb-2 mb-4 text-white">What Drives Me</h3>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Title</label>
                  <input type="text" value={formData.drive_title} onChange={e => setFormData({ ...formData, drive_title: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Statement</label>
                  <textarea rows={3} value={formData.drive_statement} onChange={e => setFormData({ ...formData, drive_statement: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Description</label>
                  <textarea rows={5} value={formData.drive_description} onChange={e => setFormData({ ...formData, drive_description: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Drive Image URL</label>
                  <div className="flex gap-2 items-center">
                    {formData.drive_image_url && (
                      <img src={formData.drive_image_url} alt="Preview" className="w-10 h-10 rounded object-cover border border-gray-700 bg-gray-800 shrink-0" />
                    )}
                    <input type="text" value={formData.drive_image_url} onChange={e => setFormData({ ...formData, drive_image_url: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none" />
                    <label className="cursor-pointer bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors whitespace-nowrap flex items-center justify-center shrink-0">
                      {uploadingImage === 'drive_image_url' ? 'Uploading...' : 'Upload'}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'drive_image_url')} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VISION TAB */}
          <div className={activeTab === 'vision' ? 'block' : 'hidden'}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-400">Vision Title</label>
                <input type="text" value={formData.vision_title} onChange={e => setFormData({ ...formData, vision_title: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">Vision Statement</label>
                <textarea rows={3} value={formData.vision_statement} onChange={e => setFormData({ ...formData, vision_statement: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none"></textarea>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">Vision Description</label>
                <textarea rows={5} value={formData.vision_description} onChange={e => setFormData({ ...formData, vision_description: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:outline-none"></textarea>
              </div>
            </div>
          </div>

          {/* LISTS TAB */}
          <div className={activeTab === 'lists' ? 'block' : 'hidden'}>
            <div className="space-y-12">

              {/* Identity Cards */}
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                  <h3 className="text-lg font-bold text-white">Who I Am (Cards)</h3>
                  <button type="button" onClick={() => addArrayItem('identity_cards', { title: '', description: '', icon_name: '' })} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">Add Card</button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {formData.identity_cards?.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 items-start bg-gray-900 p-4 rounded border border-gray-700">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            placeholder="Title"
                            value={item.title}
                            onChange={e => handleArrayChange('identity_cards', i, 'title', e.target.value)}
                            disabled={item.isHeroTitle}
                            className={`w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:border-primary focus:outline-none ${item.isHeroTitle ? 'bg-gray-950/50 text-gray-500 cursor-not-allowed border-dashed' : ''}`}
                          />
                          {item.isHeroTitle && (
                            <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-1 rounded whitespace-nowrap">
                              Synced from Hero
                            </span>
                          )}
                        </div>
                        <textarea placeholder="Description" rows={2} value={item.description} onChange={e => handleArrayChange('identity_cards', i, 'description', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm focus:border-primary focus:outline-none"></textarea>
                      </div>
                      {!item.isHeroTitle ? (
                        <button type="button" onClick={() => removeArrayItem('identity_cards', i)} className="text-red-400 hover:text-red-300 self-center">X</button>
                      ) : (
                        <div className="w-6 h-6 flex items-center justify-center text-gray-650 cursor-not-allowed self-center" title="Synced Hero titles cannot be deleted from here">🔒</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Values */}
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                  <h3 className="text-lg font-bold text-white">My Values</h3>
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

              {/* Explorations */}
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

              {/* Highlights Timeline */}
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                  <h3 className="text-lg font-bold text-white">Story Timeline (Highlights)</h3>
                  <button type="button" onClick={() => addArrayItem('highlights', { title: '', date: '', description: '' })} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">Add Highlight</button>
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
