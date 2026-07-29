'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';

/** Inline searchable picker for available skills */
function SkillSearch({ availableSkills, selected, onToggle }: {
  availableSkills: any[];
  selected: string[];
  onToggle: (name: string) => void;
}) {
  const [query, setQuery] = useState('');
  const unselected = availableSkills.filter(
    s => !selected.includes(s.name) && s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search available skills…"
        className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
      />
      <div className="flex flex-wrap gap-2 pt-2 pb-1 max-h-36 overflow-y-auto">
        {unselected.length === 0 && (
          <span className="text-gray-600 text-xs italic">
            {availableSkills.length === 0 ? 'No skills in library yet' : 'All skills already selected'}
          </span>
        )}
        {unselected.map(skill => (
          <button
            key={skill.id}
            type="button"
            onClick={() => onToggle(skill.name)}
            className="px-3 py-1 rounded-full text-xs font-bold bg-gray-700 text-gray-300 hover:bg-primary hover:text-white transition-colors"
          >
            + {skill.name}
          </button>
        ))}
      </div>
    </div>
  );
}

const PRESET_EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];

export default function AdminExperience() {
  const refreshKey = useRealtimeRefresh('experience', false);
  const [items, setItems] = useState<any[]>([]);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);

  const initialForm = {
    company: '', company_logo: '', position: '', employment_type: '', location: '', work_mode: '', department: '', industry: '',
    start_date: '', end_date: '', is_current: false,
    short_summary: '', full_description: '', responsibilities: [] as string[], achievements: [] as string[], key_contributions: [] as string[],
    associated_skills: [] as string[], related_projects: [] as string[],
    media: [] as string[], company_website: '', external_links: [] as any[],
    status: 'draft', featured: false
  };

  const [formData, setFormData] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  // "Other" employment type custom input
  const isOtherEmployment = !PRESET_EMPLOYMENT_TYPES.includes(formData.employment_type) && formData.employment_type !== '';
  const [employmentSelectVal, setEmploymentSelectVal] = useState('');

  const [tempResponsibility, setTempResponsibility] = useState('');
  const [tempAchievement, setTempAchievement] = useState('');
  const [tempProject, setTempProject] = useState('');

  // Autosave state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isDraft, setIsDraft] = useState(false); // true = auto-created draft, not yet finalised
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const editIdRef = useRef(editId);
  const isEditingRef = useRef(isEditing);
  editIdRef.current = editId;
  isEditingRef.current = isEditing;

  const loadData = () => {
    fetchApi('/experience').then(res => setItems(res.data)).catch(console.error);
    fetchApi('/skills').then(res => setAvailableSkills(res.data)).catch(console.error);
  };

  useEffect(() => { loadData(); }, [refreshKey]);

  // ─── Autosave: debounce 1.5s after ANY field change ─────────────────────
  const doAutosave = useCallback(async (data: typeof initialForm, id: string, editing: boolean) => {
    // Check if there's at least one non-empty value anywhere in the form
    const hasAnyData = (
      data.position || data.company || data.location || data.department ||
      data.industry || data.employment_type || data.work_mode ||
      data.start_date || data.end_date || data.short_summary ||
      data.full_description || data.company_website ||
      data.responsibilities.length || data.achievements.length ||
      data.key_contributions.length || data.associated_skills.length ||
      data.related_projects.length
    );
    if (!hasAnyData) return; // truly empty form — nothing to save yet

    setSaveStatus('saving');
    try {
      // Backend requires company, position, start_date (allowNull: false)
      // Use draft placeholders so any first field saves immediately
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        ...data,
        company: data.company || '(Draft)',
        position: data.position || '(Draft)',
        start_date: data.start_date || today,
        end_date: data.is_current ? null : data.end_date,
      };

      if (editing && id) {
        await fetchApi(`/experience/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        // Clear draft flag once real values are present
        if (data.company && data.company !== '(Draft)' && data.position && data.position !== '(Draft)') {
          setIsDraft(false);
        }
      } else {
        // Create new draft record and switch to edit mode immediately
        const res = await fetchApi('/experience', { method: 'POST', body: JSON.stringify(payload) });
        const newId = res.data?.id;
        if (newId) {
          setIsEditing(true);
          setEditId(newId);
          setIsDraft(true); // mark as auto-draft until finalised
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
  // ─────────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData, end_date: formData.is_current ? null : formData.end_date };
      if (isEditing) {
        await fetchApi(`/experience/${editId}`, { method: 'PUT', body: JSON.stringify(dataToSubmit) });
      } else {
        await fetchApi('/experience', { method: 'POST', body: JSON.stringify(dataToSubmit) });
      }
      resetForm();
      loadData();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetchApi(`/experience/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) { console.error(err); }
  };

  const startEdit = (item: any) => {
    const empType = item.employment_type || '';
    setEmploymentSelectVal(PRESET_EMPLOYMENT_TYPES.includes(empType) ? empType : empType ? 'Other' : '');
    const isDraftRecord = item.company === '(Draft)' || item.position === '(Draft)';
    setIsDraft(isDraftRecord);
    setFormData({
      company: isDraftRecord && item.company === '(Draft)' ? '' : (item.company || ''),
      company_logo: item.company_logo || '', position: isDraftRecord && item.position === '(Draft)' ? '' : (item.position || ''),
      employment_type: item.employment_type || '', location: item.location || '', work_mode: item.work_mode || '',
      department: item.department || '', industry: item.industry || '',
      start_date: item.start_date || '', end_date: item.end_date || '', is_current: item.is_current || false,
      short_summary: item.short_summary || '', full_description: item.full_description || '',
      responsibilities: item.responsibilities || [], achievements: item.achievements || [], key_contributions: item.key_contributions || [],
      associated_skills: item.associated_skills || [], related_projects: item.related_projects || [],
      media: item.media || [], company_website: item.company_website || '', external_links: item.external_links || [],
      status: item.status || 'draft', featured: item.featured || false
    });
    isFirstRender.current = true; // suppress autosave on load
    setIsEditing(true);
    setEditId(item.id);
    setActiveTab('basic');
    setTimeout(() => { isFirstRender.current = false; }, 200);
  };

  const resetForm = () => {
    isFirstRender.current = true;
    setFormData(initialForm);
    setEmploymentSelectVal('');
    setIsEditing(false);
    setEditId('');
    setIsDraft(false);
    setActiveTab('basic');
    setSaveStatus('idle');
    setTimeout(() => { isFirstRender.current = false; }, 200);
  };

  const toggleSkill = (skillName: string) => {
    setFormData(prev => {
      const skills = prev.associated_skills || [];
      if (skills.includes(skillName)) return { ...prev, associated_skills: skills.filter(s => s !== skillName) };
      return { ...prev, associated_skills: [...skills, skillName] };
    });
  };

  const addArrayItem = (field: 'responsibilities' | 'achievements' | 'related_projects', value: string, setter: any) => {
    if (!value.trim()) return;
    setFormData(prev => ({ ...prev, [field]: [...(prev[field] as string[]), value.trim()] }));
    setter('');
  };

  const removeArrayItem = (field: 'responsibilities' | 'achievements' | 'related_projects', index: number) => {
    setFormData(prev => {
      const newArr = [...(prev[field] as string[])];
      newArr.splice(index, 1);
      return { ...prev, [field]: newArr };
    });
  };

  // Save status indicator pill + persistent draft badge
  const SaveIndicator = () => {
    const statusStyles: Record<string, string> = {
      saving: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      saved: 'bg-green-500/20 text-green-400 border-green-500/40',
      error: 'bg-red-500/20 text-red-400 border-red-500/40',
    };
    const statusLabels: Record<string, string> = {
      saving: '⟳ Autosaving…',
      saved: '✓ Draft saved',
      error: '✕ Save failed',
    };
    return (
      <div className="flex items-center gap-2">
        {/* Persistent draft badge — shown until user fills real company + position */}
        {isDraft && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Unsaved Draft
          </span>
        )}
        {/* Transient autosave status */}
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
      <h1 className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8 whitespace-nowrap">Experience V2 Management</h1>

      <div className="bg-gray-800 rounded-lg mb-12 border border-gray-700 overflow-hidden">
        <div className="bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{isEditing ? 'Edit Experience' : 'Create New Experience'}</h2>
            <SaveIndicator />
          </div>
          {isEditing && <button onClick={resetForm} className="text-sm text-gray-400 hover:text-white">Cancel Edit</button>}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-800/50 overflow-x-auto scrollbar-thin">
          {['basic', 'duration', 'description', 'relations', 'publishing'].map(tab => (
            <button
              key={tab}
              onClick={(e) => { e.preventDefault(); setActiveTab(tab); }}
              className={`px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6">

          {/* TAB: BASIC */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm mb-1 text-gray-400">Position / Title *</label><input required type="text" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
                <div><label className="block text-sm mb-1 text-gray-400">Company *</label><input required type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
                <div><label className="block text-sm mb-1 text-gray-400">Location</label><input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="Nairobi, Kenya" /></div>

                {/* Employment Type — with "Other" free-text */}
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Employment Type</label>
                  <select
                    value={employmentSelectVal}
                    onChange={e => {
                      const val = e.target.value;
                      setEmploymentSelectVal(val);
                      if (val !== 'Other') setFormData({ ...formData, employment_type: val });
                      else setFormData({ ...formData, employment_type: '' });
                    }}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                  >
                    <option value="">Select…</option>
                    {PRESET_EMPLOYMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                    <option value="Other">Other…</option>
                  </select>
                  {employmentSelectVal === 'Other' && (
                    <input
                      type="text"
                      autoFocus
                      value={formData.employment_type}
                      onChange={e => setFormData({ ...formData, employment_type: e.target.value })}
                      placeholder="Specify employment type…"
                      className="w-full mt-2 bg-gray-900 border border-primary/50 rounded p-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  )}
                </div>

                <div><label className="block text-sm mb-1 text-gray-400">Work Mode</label>
                  <select value={formData.work_mode} onChange={e => setFormData({ ...formData, work_mode: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white">
                    <option value="">Select...</option><option>On-site</option><option>Hybrid</option><option>Remote</option>
                  </select>
                </div>
                <div><label className="block text-sm mb-1 text-gray-400">Department</label><input type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
              </div>
            </div>
          )}

          {/* TAB: DURATION */}
          {activeTab === 'duration' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm mb-1 text-gray-400">Start Date *</label><input required type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" /></div>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">End Date</label>
                  <input type="date" disabled={formData.is_current} value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white disabled:opacity-50" />
                  <label className="flex items-center gap-2 mt-3 text-sm text-gray-300">
                    <input type="checkbox" checked={formData.is_current} onChange={e => setFormData({ ...formData, is_current: e.target.checked })} className="w-4 h-4 rounded bg-gray-900 border-gray-700" />
                    I currently work here
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DESCRIPTION */}
          {activeTab === 'description' && (
            <div className="space-y-6 animate-fade-in">
              <div><label className="block text-sm mb-1 text-gray-400">Short Summary</label><textarea rows={3} value={formData.short_summary} onChange={e => setFormData({ ...formData, short_summary: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="One or two sentences describing the role..." /></div>

              <div>
                <label className="block text-sm mb-1 text-gray-400">Key Responsibilities</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={tempResponsibility} onChange={e => setTempResponsibility(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArrayItem('responsibilities', tempResponsibility, setTempResponsibility))} className="flex-grow bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="Add a responsibility..." />
                  <button type="button" onClick={() => addArrayItem('responsibilities', tempResponsibility, setTempResponsibility)} className="px-4 bg-gray-700 hover:bg-gray-600 rounded font-bold">Add</button>
                </div>
                <ul className="space-y-2">
                  {formData.responsibilities.map((r, i) => (
                    <li key={i} className="flex justify-between items-center p-2 bg-gray-900 rounded border border-gray-800 text-sm">
                      <span>• {r}</span><button type="button" onClick={() => removeArrayItem('responsibilities', i)} className="text-red-400 hover:text-red-300">Remove</button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-400">Key Achievements</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={tempAchievement} onChange={e => setTempAchievement(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArrayItem('achievements', tempAchievement, setTempAchievement))} className="flex-grow bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="Add an achievement..." />
                  <button type="button" onClick={() => addArrayItem('achievements', tempAchievement, setTempAchievement)} className="px-4 bg-gray-700 hover:bg-gray-600 rounded font-bold">Add</button>
                </div>
                <ul className="space-y-2">
                  {formData.achievements.map((r, i) => (
                    <li key={i} className="flex justify-between items-center p-2 bg-gray-900 rounded border border-gray-800 text-sm">
                      <span>• {r}</span><button type="button" onClick={() => removeArrayItem('achievements', i)} className="text-red-400 hover:text-red-300">Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB: RELATIONS */}
          {activeTab === 'relations' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm mb-2 text-gray-400">Skills Used</label>

                {/* Selected skills — tags with ✕ */}
                <div className="flex flex-wrap gap-2 p-3 bg-gray-900 border border-gray-700 rounded min-h-[52px] mb-3">
                  {formData.associated_skills.length === 0 && (
                    <span className="text-gray-600 text-xs italic self-center">No skills selected yet — pick from below</span>
                  )}
                  {formData.associated_skills.map(skillName => (
                    <span key={skillName} className="flex items-center gap-1.5 px-3 py-1 bg-primary/20 border border-primary/40 text-primary rounded-full text-xs font-bold">
                      {skillName}
                      <button
                        type="button"
                        onClick={() => toggleSkill(skillName)}
                        className="w-4 h-4 flex items-center justify-center rounded-full bg-primary/30 hover:bg-red-500 hover:text-white text-primary transition-colors leading-none"
                        title={`Remove ${skillName}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Available skills picker */}
                <div className="border border-gray-700 rounded overflow-hidden">
                  <div className="bg-gray-800 px-3 py-2 border-b border-gray-700 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
                    <SkillSearch availableSkills={availableSkills} selected={formData.associated_skills} onToggle={toggleSkill} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-400">Related Projects (Type name to link)</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={tempProject} onChange={e => setTempProject(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArrayItem('related_projects', tempProject, setTempProject))} className="flex-grow bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="Project Name..." />
                  <button type="button" onClick={() => addArrayItem('related_projects', tempProject, setTempProject)} className="px-4 bg-gray-700 hover:bg-gray-600 rounded font-bold">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.related_projects.map((p, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-full text-xs flex items-center gap-2">
                      {p} <button type="button" onClick={() => removeArrayItem('related_projects', i)} className="text-red-400 ml-1">&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PUBLISHING & LINKS — submit button lives here only */}
          {activeTab === 'publishing' && (
            <div className="space-y-4 animate-fade-in">
              <div><label className="block text-sm mb-1 text-gray-400">Company Website</label><input type="text" value={formData.company_website} onChange={e => setFormData({ ...formData, company_website: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="https://" /></div>
              <div><label className="block text-sm mb-1 text-gray-400">Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white">
                  <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
                </select>
              </div>
              <label className="flex items-center gap-2 mt-1 text-sm text-gray-300">
                <input type="checkbox" checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} className="w-4 h-4 rounded bg-gray-900 border-gray-700" />
                Feature this experience prominently
              </label>

              {/* Submit only here */}
              <div className="pt-6 border-t border-gray-700 flex items-center gap-4">
                <button type="submit" className="px-8 py-2 bg-primary rounded font-bold hover:bg-blue-600 transition-colors">
                  {isEditing ? 'Save & Finalise' : 'Create Experience'}
                </button>
                <SaveIndicator />
              </div>
            </div>
          )}

        </form>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700 text-xs sm:text-sm text-gray-300">
                <th className="p-3 sm:p-4">Position</th>
                <th className="p-3 sm:p-4">Company</th>
                <th className="p-3 sm:p-4 hidden sm:table-cell">Status</th>
                <th className="p-3 sm:p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="p-3 sm:p-4 text-xs sm:text-sm">
                    <div className="font-bold text-primary">{item.position}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{item.start_date} - {item.is_current ? 'Present' : item.end_date}</div>
                  </td>
                  <td className="p-3 sm:p-4 text-xs sm:text-sm">{item.company}</td>
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
