'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { API_BASE_URL, getFileUrl } from '@/utils/urls';

const DEFAULT_CATEGORIES = [
  'Software Development',
  'Web Applications',
  'Mobile Applications',
  'Biomedical Engineering',
  'Medical Technology',
  'Research',
  'Academic Projects',
  'Personal Projects',
  'Open Source',
  'Experiments',
];

const PROJECT_TYPES = [
  'Personal',
  'Academic',
  'Professional',
  'Client',
  'Open Source',
];

export default function AdminProjects() {
  const refreshKey = useRealtimeRefresh('projects', false);
  const [items, setItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'cover' | 'caseStudy' | 'features' | 'tech' | 'gallery' | 'challenges' | 'results'>('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [techInput, setTechInput] = useState('');

  const initialForm = {
    title: '',
    description: '',
    content: '',
    category: '',
    project_type: '',
    start_date: '',
    end_date: '',
    featured: false,
    thumbnail_url: '',
    problem: '',
    solution: '',
    my_role: '',
    responsibilities: '',
    team_size: '',
    technologies: [] as string[],
    features: [] as { name: string; description: string }[],
    screenshots: [] as { image_url: string; caption: string }[],
    challenges: [] as { challenge: string; solution: string }[],
    outcomes: '',
    lessons_learned: '',
    future_improvements: '',
  };

  const [formData, setFormData] = useState<any>(initialForm);

  const loadData = () => {
    fetchApi('/projects').then(res => setItems(res.data)).catch(console.error);
  };

  useEffect(() => { loadData(); }, [refreshKey]);

  const uploadFile = async (file: File): Promise<string> => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('folder', '/projects');
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/media`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: uploadData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const resData = await res.json();
    return getFileUrl(resData.data.file_path);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImage(true);
    try {
      const url = await uploadFile(e.target.files[0]);
      setFormData((prev: any) => ({ ...prev, thumbnail_url: url }));
    } catch (err) {
      alert('Failed to upload cover image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      const url = await uploadFile(e.target.files[0]);
      setFormData((prev: any) => {
        const list = [...prev.screenshots];
        list[index].image_url = url;
        return { ...prev, screenshots: list };
      });
    } catch (err) {
      alert('Failed to upload screenshot');
    } finally {
      e.target.value = '';
    }
  };

  const handleAddScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      const url = await uploadFile(e.target.files[0]);
      setFormData((prev: any) => ({
        ...prev,
        screenshots: [...prev.screenshots, { image_url: url, caption: '' }]
      }));
    } catch (err) {
      alert('Failed to upload screenshot');
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await fetchApi(`/projects/${editId}`, { method: 'PUT', body: JSON.stringify(formData) });
      } else {
        await fetchApi('/projects', { method: 'POST', body: JSON.stringify(formData) });
      }
      resetForm();
      loadData();
      alert(isEditing ? 'Project updated successfully!' : 'Project created successfully!');
    } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setEditId('');
    setActiveTab('basic');
  };

  const startEdit = (item: any) => {
    setFormData({
      title: item.title || '',
      description: item.description || '',
      content: item.content || '',
      category: item.category || '',
      project_type: item.project_type || '',
      start_date: item.start_date || '',
      end_date: item.end_date || '',
      featured: !!item.featured,
      thumbnail_url: item.thumbnail_url || '',
      problem: item.problem || '',
      solution: item.solution || '',
      my_role: item.my_role || '',
      responsibilities: item.responsibilities || '',
      team_size: item.team_size || '',
      technologies: Array.isArray(item.technologies) ? item.technologies : [],
      features: Array.isArray(item.features) ? item.features : [],
      screenshots: Array.isArray(item.screenshots) ? item.screenshots : [],
      challenges: Array.isArray(item.challenges) ? item.challenges : [],
      outcomes: item.outcomes || '',
      lessons_learned: item.lessons_learned || '',
      future_improvements: item.future_improvements || '',
    });
    setIsEditing(true);
    setEditId(item.id);
    setActiveTab('basic');
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetchApi(`/projects/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await fetchApi(`/projects/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) { console.error(err); }
  };

  // Helper Array Managers
  const addTech = () => {
    if (!techInput.trim()) return;
    if (!formData.technologies.includes(techInput.trim())) {
      setFormData({ ...formData, technologies: [...formData.technologies, techInput.trim()] });
    }
    setTechInput('');
  };

  const removeTech = (tech: string) => {
    setFormData({ ...formData, technologies: formData.technologies.filter((t: string) => t !== tech) });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, { name: '', description: '' }] });
  };

  const updateFeature = (index: number, field: 'name' | 'description', val: string) => {
    const list = [...formData.features];
    list[index][field] = val;
    setFormData({ ...formData, features: list });
  };

  const removeFeature = (index: number) => {
    setFormData({ ...formData, features: formData.features.filter((_: any, i: number) => i !== index) });
  };

  const addChallenge = () => {
    setFormData({ ...formData, challenges: [...formData.challenges, { challenge: '', solution: '' }] });
  };

  const updateChallenge = (index: number, field: 'challenge' | 'solution', val: string) => {
    const list = [...formData.challenges];
    list[index][field] = val;
    setFormData({ ...formData, challenges: list });
  };

  const removeChallenge = (index: number) => {
    setFormData({ ...formData, challenges: formData.challenges.filter((_: any, i: number) => i !== index) });
  };

  const removeScreenshot = (index: number) => {
    setFormData({ ...formData, screenshots: formData.screenshots.filter((_: any, i: number) => i !== index) });
  };

  const updateScreenshotCaption = (index: number, caption: string) => {
    const list = [...formData.screenshots];
    list[index].caption = caption;
    setFormData({ ...formData, screenshots: list });
  };

  return (
    <div className="pb-16">
      <h1 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8 whitespace-nowrap">Projects Management</h1>

      {/* CMS Form Card */}
      <div className="bg-gray-800 p-6 rounded-2xl mb-12 border border-gray-700 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{isEditing ? 'Edit Project Case Study' : 'Create New Project Case Study'}</h2>
          {isEditing && (
            <button onClick={resetForm} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg text-gray-300">
              Cancel Editing
            </button>
          )}
        </div>

        {/* Form Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-700 pb-3 mb-6 overflow-x-auto scrollbar-thin">
          {[
            { id: 'basic', label: '📝 Basic Info' },
            { id: 'cover', label: '🖼️ Cover Image' },
            { id: 'caseStudy', label: '📄 Case Study' },
            { id: 'features', label: '⭐ Features' },
            { id: 'tech', label: '🛠️ Technologies' },
            { id: 'gallery', label: '📸 Screenshots' },
            { id: 'challenges', label: '💡 Challenges' },
            { id: 'results', label: '📈 Results & Impact' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-900/60 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-300">Project Title *</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="e.g. Prosthetic Knee Simulator" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-300">Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary">
                    <option value="">Select Category...</option>
                    {DEFAULT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-300">Project Type</label>
                  <select value={formData.project_type} onChange={e => setFormData({ ...formData, project_type: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary">
                    <option value="">Select Project Type...</option>
                    {PROJECT_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-300">Start Date</label>
                  <input type="text" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="e.g. Jan 2023" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-300">End Date</label>
                  <input type="text" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="e.g. Dec 2023 or Present" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-300">Short Description *</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="Brief summary displayed on project cards..."></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="featured" checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} className="w-5 h-5 rounded bg-gray-900 border-gray-700 text-primary focus:ring-primary" />
                <label htmlFor="featured" className="text-sm font-semibold text-gray-200 cursor-pointer">Mark as Featured Project</label>
              </div>
            </div>
          )}

          {/* TAB 2: COVER IMAGE */}
          {activeTab === 'cover' && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold mb-1 text-gray-300">Cover Image</label>
              <div className="flex items-center gap-4">
                <label className={`px-5 py-2.5 rounded-xl font-bold cursor-pointer transition-colors ${uploadingImage ? 'bg-gray-600 cursor-wait' : 'bg-primary hover:bg-blue-600'}`}>
                  {uploadingImage ? 'Uploading...' : '📁 Upload Cover Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingImage} />
                </label>
                <span className="text-gray-400 text-sm">or enter URL below</span>
              </div>
              <input type="text" value={formData.thumbnail_url} onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="https://..." />
              {formData.thumbnail_url && (
                <div className="relative w-72 h-44 rounded-xl overflow-hidden border border-gray-700 mt-2">
                  <img src={formData.thumbnail_url} alt="Cover Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setFormData({ ...formData, thumbnail_url: '' })} className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold hover:bg-red-700">✕</button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CASE STUDY */}
          {activeTab === 'caseStudy' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-300">My Role</label>
                  <input type="text" value={formData.my_role} onChange={e => setFormData({ ...formData, my_role: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="e.g. Lead Engineer & Developer" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-300">Team Size / Structure</label>
                  <input type="text" value={formData.team_size} onChange={e => setFormData({ ...formData, team_size: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="e.g. Solo Project or 4 Engineers" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-300">Responsibilities</label>
                <textarea rows={3} value={formData.responsibilities} onChange={e => setFormData({ ...formData, responsibilities: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="Key responsibilities handled during this project..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-300">The Problem</label>
                <textarea rows={3} value={formData.problem} onChange={e => setFormData({ ...formData, problem: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="What challenge or problem was this project built to solve?"></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-300">The Solution</label>
                <textarea rows={3} value={formData.solution} onChange={e => setFormData({ ...formData, solution: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="How did your implementation solve the problem?"></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-300">Full Overview / Detailed Write-up</label>
                <textarea rows={4} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="Additional background or deep dive into the project..."></textarea>
              </div>
            </div>
          )}

          {/* TAB 4: FEATURES */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-300">Key Features</label>
                <button type="button" onClick={addFeature} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-blue-600">+ Add Feature</button>
              </div>
              {formData.features.map((feat: any, idx: number) => (
                <div key={idx} className="bg-gray-900 p-4 rounded-xl border border-gray-700 space-y-3 relative">
                  <button type="button" onClick={() => removeFeature(idx)} className="absolute top-3 right-3 text-red-400 hover:text-red-300 text-xs font-bold">Remove</button>
                  <input type="text" value={feat.name} onChange={e => updateFeature(idx, 'name', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-primary" placeholder="Feature Name (e.g. Real-time Telemetry)" />
                  <textarea rows={2} value={feat.description} onChange={e => updateFeature(idx, 'description', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-primary" placeholder="Feature description..."></textarea>
                </div>
              ))}
              {formData.features.length === 0 && <p className="text-gray-500 text-sm italic">No features added yet.</p>}
            </div>
          )}

          {/* TAB 5: TECHNOLOGIES */}
          {activeTab === 'tech' && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold mb-1 text-gray-300">Technologies Used</label>
              <div className="flex gap-3">
                <input type="text" value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }} className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="Add technology (e.g. React, Node.js, SolidWorks) and press Enter" />
                <button type="button" onClick={addTech} className="px-5 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600">Add</button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.technologies.map((t: string) => (
                  <span key={t} className="px-3 py-1.5 bg-secondary/20 text-secondary border border-secondary/30 rounded-xl text-sm font-semibold flex items-center gap-2">
                    {t}
                    <button type="button" onClick={() => removeTech(t)} className="text-gray-400 hover:text-white font-bold text-xs">✕</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SCREENSHOTS / GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-300">Screenshots & Media Gallery</label>
                <label className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-blue-600">
                  📁 Upload Screenshot
                  <input type="file" accept="image/*" className="hidden" onChange={handleAddScreenshot} />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.screenshots.map((s: any, idx: number) => (
                  <div key={idx} className="bg-gray-900 p-4 rounded-xl border border-gray-700 space-y-3">
                    <div className="h-36 rounded-lg overflow-hidden border border-gray-800 relative bg-black/20">
                      {s.image_url ? (
                        <img src={s.image_url} alt="Screenshot" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No image</div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeScreenshot(idx)}
                        className="absolute top-2 right-2 z-20 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold hover:bg-red-700 shadow-md"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 font-medium cursor-pointer">
                        Replace File
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleScreenshotUpload(e, idx)} />
                      </label>
                      <input type="text" value={s.caption} onChange={e => updateScreenshotCaption(idx, e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-primary" placeholder="Caption (e.g. Dashboard view)" />
                    </div>
                  </div>
                ))}
              </div>
              {formData.screenshots.length === 0 && <p className="text-gray-500 text-sm italic">No screenshots uploaded yet.</p>}
            </div>
          )}

          {/* TAB 7: CHALLENGES */}
          {activeTab === 'challenges' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-300">Challenges & Solutions</label>
                <button type="button" onClick={addChallenge} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-blue-600">+ Add Challenge Pair</button>
              </div>
              {formData.challenges.map((c: any, idx: number) => (
                <div key={idx} className="bg-gray-900 p-4 rounded-xl border border-gray-700 space-y-3 relative">
                  <button type="button" onClick={() => removeChallenge(idx)} className="absolute top-3 right-3 text-red-400 hover:text-red-300 text-xs font-bold">Remove</button>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Challenge Faced</label>
                    <textarea rows={2} value={c.challenge} onChange={e => updateChallenge(idx, 'challenge', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-primary" placeholder="Describe the technical or design hurdle..."></textarea>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Solution Applied</label>
                    <textarea rows={2} value={c.solution} onChange={e => updateChallenge(idx, 'solution', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-primary" placeholder="How you overcame it..."></textarea>
                  </div>
                </div>
              ))}
              {formData.challenges.length === 0 && <p className="text-gray-500 text-sm italic">No challenges recorded.</p>}
            </div>
          )}

          {/* TAB 8: RESULTS & IMPACT */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-300">Outcomes / Results & Impact</label>
                <textarea rows={3} value={formData.outcomes} onChange={e => setFormData({ ...formData, outcomes: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="What were the quantifiable results, launch status, or impact?"></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-300">Lessons Learned</label>
                <textarea rows={3} value={formData.lessons_learned} onChange={e => setFormData({ ...formData, lessons_learned: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="Key takeaways from this project..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-300">Future Improvements</label>
                <textarea rows={3} value={formData.future_improvements} onChange={e => setFormData({ ...formData, future_improvements: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="Planned features or next iterations..."></textarea>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <button type="submit" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg">
              {isEditing ? 'Save Changes' : 'Create Project'}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="px-6 py-3 bg-gray-700 text-gray-300 font-bold rounded-xl hover:bg-gray-600">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Projects Table */}
      <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700 text-xs sm:text-sm text-gray-300">
                <th className="p-3 sm:p-4 font-semibold">Title</th>
                <th className="p-3 sm:p-4 font-semibold hidden md:table-cell">Category</th>
                <th className="p-3 sm:p-4 font-semibold hidden sm:table-cell">Status</th>
                <th className="p-3 sm:p-4 font-semibold hidden lg:table-cell">Featured</th>
                <th className="p-3 sm:p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-700/50 hover:bg-gray-750">
                  <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-white">{item.title}</td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-400 hidden md:table-cell">{item.category || '—'}</td>
                  <td className="p-3 sm:p-4 hidden sm:table-cell">
                    <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-lg ${item.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm hidden lg:table-cell">
                    {item.featured ? <span className="text-yellow-400 font-bold">⭐ Featured</span> : <span className="text-gray-500">—</span>}
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm whitespace-nowrap">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {item.status !== 'published' ? (
                        <button onClick={() => handleStatusChange(item.id, 'published')} className="text-xs font-semibold text-green-400 hover:underline">Publish</button>
                      ) : (
                        <button onClick={() => handleStatusChange(item.id, 'draft')} className="text-xs font-semibold text-yellow-400 hover:underline">Unpublish</button>
                      )}
                      <button onClick={() => startEdit(item)} className="text-xs font-semibold text-primary hover:underline">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="text-xs font-semibold text-red-400 hover:underline">Delete</button>
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
