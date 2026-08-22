'use client';


import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Download, Trash2, Eye, X, Info, Pencil, Save } from 'lucide-react';
import { API_BASE_URL } from '@/utils/urls';

export default function CVImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importId, setImportId] = useState<number | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [mappedData, setMappedData] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [reviewedSections, setReviewedSections] = useState<string[]>([]);
  const [documentType, setDocumentType] = useState<string>('auto');
  const [previewSection, setPreviewSection] = useState<string | null>(null);

  // Inline editing state
  const [editingItem, setEditingItem] = useState<{ section: string; index: number } | null>(null);
  const [editDraft, setEditDraft] = useState<any>(null);

  // Handle file selection
  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!validTypes.includes(selectedFile.type) &&
      !selectedFile.name.endsWith('.pdf') &&
      !selectedFile.name.endsWith('.docx') &&
      !selectedFile.name.endsWith('.txt')) {
      setError('Invalid file type. Please upload PDF, DOCX, or TXT files only.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File is too large. Maximum size is 10MB.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setParsedData(null);
    setMappedData(null);
    setImportId(null);
  };

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

  // Upload and parse CV
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('cv', file);
      formData.append('documentType', documentType);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/cv/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to upload CV');
      }

      setImportId(result.data.importId);
      // We set mappedData directly to the AI output
      const aiData = result.data.mappedData?.data || {};
      if (result.data.mappedData?.raw_extraction) {
        aiData.raw_extraction = result.data.mappedData.raw_extraction;
      }
      setMappedData(aiData);
      
      // Compute preview metrics from the AI data
      setPreview({
        skillsCount: aiData.skills?.length || 0,
        experienceCount: aiData.experience?.length || 0,
        educationCount: aiData.education?.length || 0,
        certificationsCount: aiData.certifications?.length || 0,
        achievementsCount: aiData.achievements?.length || 0,
        projectsCount: aiData.projects?.length || 0,
        testimonialsCount: aiData.testimonials?.length || 0,
      });

      setParsedData(result.data);

      // All sections deselected by default — admin must review and select each one
      setSelectedSections([]);

      setSuccess('CV parsed successfully! Review the data below and select sections to import.');
    } catch (err: any) {
      setError(err.message || 'Failed to upload and parse CV');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  // Import selected sections
  const handleImport = async () => {
    if (!importId) return;

    setImporting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/cv/import/${importId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections: selectedSections }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to import CV data');
      }

      setSuccess(`Successfully imported CV data: ${JSON.stringify(result.data.imported)}`);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to import CV data');
      console.error('Import error:', err);
    } finally {
      setImporting(false);
    }
  };



  // Toggle section selection (only if reviewed)
  const toggleSection = (section: string) => {
    if (!reviewedSections.includes(section)) {
      setError(`Please review "${section}" first by clicking the 👁 eye icon before selecting it for import.`);
      setTimeout(() => setError(null), 4000);
      return;
    }
    setSelectedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Mark a section as reviewed
  const markReviewed = (section: string) => {
    setReviewedSections(prev =>
      prev.includes(section) ? prev : [...prev, section]
    );
  };

  // Select all reviewed sections
  const selectAll = () => {
    if (reviewedSections.length === 0) {
      setError('You must review sections first using the 👁 eye icon before selecting them for import.');
      setTimeout(() => setError(null), 4000);
      return;
    }
    setSelectedSections([...reviewedSections]);
  };

  // Deselect all sections
  const deselectAll = () => {
    setSelectedSections([]);
  };

  // Open the inline editor for a specific item
  const openEdit = (section: string, index: number) => {
    const item = mappedData?.[section]?.[index];
    if (!item) return;
    setEditingItem({ section, index });
    setEditDraft({ ...item });
  };

  // Update a field in the draft
  const updateDraftField = (field: string, value: string) => {
    setEditDraft((prev: any) => ({ ...prev, [field]: value }));
  };

  // Save edits back to mappedData
  const saveEdit = () => {
    if (!editingItem || !editDraft) return;
    const { section, index } = editingItem;
    setMappedData((prev: any) => {
      const updated = [...(prev[section] || [])];
      updated[index] = { ...updated[index], ...editDraft };
      return { ...prev, [section]: updated };
    });
    setEditingItem(null);
    setEditDraft(null);
  };

  const getPreviewData = () => {
    return mappedData;
  };

  // Render section preview content
  const renderSectionPreview = (sectionKey: string) => {
    const data = getPreviewData();
    if (!data) return null;

    switch (sectionKey) {
      case 'raw_extraction':
        return (
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-500" />
              General Preview (Raw Extraction)
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm font-mono bg-white dark:bg-black p-4 rounded border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-300">
                {data.raw_extraction || 'No raw extraction available.'}
              </pre>
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 rounded-lg">
            <h1 className="text-4xl font-bold mb-2">{data.hero?.title || 'Your Name'}</h1>
            <p className="text-xl mb-4 opacity-90">{data.hero?.subtitle || 'Your Title'}</p>
            <p className="text-lg opacity-80">{data.hero?.description || 'Your professional summary...'}</p>
          </div>
        );

      case 'about':
        return (
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-4">About Me</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {data.about?.bio || 'Your bio will appear here...'}
            </p>
            {data.about?.highlights && data.about.highlights.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2">Highlights</h3>
                <ul className="list-disc list-inside space-y-1">
                  {data.about.highlights.map((h: any, i: number) => (
                    <li key={i}>{h.text || h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'skills':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Skills</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.skills?.map((skill: any, i: number) => (
                <div key={i} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 relative group">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {skill.skill_name || skill.name || skill}
                    </p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {skill.existsInDb ? (
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700 whitespace-nowrap">
                          Exists (Will Update)
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded border border-green-300 dark:border-green-700 whitespace-nowrap">
                          New
                        </span>
                      )}
                      <button
                        onClick={() => openEdit('skills', i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-600 dark:text-blue-300"
                        title="Edit this skill"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {skill.proficiency_level && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Level: {skill.proficiency_level}
                    </p>
                  )}
                  {skill.category && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{skill.category}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'experience':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Experience</h2>
            <div className="space-y-6">
              {data.experience?.map((exp: any, i: number) => (
                <div key={i} className="border-l-4 border-blue-500 pl-4 group">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {exp.position_title || exp.position || exp.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {exp.existsInDb ? (
                        <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                          Already Exists (Will Update)
                        </span>
                      ) : (
                        <span className="text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-0.5 rounded border border-green-300 dark:border-green-700">
                          New Entry
                        </span>
                      )}
                      <button
                        onClick={() => openEdit('experience', i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        title="Edit this experience"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    {exp.company_name || exp.company}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {exp.start_date} - {exp.end_date || 'Present'}
                    {exp.location && ` • ${exp.location}`}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {exp.short_summary || exp.description}
                  </p>
                  {exp.responsibilities && exp.responsibilities.length > 0 && (
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                      {exp.responsibilities.map((r: string, j: number) => (
                        <li key={j}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-blue-500">🎓</span> Education
            </h2>
            <div className="space-y-6">
              {data.education?.map((edu: any, index: number) => {
                const startStr = edu.start_date ? new Date(edu.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';
                let endStr = 'Present';
                if (edu.end_date) {
                  endStr = new Date(edu.end_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                } else if (edu.is_current && edu.expected_graduation) {
                  endStr = 'Expected ' + new Date(edu.expected_graduation).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                }
                
                return (
                  <div key={index} className="glass p-6 md:p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(var(--color-primary-rgb),0.15)] hover:border-primary/30 bg-white/5 border border-gray-200 dark:border-gray-800 group">
                    <div className="mb-2 flex flex-col md:flex-row items-start justify-between gap-2 md:gap-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg md:text-xl lg:text-2xl font-bold leading-snug break-words text-gray-900 dark:text-white">
                          {edu.degree && <span className="text-orange-500">{edu.degree}</span>}
                          {edu.degree && edu.field_of_study && ' in '}
                          {edu.field_of_study && <span className="text-blue-500">{edu.field_of_study}</span>}
                        </h3>
                        {edu.existsInDb ? (
                          <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                            Already Exists (Will Update)
                          </span>
                        ) : (
                          <span className="text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-0.5 rounded border border-green-300 dark:border-green-700">
                            New Entry
                          </span>
                        )}
                        <button
                          onClick={() => openEdit('education', index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 ml-2"
                          title="Edit this education"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="flex-shrink-0 inline-block align-middle text-[11px] md:text-sm font-bold text-blue-500 bg-blue-500/10 px-2 md:px-3 py-1 rounded-full border border-blue-500/20 whitespace-nowrap mt-1">
                        {startStr} – {endStr}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                        {edu.institution}
                        {edu.faculty && <span className="text-gray-500 dark:text-gray-500 font-normal"> | {edu.faculty}</span>}
                        {edu.department && <span className="text-gray-500 dark:text-gray-500 font-normal"> | {edu.department}</span>}
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {edu.gpa && <span className="text-xs font-mono bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2 py-1 rounded border border-gray-200 dark:border-gray-800">GPA: {edu.gpa}</span>}
                      {edu.grade && <span className="text-xs font-mono bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2 py-1 rounded border border-gray-200 dark:border-gray-800">Grade: {edu.grade}</span>}
                      {edu.honors && <span className="text-xs font-mono bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-2 py-1 rounded border border-yellow-500/20">{edu.honors}</span>}
                      {edu.specialization && <span className="text-xs font-mono bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2 py-1 rounded border border-gray-200 dark:border-gray-800">Spec: {edu.specialization}</span>}
                    </div>

                    {edu.short_summary && (
                      <p className="text-gray-700 dark:text-gray-300 text-lg mb-4 border-l-4 border-blue-500 pl-4 py-1 italic">
                        {edu.short_summary}
                      </p>
                    )}
                    
                    {edu.full_description && (
                      <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed mb-6 whitespace-pre-wrap">
                        {edu.full_description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'certifications':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Certifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.certifications?.map((cert: any, i: number) => (
                <div key={i} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800 group">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {cert.certification_name || cert.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {cert.existsInDb ? (
                        <span className="text-[10px] uppercase font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700 whitespace-nowrap">
                          Already Exists
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-1.5 py-0.5 rounded border border-green-300 dark:border-green-700 whitespace-nowrap">
                          New
                        </span>
                      )}
                      <button
                        onClick={() => openEdit('certifications', i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-purple-200 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                        title="Edit this certification"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {cert.issuing_organization || cert.issuer}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {cert.issue_date}
                    {cert.expiration_date && !cert.does_not_expire && ` - ${cert.expiration_date}`}
                    {cert.does_not_expire && ' • Does not expire'}
                  </p>
                  {cert.credential_id && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ID: {cert.credential_id}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Achievements</h2>
            <div className="space-y-4">
              {data.achievements?.map((ach: any, i: number) => (
                <div key={i} className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800 group">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {ach.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {ach.existsInDb ? (
                        <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                          Already Exists (Will Update)
                        </span>
                      ) : (
                        <span className="text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-0.5 rounded border border-green-300 dark:border-green-700">
                          New Entry
                        </span>
                      )}
                      <button
                        onClick={() => openEdit('achievements', i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                        title="Edit this achievement"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {ach.organization && (
                    <p className="text-gray-700 dark:text-gray-300">{ach.organization}</p>
                  )}
                  {ach.date && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{ach.date}</p>
                  )}
                  {ach.short_description && (
                    <p className="text-gray-700 dark:text-gray-300 mt-2">{ach.short_description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Projects</h2>
            <div className="space-y-6">
              {data.projects?.map((proj: any, i: number) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 group">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {proj.title || proj.project_name}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {proj.existsInDb ? (
                        <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                          Already Exists (Will Update)
                        </span>
                      ) : (
                        <span className="text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-0.5 rounded border border-green-300 dark:border-green-700">
                          New Entry
                        </span>
                      )}
                      <button
                        onClick={() => openEdit('projects', i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                        title="Edit this project"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mt-2">
                    {proj.short_description || proj.description}
                  </p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {proj.technologies.map((tech: string, j: number) => (
                        <span key={j} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Testimonials (from Recommendation Letters)</h2>
            <div className="space-y-6">
              {data.testimonials?.map((testim: any, i: number) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-indigo-500 group relative">
                  <button
                    onClick={() => openEdit('testimonials', i)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                    title="Edit this testimonial"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <div className="flex gap-4 pr-8">
                    {testim.image_url && (
                      <img src={testim.image_url} alt={testim.author_name} className="w-16 h-16 rounded-full object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="text-gray-800 dark:text-gray-200 italic mb-3">"{testim.content}"</p>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{testim.author_name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {testim.author_title} {testim.author_company && `at ${testim.author_company}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'social':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Social Accounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.social?.map((social: any, i: number) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {social.platform_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {social.platform_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {social.profile_url || social.username}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Site Settings</h2>
            <div className="space-y-3">
              {Object.entries(data.settings || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {typeof value === 'object' && value !== null
                      ? JSON.stringify(value, null, 2)
                      : String(value ?? '')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <p>No preview available for this section.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Import CV to Portfolio
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your CV, Resume, or Recommendation Letter (PDF, DOCX, or TXT) and we'll automatically parse it into your portfolio sections using AI.
          </p>
        </div>

        {/* Upload Section */}
        {!parsedData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600'
                }`}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />

              {!file ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Drop your document here or click to browse
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Supports PDF, DOCX, and TXT files (max 10MB)
                  </p>
                  
                  <div className="mb-6 flex justify-center">
                    <div className="flex flex-col text-left">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Type</label>
                      <select 
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="auto">Auto-Detect</option>
                        <option value="cv">CV / Resume</option>
                        <option value="recommendation">Recommendation Letter</option>
                      </select>
                    </div>
                  </div>

                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                    <span className="px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors inline-block">
                      Select File
                    </span>
                  </label>
                </>
              ) : (
                <>
                  <FileText className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {file.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Parsing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Parse CV
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setFile(null)}
                      disabled={uploading}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {success && (
          <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Preview and Import Section */}
        {parsedData && mappedData && (
          <div className="mt-8 space-y-6">


            {/* Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Parsed CV Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Skills</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {preview.skillsCount}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Experience</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {preview.experienceCount}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Education</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {preview.educationCount}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Certifications</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {preview.certificationsCount}
                  </p>
                </div>
              </div>
            </div>

            {/* General Preview Button */}
            <div className="mb-6">
              <button
                onClick={() => setPreviewSection('raw_extraction')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <FileText className="w-5 h-5 text-blue-500" />
                View Raw Document Extraction (What the AI saw)
              </button>
            </div>

            {/* Step-by-step instructions */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-2">How to import</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-amber-700 dark:text-amber-300">
                    <li><strong>Review</strong> each section by clicking the 👁 eye icon to verify the extracted data is correct.</li>
                    <li><strong>Select</strong> the reviewed sections you want to import by ticking their checkbox.</li>
                    <li><strong>Click &quot;Import to Portfolio&quot;</strong> once you are satisfied with your selections.</li>
                  </ol>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 italic">
                    You cannot select a section for import until you have reviewed it. Sections with 0 items contain no extracted data.
                  </p>
                </div>
              </div>
            </div>

            {/* Section Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Select Sections to Import
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Select All
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={deselectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'skills', label: 'Skills', count: mappedData.skills?.length || 0 },
                  { key: 'experience', label: 'Experience', count: mappedData.experience?.length || 0 },
                  { key: 'education', label: 'Education', count: mappedData.education?.length || 0 },
                  { key: 'certifications', label: 'Certifications', count: mappedData.certifications?.length || 0 },
                  { key: 'achievements', label: 'Achievements', count: mappedData.achievements?.length || 0 },
                  { key: 'projects', label: 'Projects', count: mappedData.projects?.length || 0 },
                  { key: 'testimonials', label: 'Testimonials', count: mappedData.testimonials?.length || 0 },
                ].map((section) => (
                  <div
                    key={section.key}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-colors ${
                      selectedSections.includes(section.key)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : reviewedSections.includes(section.key)
                          ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section.key)}
                      onChange={() => toggleSection(section.key)}
                      disabled={!reviewedSections.includes(section.key)}
                      className={`w-5 h-5 rounded ${reviewedSections.includes(section.key) ? 'text-blue-600' : 'text-gray-300 cursor-not-allowed'}`}
                      title={!reviewedSections.includes(section.key) ? 'Review this section first using the eye icon' : ''}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {section.label}
                        </p>
                        {reviewedSections.includes(section.key) && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">Reviewed</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {section.count} item{section.count !== 1 ? 's' : ''}
                        {!reviewedSections.includes(section.key) && (
                          <span className="ml-2 text-amber-600 dark:text-amber-400">— click 👁 to review before selecting</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        markReviewed(section.key);
                        setPreviewSection(section.key);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        reviewedSections.includes(section.key)
                          ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                          : 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                      }`}
                      title="Review section data"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Import Button */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              {selectedSections.length === 0 && reviewedSections.length === 0 ? (
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">Start by reviewing sections using the 👁 eye icon, then check the ones you want to import.</p>
                </div>
              ) : selectedSections.length === 0 ? (
                <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                  <Info className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{reviewedSections.length} section{reviewedSections.length !== 1 ? 's' : ''} reviewed. Now check the ones you want to import.</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-4 text-green-700 dark:text-green-400">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{selectedSections.length} section{selectedSections.length !== 1 ? 's' : ''} selected and reviewed — ready to import.</p>
                </div>
              )}
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => {
                    setParsedData(null);
                    setMappedData(null);
                    setFile(null);
                    setImportId(null);
                  }}
                  disabled={importing}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || selectedSections.length === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Import to Portfolio ({selectedSections.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewSection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Eye className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Section Preview
                  </h2>
                </div>
                <button
                  onClick={() => setPreviewSection(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {renderSectionPreview(previewSection)}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This is how the section will appear on your portfolio
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPreviewSection(null)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedSections.includes(previewSection)) {
                        toggleSection(previewSection);
                      }
                      setPreviewSection(null);
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${selectedSections.includes(previewSection)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {selectedSections.includes(previewSection) ? (
                      <>
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Selected
                      </>
                    ) : (
                      'Select for Import'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✏️ Inline Edit Modal */}
        {editingItem && editDraft && (() => {
          const { section } = editingItem;

          const Field = ({ label, field, multiline = false }: { label: string; field: string; multiline?: boolean }) => (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              {multiline ? (
                <textarea
                  value={editDraft[field] ?? ''}
                  onChange={e => updateDraftField(field, e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              ) : (
                <input
                  type="text"
                  value={editDraft[field] ?? ''}
                  onChange={e => updateDraftField(field, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              )}
            </div>
          );

          const renderFields = () => {
            switch (section) {
              case 'skills':
                return (
                  <>
                    <Field label="Skill Name" field="name" />
                    <Field label="Category" field="category" />
                    <Field label="Proficiency (0–100)" field="proficiency" />
                  </>
                );
              case 'experience':
                return (
                  <>
                    <Field label="Position / Title" field="position" />
                    <Field label="Company" field="company" />
                    <Field label="Employment Type" field="employment_type" />
                    <Field label="Start Date (YYYY-MM-DD)" field="start_date" />
                    <Field label="End Date (YYYY-MM-DD, blank = Present)" field="end_date" />
                    <Field label="Location" field="location" />
                    <Field label="Short Summary" field="short_summary" multiline />
                  </>
                );
              case 'education':
                return (
                  <>
                    <Field label="Degree" field="degree" />
                    <Field label="Field of Study" field="field_of_study" />
                    <Field label="Institution" field="institution" />
                    <Field label="Start Date (YYYY-MM-DD)" field="start_date" />
                    <Field label="End Date (YYYY-MM-DD)" field="end_date" />
                    <Field label="GPA / Grade" field="gpa" />
                    <Field label="Short Summary" field="short_summary" multiline />
                  </>
                );
              case 'certifications':
                return (
                  <>
                    <Field label="Certification Name" field="certification_name" />
                    <Field label="Issuing Organization" field="issuing_organization" />
                    <Field label="Issue Date" field="issue_date" />
                    <Field label="Expiry Date (blank = no expiry)" field="expiration_date" />
                    <Field label="Credential ID" field="credential_id" />
                  </>
                );
              case 'achievements':
                return (
                  <>
                    <Field label="Title" field="title" />
                    <Field label="Organization" field="organization" />
                    <Field label="Date" field="date" />
                    <Field label="Short Summary" field="short_summary" multiline />
                  </>
                );
              case 'projects':
                return (
                  <>
                    <Field label="Title" field="title" />
                    <Field label="Short Description" field="short_description" multiline />
                  </>
                );
              case 'testimonials':
                return (
                  <>
                    <Field label="Author Name" field="author_name" />
                    <Field label="Author Title" field="author_title" />
                    <Field label="Company" field="company" />
                    <Field label="Content / Testimonial" field="content" multiline />
                  </>
                );
              default:
                return <p className="text-gray-500">No editable fields for this section.</p>;
            }
          };

          return (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                      <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit {section.charAt(0).toUpperCase() + section.slice(1)}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Changes apply to what gets imported — not saved to DB yet.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setEditingItem(null); setEditDraft(null); }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Fields */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {renderFields()}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <button
                    onClick={() => { setEditingItem(null); setEditDraft(null); }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
