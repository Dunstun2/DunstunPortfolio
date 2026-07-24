'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';

const PRESET_INSTITUTION_TYPES = ['University', 'College', 'High School', 'Technical Institute', 'Bootcamp', 'Other'];

export default function AdminEducation() {
  const refreshKey = useRealtimeRefresh('education');
  const [items, setItems] = useState<any[]>([]);

  const initialForm = {
    // Basic Info
    degree: '', institution: '', institution_logo: '', institution_type: '', 
    field_of_study: '', specialization: '', faculty: '', department: '',
    
    // Duration
    start_date: '', end_date: '', is_current: false, expected_graduation: '',
    
    // Performance
    grade: '', gpa: '', honors: '',
    
    // Description
    short_summary: '', full_description: '',
    
    // Relations & Lists
    coursework: [] as string[], related_projects: [] as string[], 
    achievements: [] as string[], activities: [] as string[], 
    certifications: [] as string[], external_links: [] as string[],
    media: [] as string[],
    
    // Research
    research_title: '', research_description: '', research_supervisor: '', research_link: '',
    
    // Publishing & SEO
    status: 'draft', featured: false, seo_title: '', seo_description: '', seo_image: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  // Institution Type
  const isOtherInstitutionType = !PRESET_INSTITUTION_TYPES.includes(formData.institution_type) && formData.institution_type !== '';
  const [institutionTypeSelectVal, setInstitutionTypeSelectVal] = useState('');

  // Temp states for arrays
  const [tempCoursework, setTempCoursework] = useState('');
  const [tempProject, setTempProject] = useState('');
  const [tempAchievement, setTempAchievement] = useState('');
  const [tempActivity, setTempActivity] = useState('');
  const [tempCertification, setTempCertification] = useState('');
  const [tempLink, setTempLink] = useState('');

  // Autosave state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isDraft, setIsDraft] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const editIdRef = useRef(editId);
  const isEditingRef = useRef(isEditing);
  editIdRef.current = editId;
  isEditingRef.current = isEditing;

  const loadData = () => {
    fetchApi('/education').then(res => setItems(res.data)).catch(console.error);
  };

  useEffect(() => { loadData(); }, [refreshKey]);

  // ─── Autosave logic ─────────────────────
  const doAutosave = useCallback(async (data: typeof initialForm, id: string, editing: boolean) => {
    const hasAnyData = (
      data.degree || data.institution || data.field_of_study || data.specialization ||
      data.faculty || data.department || data.start_date || data.end_date ||
      data.expected_graduation || data.grade || data.gpa || data.honors ||
      data.short_summary || data.full_description || data.research_title ||
      data.coursework.length || data.related_projects.length || data.achievements.length ||
      data.activities.length || data.certifications.length || data.external_links.length
    );
    if (!hasAnyData) return;

    setSaveStatus('saving');
    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        ...data,
        degree: data.degree || '(Draft)',
        institution: data.institution || '(Draft)',
        field_of_study: data.field_of_study || '(Draft)',
        start_date: data.start_date || today,
        end_date: data.is_current ? null : data.end_date,
      };

      if (editing && id) {
        await fetchApi(`/education/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        if (data.degree && data.degree !== '(Draft)' && data.institution && data.institution !== '(Draft)' && data.field_of_study && data.field_of_study !== '(Draft)') {
          setIsDraft(false);
        }
      } else {
        const res = await fetchApi('/education', { method: 'POST', body: JSON.stringify(payload) });
        const newId = res.data?.id;
        if (newId) {
          setIsEditing(true);
          setEditId(newId);
          setIsDraft(true);
        }
      }
      setSaveStatus('saved');
      loadData();
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, []);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      doAutosave(formData, editIdRef.current, isEditingRef.current);
    }, 1500);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [formData, doAutosave]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData, end_date: formData.is_current ? null : formData.end_date };
      if (isEditing) {
        await fetchApi(`/education/${editId}`, { method: 'PUT', body: JSON.stringify(dataToSubmit) });
      } else {
        await fetchApi('/education', { method: 'POST', body: JSON.stringify(dataToSubmit) });
      }
      resetForm();
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetchApi(`/education/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) { console.error(err); }
  };

  const startEdit = (item: any) => {
    const instType = item.institution_type || '';
    setInstitutionTypeSelectVal(PRESET_INSTITUTION_TYPES.includes(instType) ? instType : instType ? 'Other' : '');
    
    const isDraftRecord = item.degree === '(Draft)' || item.institution === '(Draft)' || item.field_of_study === '(Draft)';
    setIsDraft(isDraftRecord);
    
    setFormData({
      degree: isDraftRecord && item.degree === '(Draft)' ? '' : (item.degree || ''),
      institution: isDraftRecord && item.institution === '(Draft)' ? '' : (item.institution || ''),
      institution_logo: item.institution_logo || '',
      institution_type: item.institution_type || '',
      field_of_study: isDraftRecord && item.field_of_study === '(Draft)' ? '' : (item.field_of_study || ''),
      specialization: item.specialization || '',
      faculty: item.faculty || '',
      department: item.department || '',
      start_date: item.start_date ? item.start_date.split('T')[0] : '',
      end_date: item.end_date ? item.end_date.split('T')[0] : '',
      is_current: item.is_current || false,
      expected_graduation: item.expected_graduation ? item.expected_graduation.split('T')[0] : '',
      grade: item.grade || '', gpa: item.gpa || '', honors: item.honors || '',
      short_summary: item.short_summary || '', full_description: item.full_description || '',
      coursework: item.coursework || [], related_projects: item.related_projects || [],
      achievements: item.achievements || [], activities: item.activities || [],
      certifications: item.certifications || [], external_links: item.external_links || [],
      media: item.media || [],
      research_title: item.research_title || '', research_description: item.research_description || '',
      research_supervisor: item.research_supervisor || '', research_link: item.research_link || '',
      status: item.status || 'draft', featured: item.featured || false,
      seo_title: item.seo_title || '', seo_description: item.seo_description || '', seo_image: item.seo_image || ''
    });
    
    isFirstRender.current = true;
    setIsEditing(true);
    setEditId(item.id);
    setActiveTab('basic');
    setTimeout(() => { isFirstRender.current = false; }, 200);
  };

  const resetForm = () => {
    isFirstRender.current = true;
    setFormData(initialForm);
    setInstitutionTypeSelectVal('');
    setIsEditing(false);
    setEditId('');
    setIsDraft(false);
    setActiveTab('basic');
    setSaveStatus('idle');
    setTimeout(() => { isFirstRender.current = false; }, 200);
  };

  const addArrayItem = (field: keyof typeof initialForm, value: string, setter: any) => {
    if (!value.trim()) return;
    setFormData(prev => ({ ...prev, [field]: [...(prev[field] as string[]), value.trim()] }));
    setter('');
  };

  const removeArrayItem = (field: keyof typeof initialForm, index: number) => {
    setFormData(prev => {
      const newArr = [...(prev[field] as string[])];
      newArr.splice(index, 1);
      return { ...prev, [field]: newArr };
    });
  };

  const SaveIndicator = () => {
    const statusStyles: Record<string, string> = {
      saving: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      saved:  'bg-green-500/20 text-green-400 border-green-500/40',
      error:  'bg-red-500/20 text-red-400 border-red-500/40',
    };
    const statusLabels: Record<string, string> = {
      saving: '⟳ Autosaving…',
      saved:  '✓ Draft saved',
      error:  '✕ Save failed',
    };
    return (
      <div className="flex items-center gap-2">
        {isDraft && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Unsaved Draft
          </span>
        )}
        {saveStatus !== 'idle' && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${statusStyles[saveStatus]}`}>
            {statusLabels[saveStatus]}
          </span>
        )}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8 whitespace-nowrap">Education Management</h1>

      <div className="bg-gray-800 rounded-lg mb-12 border border-gray-700 overflow-hidden">
        <div className="bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{isEditing ? 'Edit Education' : 'Add New Education'}</h2>
            <SaveIndicator />
          </div>
          {isEditing && <button onClick={resetForm} className="text-sm text-gray-400 hover:text-white">Cancel Edit</button>}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-800/50 overflow-x-auto">
          {['basic', 'duration_perf', 'description_res', 'relations', 'publishing'].map(tab => (
            <button
              key={tab}
              onClick={(e) => { e.preventDefault(); setActiveTab(tab); }}
              className={`px-4 py-3 whitespace-nowrap text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
            >
              {tab.replace('_', ' & ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6">

          {/* TAB: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm mb-1 text-gray-400">Qualification Level / Type *</label><input required type="text" placeholder="e.g. Bachelor's Degree, Diploma, Certificate" value={formData.degree} onChange={e => setFormData({ ...formData, degree: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
                <div><label className="block text-sm mb-1 text-gray-400">Institution Name *</label><input required type="text" value={formData.institution} onChange={e => setFormData({ ...formData, institution: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
                <div><label className="block text-sm mb-1 text-gray-400">Field of Study / Major *</label><input required type="text" value={formData.field_of_study} onChange={e => setFormData({ ...formData, field_of_study: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
                
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Institution Type</label>
                  <select
                    value={institutionTypeSelectVal}
                    onChange={e => {
                      const val = e.target.value;
                      setInstitutionTypeSelectVal(val);
                      if (val !== 'Other') setFormData({ ...formData, institution_type: val });
                      else setFormData({ ...formData, institution_type: '' });
                    }}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                  >
                    <option value="">Select…</option>
                    {PRESET_INSTITUTION_TYPES.map(t => <option key={t}>{t}</option>)}
                    <option value="Other">Other…</option>
                  </select>
                  {institutionTypeSelectVal === 'Other' && (
                    <input
                      type="text"
                      autoFocus
                      value={formData.institution_type}
                      onChange={e => setFormData({ ...formData, institution_type: e.target.value })}
                      placeholder="Specify institution type…"
                      className="w-full mt-2 bg-gray-900 border border-primary/50 rounded p-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  )}
                </div>

                <div><label className="block text-sm mb-1 text-gray-400">Specialization</label><input type="text" value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
                <div><label className="block text-sm mb-1 text-gray-400">Faculty / School</label><input type="text" value={formData.faculty} onChange={e => setFormData({ ...formData, faculty: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
                <div><label className="block text-sm mb-1 text-gray-400">Department</label><input type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
              </div>
            </div>
          )}

          {/* TAB: DURATION & PERFORMANCE */}
          {activeTab === 'duration_perf' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Study Duration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-1 text-gray-400">Start Date *</label>
                    <input required type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                    
                    <label className="flex items-center gap-2 mt-4 text-sm text-gray-300">
                      <input type="checkbox" checked={formData.is_current} onChange={e => setFormData({ ...formData, is_current: e.target.checked })} className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-primary" />
                      I am currently studying here
                    </label>
                  </div>

                  <div>
                    {!formData.is_current ? (
                      <div className="animate-fade-in">
                        <label className="block text-sm mb-1 text-gray-400">Graduation / End Date</label>
                        <input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
                      </div>
                    ) : (
                      <div className="animate-fade-in">
                        <label className="block text-sm mb-1 text-primary/80 font-semibold">Expected Graduation</label>
                        <input type="date" value={formData.expected_graduation} onChange={e => setFormData({ ...formData, expected_graduation: e.target.value })} className="w-full bg-gray-900 border border-primary/40 focus:border-primary rounded p-2 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-lg font-bold text-white mb-3">Academic Performance (Optional)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-sm mb-1 text-gray-400">Grade / Classification</label><input type="text" value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} placeholder="e.g. First Class" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
                  <div><label className="block text-sm mb-1 text-gray-400">GPA</label><input type="text" value={formData.gpa} onChange={e => setFormData({ ...formData, gpa: e.target.value })} placeholder="e.g. 3.8/4.0" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
                  <div><label className="block text-sm mb-1 text-gray-400">Honors</label><input type="text" value={formData.honors} onChange={e => setFormData({ ...formData, honors: e.target.value })} placeholder="e.g. Magna Cum Laude" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DESCRIPTION & RESEARCH */}
          {activeTab === 'description_res' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Description</h3>
                <div className="space-y-4">
                  <div><label className="block text-sm mb-1 text-gray-400">Short Summary</label><textarea rows={2} value={formData.short_summary} onChange={e => setFormData({ ...formData, short_summary: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="Brief description of studies..." /></div>
                  <div><label className="block text-sm mb-1 text-gray-400">Detailed Description</label><textarea rows={5} value={formData.full_description} onChange={e => setFormData({ ...formData, full_description: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="Longer explanation of the academic journey..." /></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-lg font-bold text-white mb-3">Thesis / Research (If applicable)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="block text-sm mb-1 text-gray-400">Research Title</label><input type="text" value={formData.research_title} onChange={e => setFormData({ ...formData, research_title: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
                  <div className="col-span-2"><label className="block text-sm mb-1 text-gray-400">Research Description</label><textarea rows={3} value={formData.research_description} onChange={e => setFormData({ ...formData, research_description: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
                  <div><label className="block text-sm mb-1 text-gray-400">Supervisor</label><input type="text" value={formData.research_supervisor} onChange={e => setFormData({ ...formData, research_supervisor: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
                  <div><label className="block text-sm mb-1 text-gray-400">Research Link</label><input type="text" value={formData.research_link} onChange={e => setFormData({ ...formData, research_link: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: RELATIONS & ACTIVITIES */}
          {activeTab === 'relations' && (
            <div className="space-y-6 animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm text-gray-400 mb-4">Add relevant items by typing and pressing Enter or clicking Add.</p>
              </div>

              {/* Coursework */}
              <div className="mt-0">
                <label className="block text-sm mb-1 text-gray-400">Key Subjects / Coursework</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={tempCoursework} onChange={e => setTempCoursework(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArrayItem('coursework', tempCoursework, setTempCoursework))} className="flex-grow bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm" placeholder="e.g. Data Structures" />
                  <button type="button" onClick={() => addArrayItem('coursework', tempCoursework, setTempCoursework)} className="px-3 bg-gray-700 hover:bg-gray-600 rounded font-bold text-sm">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.coursework.map((c, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs flex items-center gap-2">
                      {c} <button type="button" onClick={() => removeArrayItem('coursework', i)} className="text-red-400 hover:text-red-300">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div>
                <label className="block text-sm mb-1 text-gray-400">Activities & Involvement</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={tempActivity} onChange={e => setTempActivity(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArrayItem('activities', tempActivity, setTempActivity))} className="flex-grow bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm" placeholder="e.g. Debate Club" />
                  <button type="button" onClick={() => addArrayItem('activities', tempActivity, setTempActivity)} className="px-3 bg-gray-700 hover:bg-gray-600 rounded font-bold text-sm">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.activities.map((a, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs flex items-center gap-2">
                      {a} <button type="button" onClick={() => removeArrayItem('activities', i)} className="text-red-400 hover:text-red-300">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <label className="block text-sm mb-1 text-gray-400">Academic Achievements</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={tempAchievement} onChange={e => setTempAchievement(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArrayItem('achievements', tempAchievement, setTempAchievement))} className="flex-grow bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm" placeholder="e.g. Dean's List" />
                  <button type="button" onClick={() => addArrayItem('achievements', tempAchievement, setTempAchievement)} className="px-3 bg-gray-700 hover:bg-gray-600 rounded font-bold text-sm">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.achievements.map((a, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs flex items-center gap-2">
                      {a} <button type="button" onClick={() => removeArrayItem('achievements', i)} className="text-red-400 hover:text-red-300">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <label className="block text-sm mb-1 text-gray-400">Academic Projects</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={tempProject} onChange={e => setTempProject(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArrayItem('related_projects', tempProject, setTempProject))} className="flex-grow bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm" placeholder="e.g. AI Thesis Project" />
                  <button type="button" onClick={() => addArrayItem('related_projects', tempProject, setTempProject)} className="px-3 bg-gray-700 hover:bg-gray-600 rounded font-bold text-sm">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.related_projects.map((p, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs flex items-center gap-2">
                      {p} <button type="button" onClick={() => removeArrayItem('related_projects', i)} className="text-red-400 hover:text-red-300">×</button>
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Certifications */}
              <div>
                <label className="block text-sm mb-1 text-gray-400">Related Certifications</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={tempCertification} onChange={e => setTempCertification(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArrayItem('certifications', tempCertification, setTempCertification))} className="flex-grow bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm" placeholder="e.g. AWS Certified" />
                  <button type="button" onClick={() => addArrayItem('certifications', tempCertification, setTempCertification)} className="px-3 bg-gray-700 hover:bg-gray-600 rounded font-bold text-sm">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.certifications.map((c, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs flex items-center gap-2">
                      {c} <button type="button" onClick={() => removeArrayItem('certifications', i)} className="text-red-400 hover:text-red-300">×</button>
                    </span>
                  ))}
                </div>
              </div>
              
              {/* External Links */}
              <div>
                <label className="block text-sm mb-1 text-gray-400">External Links</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={tempLink} onChange={e => setTempLink(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArrayItem('external_links', tempLink, setTempLink))} className="flex-grow bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm" placeholder="https://..." />
                  <button type="button" onClick={() => addArrayItem('external_links', tempLink, setTempLink)} className="px-3 bg-gray-700 hover:bg-gray-600 rounded font-bold text-sm">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.external_links.map((l, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs flex items-center gap-2">
                      {l} <button type="button" onClick={() => removeArrayItem('external_links', i)} className="text-red-400 hover:text-red-300">×</button>
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB: PUBLISHING & SEO */}
          {activeTab === 'publishing' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Publishing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-400">Status</label>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white">
                      <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input type="checkbox" checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} className="w-4 h-4 rounded bg-gray-900 border-gray-700" />
                      Feature this education entry
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-lg font-bold text-white mb-3">SEO Details</h3>
                <div className="space-y-4">
                  <div><label className="block text-sm mb-1 text-gray-400">SEO Title</label><input type="text" value={formData.seo_title} onChange={e => setFormData({ ...formData, seo_title: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
                  <div><label className="block text-sm mb-1 text-gray-400">SEO Description</label><textarea rows={2} value={formData.seo_description} onChange={e => setFormData({ ...formData, seo_description: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
                </div>
              </div>

              {/* Submit Button Area */}
              <div className="pt-6 border-t border-gray-700 flex items-center gap-4">
                <button type="submit" className="px-8 py-2 bg-primary rounded font-bold hover:bg-blue-600 transition-colors">
                  {isEditing ? 'Save & Finalise' : 'Create Education'}
                </button>
                <SaveIndicator />
              </div>
            </div>
          )}

        </form>
      </div>

      {/* List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700 text-xs sm:text-sm text-gray-300">
                <th className="p-3 sm:p-4">Degree</th>
                <th className="p-3 sm:p-4">Institution</th>
                <th className="p-3 sm:p-4 hidden sm:table-cell">Status</th>
                <th className="p-3 sm:p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="p-3 sm:p-4 text-xs sm:text-sm">
                    <div className="font-bold text-primary">{item.degree}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{item.start_date} - {item.is_current ? 'Present' : item.end_date}</div>
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm">{item.institution}</td>
                  <td className="p-3 sm:p-4 hidden sm:table-cell">
                    <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded ${item.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/50 text-gray-400'}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => startEdit(item)} className="text-primary hover:underline font-medium">Edit</button>
                      <button type="button" onClick={() => handleDelete(item.id)} className="text-red-400 hover:underline font-medium">Delete</button>
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
