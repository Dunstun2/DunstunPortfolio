'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Download, Trash2, Eye, X } from 'lucide-react';

export default function CVImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importId, setImportId] = useState<number | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [mappedData, setMappedData] = useState<any>(null);
  const [enhancedData, setEnhancedData] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [enhancing, setEnhancing] = useState(false);
  const [useEnhanced, setUseEnhanced] = useState(true);
  const [previewSection, setPreviewSection] = useState<string | null>(null);

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

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cv/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload CV');
      }

      setImportId(result.data.importId);
      setPreview(result.data.preview);
      setMappedData(result.data.mappedData);
      setEnhancedData(result.data.enhancedData);
      setParsedData(result.data);

      // Select all sections by default
      setSelectedSections(['hero', 'about', 'skills', 'experience', 'education', 'certifications', 'achievements', 'projects', 'social', 'settings']);

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cv/import/${importId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections: selectedSections, useEnhanced }),
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

  // Enhance CV data with AI improvements
  const handleEnhance = async () => {
    if (!importId) return;

    setEnhancing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cv/enhance/${importId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to enhance CV data');
      }

      setEnhancedData(result.data.enhanced);
      setSuccess(`CV enhanced successfully! Added ${result.data.improvements.totalEnhancements} improvements.`);
    } catch (err: any) {
      setError(err.message || 'Failed to enhance CV data');
      console.error('Enhancement error:', err);
    } finally {
      setEnhancing(false);
    }
  };

  // Toggle section selection
  const toggleSection = (section: string) => {
    setSelectedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Select all sections
  const selectAll = () => {
    setSelectedSections(['hero', 'about', 'skills', 'experience', 'education', 'certifications', 'achievements', 'projects', 'social', 'settings']);
  };

  // Deselect all sections
  const deselectAll = () => {
    setSelectedSections([]);
  };

  // Get data for preview (enhanced or mapped)
  const getPreviewData = () => {
    return useEnhanced && enhancedData ? enhancedData : mappedData;
  };

  // Render section preview content
  const renderSectionPreview = (sectionKey: string) => {
    const data = getPreviewData();
    if (!data) return null;

    switch (sectionKey) {
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
                <div key={i} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {skill.skill_name || skill.name || skill}
                  </p>
                  {skill.proficiency_level && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Level: {skill.proficiency_level}
                    </p>
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
                <div key={i} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {exp.position_title || exp.title}
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    {exp.company_name || exp.company}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {exp.start_date} - {exp.end_date || 'Present'}
                    {exp.location && ` • ${exp.location}`}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {exp.description}
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
            <h2 className="text-2xl font-bold mb-4">Education</h2>
            <div className="space-y-6">
              {data.education?.map((edu: any, i: number) => (
                <div key={i} className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {edu.degree_title || edu.degree}
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    {edu.institution_name || edu.institution}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {edu.start_date} - {edu.end_date || 'Present'}
                    {edu.location && ` • ${edu.location}`}
                  </p>
                  {edu.description && (
                    <p className="text-gray-700 dark:text-gray-300">{edu.description}</p>
                  )}
                  {edu.gpa && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      GPA: {edu.gpa}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Certifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.certifications?.map((cert: any, i: number) => (
                <div key={i} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {cert.certification_name || cert.name}
                  </h3>
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
                <div key={i} className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {ach.title}
                  </h3>
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
                <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {proj.title || proj.project_name}
                  </h3>
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
            Upload your CV (PDF, DOCX, or TXT) and we'll automatically parse it into your portfolio sections.
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
                    Drop your CV here or click to browse
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Supports PDF, DOCX, and TXT files (max 10MB)
                  </p>
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
            {/* Enhancement Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                AI Enhancement Options
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Enhance your CV with AI-powered improvements including better descriptions, keyword optimization, and professional formatting.
              </p>

              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={handleEnhance}
                  disabled={enhancing || !mappedData}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {enhancing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      Enhance with AI
                    </>
                  )}
                </button>

                {enhancedData && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={useEnhanced}
                      onChange={(e) => setUseEnhanced(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Use enhanced data for import
                    </span>
                  </label>
                )}
              </div>

              {enhancedData && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                    ✨ Enhancement Complete!
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div className="text-purple-700 dark:text-purple-300">
                      • Improved descriptions
                    </div>
                    <div className="text-purple-700 dark:text-purple-300">
                      • SEO keywords added
                    </div>
                    <div className="text-purple-700 dark:text-purple-300">
                      • Professional formatting
                    </div>
                    <div className="text-purple-700 dark:text-purple-300">
                      • Enhanced readability
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                  { key: 'hero', label: 'Hero Section', count: 1 },
                  { key: 'about', label: 'About Section', count: 1 },
                  { key: 'skills', label: 'Skills', count: (useEnhanced && enhancedData ? enhancedData.skills?.length : mappedData.skills?.length) || 0 },
                  { key: 'experience', label: 'Experience', count: (useEnhanced && enhancedData ? enhancedData.experience?.length : mappedData.experience?.length) || 0 },
                  { key: 'education', label: 'Education', count: (useEnhanced && enhancedData ? enhancedData.education?.length : mappedData.education?.length) || 0 },
                  { key: 'certifications', label: 'Certifications', count: (useEnhanced && enhancedData ? enhancedData.certifications?.length : mappedData.certifications?.length) || 0 },
                  { key: 'achievements', label: 'Achievements', count: (useEnhanced && enhancedData ? enhancedData.achievements?.length : mappedData.achievements?.length) || 0 },
                  { key: 'projects', label: 'Projects', count: (useEnhanced && enhancedData ? enhancedData.projects?.length : mappedData.projects?.length) || 0 },
                  { key: 'social', label: 'Social Accounts', count: (useEnhanced && enhancedData ? enhancedData.social?.length : mappedData.social?.length) || 0 },
                  { key: 'settings', label: 'Site Settings', count: Object.keys((useEnhanced && enhancedData ? enhancedData.settings : mappedData.settings) || {}).length },
                ].map((section) => (
                  <div
                    key={section.key}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-colors ${selectedSections.includes(section.key)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section.key)}
                      onChange={() => toggleSection(section.key)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {section.label}
                        </p>
                        {useEnhanced && enhancedData && (
                          <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-0.5 rounded-full">
                            ✨ Enhanced
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {section.count} item{section.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => setPreviewSection(section.key)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Preview section"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Import Button */}
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
                    Import to Portfolio
                  </>
                )}
              </button>
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
                  {useEnhanced && enhancedData && (
                    <span className="text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-3 py-1 rounded-full">
                      ✨ Enhanced Version
                    </span>
                  )}
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
      </div>
    </div>
  );
}
