'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { fetchApi } from '@/utils/api';
import { API_BASE_URL, getFileUrl } from '@/utils/urls';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageName: string;
  onSuccess: () => void;
}

interface FieldSchema {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'image' | 'slider' | 'tags';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: any;
  min?: number;
  max?: number;
  isArray?: boolean; // marks fields that should be sent as string arrays
}

const SCHEMAS: Record<string, FieldSchema[]> = {
  services: [
    { name: 'name', label: 'Service Name', type: 'text', required: true, placeholder: 'e.g. Premium Web Development' },
    { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe the service in detail...' },
    { name: 'price', label: 'Price (optional)', type: 'text', placeholder: 'e.g. $99/hr or Starting at $499' },
    { name: 'image_url', label: 'Cover Image', type: 'image', required: true, placeholder: 'Upload or paste image URL' },
    { name: 'video_url', label: 'Video URL (optional)', type: 'text', placeholder: 'e.g. https://youtube.com/...' },
    { name: 'features', label: 'Key Features (comma-separated)', type: 'tags', placeholder: 'e.g. 24/7 Support, Fast Delivery, Custom Design', isArray: true },
    { name: 'external_link', label: 'External Link (optional)', type: 'text', placeholder: 'e.g. https://example.com' },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'published', options: ['published', 'draft'] },
    { name: 'featured', label: 'Mark as Featured', type: 'checkbox', defaultValue: false }
  ],
  projects: [
    { name: 'title', label: 'Project Title', type: 'text', required: true, placeholder: 'e.g. Comrade E-Commerce Platform' },
    { name: 'description', label: 'Short Description', type: 'textarea', required: true, placeholder: 'Provide a brief summary of the project...' },
    { name: 'content', label: 'Full Project Write-up', type: 'textarea', placeholder: 'Detailed overview, context, and purpose...' },
    { name: 'thumbnail_url', label: 'Thumbnail Image', type: 'image', required: true, placeholder: 'Upload or paste image URL' },
    { name: 'category', label: 'Category', type: 'text', placeholder: 'e.g. Web App, Mobile, DevOps' },
    { name: 'project_type', label: 'Project Type', type: 'select', defaultValue: 'Personal', options: ['Personal', 'Academic', 'Professional', 'Client', 'Open Source'] },
    { name: 'start_date', label: 'Start Date', type: 'text', placeholder: 'e.g. Jan 2024' },
    { name: 'end_date', label: 'End Date', type: 'text', placeholder: 'e.g. Jun 2024 or Present' },
    { name: 'my_role', label: 'My Role', type: 'text', placeholder: 'e.g. Lead Frontend Developer' },
    { name: 'team_size', label: 'Team Size', type: 'text', placeholder: 'e.g. 4 (solo / 2 devs + 1 designer)' },
    { name: 'technologies', label: 'Technologies Used (comma-separated)', type: 'tags', placeholder: 'e.g. React, Node.js, PostgreSQL', isArray: true },
    { name: 'problem', label: 'Problem Statement', type: 'textarea', placeholder: 'What problem does this project solve?' },
    { name: 'solution', label: 'Solution', type: 'textarea', placeholder: 'How did you solve it?' },
    { name: 'outcomes', label: 'Outcomes & Results', type: 'textarea', placeholder: 'What was achieved? Metrics, impact...' },
    { name: 'lessons_learned', label: 'Lessons Learned', type: 'textarea', placeholder: 'Key takeaways from the project...' },
    { name: 'github_link', label: 'GitHub Link (optional)', type: 'text', placeholder: 'e.g. https://github.com/...' },
    { name: 'live_link', label: 'Live Site Link (optional)', type: 'text', placeholder: 'e.g. https://...' },
    { name: 'featured', label: 'Mark as Featured', type: 'checkbox', defaultValue: false },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'published', options: ['published', 'draft'] }
  ],
  education: [
    { name: 'institution', label: 'Institution / School Name', type: 'text', required: true, placeholder: 'e.g. Stanford University' },
    { name: 'degree', label: 'Degree Title', type: 'text', required: true, placeholder: 'e.g. B.S. in Computer Science' },
    { name: 'institution_type', label: 'Institution Type', type: 'select', defaultValue: 'University', options: ['University', 'College', 'High School', 'Technical Institute', 'Bootcamp', 'Other'] },
    { name: 'field_of_study', label: 'Field of Study', type: 'text', placeholder: 'e.g. Software Engineering' },
    { name: 'specialization', label: 'Specialization (optional)', type: 'text', placeholder: 'e.g. Machine Learning' },
    { name: 'institution_logo', label: 'Institution Logo', type: 'image', placeholder: 'Upload or paste logo URL' },
    { name: 'start_date', label: 'Start Date', type: 'text', required: true, placeholder: 'e.g. Sep 2020' },
    { name: 'end_date', label: 'End Date', type: 'text', placeholder: 'e.g. Jun 2024 or Present' },
    { name: 'is_current', label: 'Currently Attending', type: 'checkbox', defaultValue: false },
    { name: 'gpa', label: 'GPA (optional)', type: 'text', placeholder: 'e.g. 3.8 / 4.0' },
    { name: 'honors', label: 'Honors / Awards (optional)', type: 'text', placeholder: 'e.g. Magna Cum Laude' },
    { name: 'short_summary', label: 'Short Summary', type: 'text', placeholder: 'e.g. Focused on AI and systems engineering' },
    { name: 'full_description', label: 'Full Description (optional)', type: 'textarea', placeholder: 'Highlight key courses, projects, and activities...' },
    { name: 'coursework', label: 'Key Coursework (comma-separated)', type: 'tags', placeholder: 'e.g. Algorithms, Machine Learning, Databases', isArray: true },
    { name: 'featured', label: 'Mark as Featured', type: 'checkbox', defaultValue: false },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'published', options: ['published', 'draft'] }
  ],
  experience: [
    { name: 'company', label: 'Company / Organization Name', type: 'text', required: true, placeholder: 'e.g. Google' },
    { name: 'position', label: 'Job Title / Role', type: 'text', required: true, placeholder: 'e.g. Senior Software Engineer' },
    { name: 'company_logo', label: 'Company Logo', type: 'image', placeholder: 'Upload or paste logo URL' },
    { name: 'employment_type', label: 'Employment Type', type: 'select', defaultValue: 'Full-time', options: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'] },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g. San Francisco, CA' },
    { name: 'work_mode', label: 'Work Mode', type: 'select', defaultValue: 'On-site', options: ['On-site', 'Remote', 'Hybrid'] },
    { name: 'industry', label: 'Industry (optional)', type: 'text', placeholder: 'e.g. FinTech, Healthcare, SaaS' },
    { name: 'department', label: 'Department (optional)', type: 'text', placeholder: 'e.g. Engineering, Product' },
    { name: 'start_date', label: 'Start Date', type: 'text', required: true, placeholder: 'e.g. Jan 2022' },
    { name: 'end_date', label: 'End Date', type: 'text', placeholder: 'e.g. Dec 2024 or Present' },
    { name: 'is_current', label: 'Currently Working Here', type: 'checkbox', defaultValue: false },
    { name: 'short_summary', label: 'Short Summary', type: 'text', placeholder: 'e.g. Led backend infrastructure for payments platform' },
    { name: 'full_description', label: 'Full Description (optional)', type: 'textarea', placeholder: 'Outline key responsibilities and accomplishments...' },
    { name: 'associated_skills', label: 'Skills Used (comma-separated)', type: 'tags', placeholder: 'e.g. Python, AWS, React', isArray: true },
    { name: 'company_website', label: 'Company Website (optional)', type: 'text', placeholder: 'e.g. https://company.com' },
    { name: 'featured', label: 'Mark as Featured', type: 'checkbox', defaultValue: false },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'published', options: ['published', 'draft'] }
  ],
  skills: [
    { name: 'name', label: 'Skill Name', type: 'text', required: true, placeholder: 'e.g. React.js, Python, Figma' },
    { name: 'category', label: 'Category', type: 'text', required: true, placeholder: 'e.g. Frontend, Backend, Design' },
    { name: 'proficiency', label: 'Proficiency Level', type: 'slider', defaultValue: 80, min: 1, max: 100 }
  ],
  blog: [
    { name: 'title', label: 'Post Title', type: 'text', required: true, placeholder: 'e.g. The Future of Web Development in 2026' },
    { name: 'slug', label: 'URL Slug (auto-generated)', type: 'text', required: true, placeholder: 'e.g. future-of-web-dev' },
    { name: 'excerpt', label: 'Short Excerpt', type: 'textarea', placeholder: 'A 1–2 sentence hook for the blog card...' },
    { name: 'content', label: 'Post Content (Markdown supported)', type: 'textarea', required: true, placeholder: 'Write your full post content here...' },
    { name: 'featured_image_url', label: 'Featured Banner Image', type: 'image', placeholder: 'Upload or paste image URL' },
    { name: 'category', label: 'Category', type: 'text', placeholder: 'e.g. Engineering, Design, Career' },
    { name: 'tags', label: 'Tags (comma-separated)', type: 'tags', placeholder: 'e.g. react, nextjs, typescript', isArray: true },
    { name: 'seo_title', label: 'SEO Title (optional)', type: 'text', placeholder: 'Override title for search engines' },
    { name: 'seo_description', label: 'SEO Description (optional)', type: 'textarea', placeholder: 'Meta description for search engines (150–160 chars)' },
    { name: 'seo_keywords', label: 'SEO Keywords (optional)', type: 'text', placeholder: 'e.g. react hooks, web performance' },
    { name: 'featured', label: 'Mark as Featured', type: 'checkbox', defaultValue: false },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'published', options: ['published', 'draft'] }
  ],
  testimonials: [
    { name: 'author_name', label: 'Client / Recommender Name', type: 'text', required: true, placeholder: 'e.g. Jane Smith' },
    { name: 'email', label: 'Email (optional)', type: 'text', placeholder: 'e.g. jane@company.com' },
    { name: 'content', label: 'Feedback / Testimonial', type: 'textarea', required: true, placeholder: 'What they said about working with you...' },
    { name: 'author_title', label: 'Professional Title (optional)', type: 'text', placeholder: 'e.g. CTO' },
    { name: 'company', label: 'Company Name (optional)', type: 'text', placeholder: 'e.g. Stripe' },
    { name: 'relationship', label: 'Relationship (optional)', type: 'text', placeholder: 'e.g. Former Manager, Client, Colleague' },
    { name: 'avatar_url', label: 'Client Avatar Image', type: 'image', placeholder: 'Upload or paste image URL' },
    { name: 'photo_consent', label: 'Photo Consent Given', type: 'checkbox', defaultValue: false },
    { name: 'display_photo', label: 'Display Photo Publicly', type: 'checkbox', defaultValue: true },
    { name: 'display_name', label: 'Display Full Name', type: 'checkbox', defaultValue: true },
    { name: 'display_title', label: 'Display Title', type: 'checkbox', defaultValue: true },
    { name: 'display_company', label: 'Display Company', type: 'checkbox', defaultValue: true },
    { name: 'featured', label: 'Mark as Featured', type: 'checkbox', defaultValue: false },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'published', options: ['published', 'draft'] }
  ],
  achievements: [
    { name: 'title', label: 'Achievement Title', type: 'text', required: true, placeholder: 'e.g. 1st Place at Stanford Hackathon' },
    { name: 'category', label: 'Category', type: 'text', placeholder: 'e.g. Award, Certification, Publication' },
    { name: 'short_description', label: 'Short Description', type: 'textarea', required: true, placeholder: 'Briefly describe this achievement...' },
    { name: 'full_description', label: 'Full Description (optional)', type: 'textarea', placeholder: 'Tell the complete story, context, and impact...' },
    { name: 'featured_image', label: 'Featured Image', type: 'image', placeholder: 'Upload or paste image URL' },
    { name: 'organization', label: 'Awarding Organization (optional)', type: 'text', placeholder: 'e.g. Stanford University' },
    { name: 'date', label: 'Date / Year', type: 'text', placeholder: 'e.g. Fall 2025' },
    { name: 'location', label: 'Location (optional)', type: 'text', placeholder: 'e.g. San Francisco, CA' },
    { name: 'role', label: 'My Role (optional)', type: 'text', placeholder: 'e.g. Team Lead, Solo Participant' },
    { name: 'impact', label: 'Impact (optional)', type: 'textarea', placeholder: 'Quantifiable results or significance...' },
    { name: 'why_it_matters', label: 'Why It Matters (optional)', type: 'textarea', placeholder: 'Why is this achievement meaningful to you?' },
    { name: 'verification_url', label: 'Verification URL (optional)', type: 'text', placeholder: 'e.g. https://certificate-link.com' },
    { name: 'external_url', label: 'External URL (optional)', type: 'text', placeholder: 'e.g. https://press-release-link.com' },
    { name: 'featured', label: 'Mark as Featured', type: 'checkbox', defaultValue: false },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'published', options: ['published', 'draft'] }
  ],
  events: [
    { name: 'title', label: 'Event Title', type: 'text', required: true, placeholder: 'e.g. Next.js Conf 2026' },
    { name: 'category', label: 'Category', type: 'text', required: true, placeholder: 'e.g. Conferences, Hackathons, Meetups' },
    { name: 'organizer', label: 'Organizer', type: 'text', placeholder: 'e.g. Vercel' },
    { name: 'cover_image_url', label: 'Cover Image', type: 'image', placeholder: 'Upload or paste image URL' },
    { name: 'date', label: 'Event Date', type: 'text', placeholder: 'e.g. March 15, 2026' },
    { name: 'format', label: 'Format', type: 'select', defaultValue: 'Physical', options: ['Physical', 'Virtual', 'Hybrid'] },
    { name: 'location', label: 'Location / Venue', type: 'text', placeholder: 'e.g. Moscone Center, San Francisco' },
    { name: 'city', label: 'City (optional)', type: 'text', placeholder: 'e.g. San Francisco' },
    { name: 'country', label: 'Country (optional)', type: 'text', placeholder: 'e.g. USA' },
    { name: 'website_url', label: 'Event Website (optional)', type: 'text', placeholder: 'e.g. https://event.com' },
    { name: 'participation_type', label: 'My Role / Participation', type: 'select', defaultValue: 'Attendee', options: ['Attendee', 'Speaker', 'Panelist', 'Organizer', 'Volunteer', 'Mentor', 'Judge', 'Exhibitor'] },
    { name: 'short_description', label: 'Short Description', type: 'textarea', placeholder: 'Brief overview of the event...' },
    { name: 'my_experience', label: 'My Experience (optional)', type: 'textarea', placeholder: 'Describe your personal experience at this event...' },
    { name: 'featured', label: 'Mark as Featured', type: 'checkbox', defaultValue: false },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'published', options: ['published', 'draft'] }
  ]
};

const getSingularCapitalized = (pluralName: string) => {
  if (pluralName === 'education') return 'Education Entry';
  if (pluralName === 'experience') return 'Experience Entry';
  if (pluralName === 'testimonials') return 'Testimonial';
  if (pluralName === 'achievements') return 'Achievement';
  if (pluralName === 'skills') return 'Skill';
  if (pluralName === 'events') return 'Event';
  if (pluralName === 'blog') return 'Blog Post';
  if (pluralName.endsWith('s')) return pluralName.slice(0, -1).replace(/^\w/, c => c.toUpperCase());
  return pluralName.replace(/^\w/, c => c.toUpperCase());
};

export function AddRecordModal({ isOpen, onClose, pageName, onSuccess }: AddRecordModalProps) {
  const schema = SCHEMAS[pageName];
  const [mounted, setMounted] = useState(false);
  
  // Initialize form state
  const getInitialState = () => {
    if (!schema) return {};
    const state: any = {};
    schema.forEach(field => {
      state[field.name] = field.defaultValue !== undefined ? field.defaultValue : '';
    });
    return state;
  };

  const [formData, setFormData] = useState<any>(getInitialState());
  // tagInputs stores the current comma-sep string for each 'tags' field before conversion
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
      setTagInputs({});
      setErrorMsg(null);
    }
  }, [isOpen, pageName]);

  if (!isOpen || !schema || !mounted || typeof window === 'undefined' || !document?.body) return null;

  const handleTagInput = (name: string, value: string) => {
    setTagInputs(prev => ({ ...prev, [name]: value }));
    // Live-sync to formData as an array
    handleInputChange(name, value.split(',').map(t => t.trim()).filter(Boolean));
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev: any) => {
      const next = { ...prev, [name]: value };
      
      // Auto slug generation for blog
      if (pageName === 'blog' && name === 'title') {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }
      
      return next;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingField(fieldName);
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('folder', `/${pageName}`);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/media`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: uploadData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const resData = await res.json();
      
      const fullUrl = getFileUrl(resData.data.file_path);
      handleInputChange(fieldName, fullUrl);
    } catch (error) {
      console.error(error);
      alert('Failed to upload file');
    } finally {
      setUploadingField(null);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    // Map the endpoint
    const endpoint = `/${pageName}`;

    // Formatting checks
    let payload = { ...formData };
    if (payload.external_link && !payload.external_link.match(/^https?:\/\//)) {
      payload.external_link = `https://${payload.external_link}`;
    }

    // Convert any remaining tag strings to arrays
    if (schema) {
      schema.forEach(field => {
        if (field.isArray && typeof payload[field.name] === 'string') {
          payload[field.name] = payload[field.name]
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean);
        } else if (field.isArray && !Array.isArray(payload[field.name])) {
          payload[field.name] = [];
        }
      });
    }

    try {
      await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to create record. Please check validation requirements.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] my-8 relative z-[100000] animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5 relative z-10">
          <div>
            <h3 className="text-xl font-bold text-white text-left m-0 p-0 leading-normal block">Add New {getSingularCapitalized(pageName)}</h3>
            <p className="text-xs text-text-light/50 mt-1 text-left font-semibold leading-normal block">Enter data directly into your {pageName} collection</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-text-light/60 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 w-8 h-8 flex items-center justify-center shrink-0 border-0 bg-transparent"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm px-4 py-3 rounded-xl flex items-start gap-2.5">
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {schema.map(field => {
              const isFullWidth = field.type === 'textarea' || field.type === 'tags' ||
                ['description', 'content', 'full_description', 'short_description', 'short_summary',
                 'problem', 'solution', 'outcomes', 'lessons_learned', 'impact',
                 'why_it_matters', 'my_experience', 'seo_description'].includes(field.name);
              
              return (
                <div 
                  key={field.name}
                  className={`${isFullWidth ? 'md:col-span-2' : 'md:col-span-1'} space-y-1.5`}
                >
                  <label className="block text-sm font-semibold text-text-light">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>

                  {field.type === 'text' && (
                    <input
                      type="text"
                      required={field.required}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={e => handleInputChange(field.name, e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary/50 transition-colors focus:ring-1 focus:ring-primary/50 text-sm"
                    />
                  )}

                  {field.type === 'textarea' && (
                    <textarea
                      required={field.required}
                      rows={5}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={e => handleInputChange(field.name, e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary/50 transition-colors focus:ring-1 focus:ring-primary/50 font-sans text-sm"
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      value={formData[field.name] || ''}
                      onChange={e => handleInputChange(field.name, e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary/50 transition-colors text-sm"
                    >
                      {field.options?.map(opt => (
                        <option key={opt} value={opt} className="bg-slate-950">{opt.toUpperCase()}</option>
                      ))}
                    </select>
                  )}

                  {field.type === 'checkbox' && (
                    <div className="flex items-center gap-3 py-2">
                      <input
                        type="checkbox"
                        id={`modal-chk-${field.name}`}
                        checked={!!formData[field.name]}
                        onChange={e => handleInputChange(field.name, e.target.checked)}
                        className="w-5 h-5 rounded bg-slate-950 border-white/10 text-primary focus:ring-primary/50"
                      />
                      <label htmlFor={`modal-chk-${field.name}`} className="text-sm font-medium text-text-light cursor-pointer select-none">
                        Yes, enable this setting
                      </label>
                    </div>
                  )}

                  {field.type === 'slider' && (
                    <div className="space-y-2 py-1">
                      <div className="flex justify-between text-xs text-text-light/70 font-semibold">
                        <span>Min</span>
                        <span className="text-primary font-bold text-sm">{formData[field.name]}%</span>
                        <span>Max</span>
                      </div>
                      <input
                        type="range"
                        min={field.min || 1}
                        max={field.max || 100}
                        value={formData[field.name] || 50}
                        onChange={e => handleInputChange(field.name, parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  )}

                  {field.type === 'tags' && (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={tagInputs[field.name] ?? (Array.isArray(formData[field.name]) ? formData[field.name].join(', ') : '')}
                        onChange={e => handleTagInput(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary/50 transition-colors focus:ring-1 focus:ring-primary/50 text-sm"
                      />
                      {Array.isArray(formData[field.name]) && formData[field.name].length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {formData[field.name].map((tag: string, i: number) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-primary/15 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary/20">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {field.type === 'image' && (
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        {formData[field.name] && (
                          <img 
                            src={formData[field.name]} 
                            alt="Preview" 
                            className="w-12 h-12 rounded object-cover border border-white/10 bg-slate-950 shrink-0 shadow" 
                          />
                        )}
                        <input
                          type="text"
                          required={field.required}
                          value={formData[field.name] || ''}
                          onChange={e => handleInputChange(field.name, e.target.value)}
                          className="flex-1 min-w-0 bg-slate-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary/50 transition-colors focus:ring-1 focus:ring-primary/50 text-sm"
                          placeholder={field.placeholder}
                        />
                        <label className="cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-3 rounded-xl transition-colors whitespace-nowrap flex items-center justify-center shrink-0 text-sm font-semibold select-none">
                          {uploadingField === field.name ? 'Uploading...' : 'Upload'}
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={e => handleFileUpload(e, field.name)}
                            disabled={uploadingField !== null}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/5 bg-white/5 flex gap-4 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-text-light/80 hover:text-white bg-transparent hover:bg-white/5 transition-all text-sm font-semibold border border-white/10"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-bg-dark font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-bg-dark border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                Create {getSingularCapitalized(pageName)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
