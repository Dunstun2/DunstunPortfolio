'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea';
  placeholder?: string;
  rows?: number;
}

interface PageConfig {
  name: string;
  label: string;
  fields: FieldConfig[];
}

const PAGE_CONFIGS: PageConfig[] = [
  {
    name: 'services',
    label: 'Services',
    fields: [
      { key: 'section_title', label: 'Section Title (Homepage)', type: 'text', placeholder: 'What I Offer' },
      { key: 'section_subtitle', label: 'Section Subtitle (Homepage)', type: 'textarea', rows: 2 },
      { key: 'page_title', label: 'Page Title', type: 'text', placeholder: 'My Services' },
      { key: 'page_subtitle', label: 'Page Subtitle', type: 'textarea', rows: 2 },
      { key: 'cta_title', label: 'CTA Title', type: 'text', placeholder: 'Need a Custom Solution?' },
      { key: 'cta_description', label: 'CTA Description', type: 'textarea', rows: 3 },
      { key: 'cta_button_text', label: 'CTA Button Text', type: 'text', placeholder: 'Get in Touch' },
      { key: 'detail_cta_title', label: 'Detail Page CTA Title', type: 'text' },
      { key: 'detail_cta_description', label: 'Detail Page CTA Description', type: 'textarea', rows: 3 },
      { key: 'empty_message', label: 'Empty State Message', type: 'text', placeholder: 'No services available' },
    ]
  },
  {
    name: 'projects',
    label: 'Projects',
    fields: [
      { key: 'section_title', label: 'Section Title (Homepage)', type: 'text', placeholder: 'Featured Projects' },
      { key: 'page_title', label: 'Page Title', type: 'text', placeholder: 'My Projects' },
      { key: 'page_subtitle', label: 'Page Subtitle', type: 'textarea', rows: 2 },
      { key: 'cta_title', label: 'CTA Title', type: 'text', placeholder: 'Have a Project in Mind?' },
      { key: 'cta_description', label: 'CTA Description', type: 'textarea', rows: 3 },
      { key: 'cta_button_text', label: 'CTA Button Text', type: 'text', placeholder: 'Start a Project' },
      { key: 'detail_cta_title', label: 'Detail Page CTA Title', type: 'text' },
      { key: 'detail_cta_description', label: 'Detail Page CTA Description', type: 'textarea', rows: 3 },
      { key: 'empty_message', label: 'Empty State Message', type: 'text', placeholder: 'No projects found' },
    ]
  },
  {
    name: 'skills',
    label: 'Skills',
    fields: [
      { key: 'section_title', label: 'Section Title (Homepage)', type: 'text', placeholder: 'Technical Skills' },
      { key: 'page_title', label: 'Page Title', type: 'text', placeholder: 'Skills & Expertise' },
      { key: 'page_subtitle', label: 'Page Subtitle', type: 'textarea', rows: 2 },
      { key: 'cta_title', label: 'CTA Title', type: 'text', placeholder: 'Looking for These Skills?' },
      { key: 'cta_description', label: 'CTA Description', type: 'textarea', rows: 3 },
      { key: 'cta_button_text', label: 'CTA Button Text', type: 'text', placeholder: 'Let\'s Talk' },
      { key: 'empty_message', label: 'Empty State Message', type: 'text', placeholder: 'No skills listed' },
    ]
  },
  {
    name: 'experience',
    label: 'Experience',
    fields: [
      { key: 'section_title', label: 'Section Title (Homepage)', type: 'text', placeholder: 'Work Experience' },
      { key: 'page_title', label: 'Page Title', type: 'text', placeholder: 'Professional Journey' },
      { key: 'page_subtitle', label: 'Page Subtitle', type: 'textarea', rows: 2 },
      { key: 'cta_title', label: 'CTA Title', type: 'text', placeholder: 'Let\'s Work Together' },
      { key: 'cta_description', label: 'CTA Description', type: 'textarea', rows: 3 },
      { key: 'cta_button_text', label: 'CTA Button Text', type: 'text', placeholder: 'Get in Touch' },
      { key: 'empty_message', label: 'Empty State Message', type: 'text', placeholder: 'No experience entries' },
    ]
  },
  {
    name: 'education',
    label: 'Education',
    fields: [
      { key: 'section_title', label: 'Section Title (Homepage)', type: 'text', placeholder: 'Academic Education' },
      { key: 'page_title', label: 'Page Title', type: 'text', placeholder: 'Education & Learning' },
      { key: 'page_subtitle', label: 'Page Subtitle', type: 'textarea', rows: 2 },
      { key: 'cta_title', label: 'CTA Title', type: 'text', placeholder: 'Interested in Collaboration?' },
      { key: 'cta_description', label: 'CTA Description', type: 'textarea', rows: 3 },
      { key: 'cta_button_text', label: 'CTA Button Text', type: 'text', placeholder: 'Contact Me' },
      { key: 'empty_message', label: 'Empty State Message', type: 'text', placeholder: 'No education entries' },
    ]
  },
  {
    name: 'testimonials',
    label: 'Testimonials',
    fields: [
      { key: 'section_title', label: 'Section Title (Homepage)', type: 'text', placeholder: 'Client & Peer Feedback' },
      { key: 'page_title', label: 'Page Title', type: 'text', placeholder: 'What People Say' },
      { key: 'page_subtitle', label: 'Page Subtitle', type: 'textarea', rows: 2 },
      { key: 'cta_title', label: 'CTA Title', type: 'text', placeholder: 'Want to Share Your Experience?' },
      { key: 'cta_description', label: 'CTA Description', type: 'textarea', rows: 3 },
      { key: 'cta_button_text', label: 'CTA Button Text', type: 'text', placeholder: 'Leave a Testimonial' },
      { key: 'empty_message', label: 'Empty State Message', type: 'text', placeholder: 'No testimonials yet' },
    ]
  },
  {
    name: 'contact',
    label: 'Contact',
    fields: [
      { key: 'section_title', label: 'Section Title (Homepage)', type: 'text', placeholder: 'Get In Touch' },
      { key: 'page_title', label: 'Page Title', type: 'text', placeholder: 'Let\'s Connect' },
      { key: 'page_subtitle', label: 'Page Subtitle', type: 'textarea', rows: 2 },
      { key: 'info_title', label: 'Contact Info Title', type: 'text' },
      { key: 'info_description', label: 'Contact Info Description', type: 'textarea', rows: 2 },
      { key: 'form_title', label: 'Form Title', type: 'text' },
      { key: 'form_description', label: 'Form Description', type: 'textarea', rows: 2 },
      { key: 'submit_button_text', label: 'Submit Button Text', type: 'text', placeholder: 'Send Message' },
      { key: 'success_message', label: 'Success Message', type: 'text' },
      { key: 'social_title', label: 'Social Links Title', type: 'text' },
      { key: 'social_description', label: 'Social Links Description', type: 'textarea', rows: 2 },
    ]
  },
  {
    name: 'about',
    label: 'About',
    fields: [
      { key: 'section_title', label: 'Section Title (Homepage)', type: 'text', placeholder: 'About Me' },
      { key: 'section_button_text', label: 'Section Button Text', type: 'text', placeholder: 'Discover My Journey' },
      { key: 'page_title', label: 'Page Title', type: 'text', placeholder: 'About Me' },
      { key: 'page_subtitle', label: 'Page Subtitle', type: 'textarea', rows: 2 },
      { key: 'mission_title', label: 'Mission Title', type: 'text' },
      { key: 'mission_description', label: 'Mission Description', type: 'textarea', rows: 3 },
      { key: 'values_title', label: 'Values Title', type: 'text' },
      { key: 'values_description', label: 'Values Description', type: 'textarea', rows: 3 },
      { key: 'cta_title', label: 'CTA Title', type: 'text' },
      { key: 'cta_description', label: 'CTA Description', type: 'textarea', rows: 3 },
      { key: 'cta_button_text', label: 'CTA Button Text', type: 'text', placeholder: 'Get in Touch' },
    ]
  },
  {
    name: 'blog',
    label: 'Blog',
    fields: [
      { key: 'page_title', label: 'Page Title', type: 'text', placeholder: 'Insights, Ideas & Experiences' },
      { key: 'page_subtitle', label: 'Page Subtitle', type: 'textarea', rows: 2 },
      { key: 'empty_message', label: 'Empty State Message', type: 'text', placeholder: 'No blog posts yet' },
    ]
  },
  {
    name: 'events',
    label: 'Events',
    fields: [
      { key: 'section_title', label: 'Section Title (Homepage)', type: 'text', placeholder: 'Events & Networking' },
      { key: 'page_title', label: 'Page Title', type: 'text', placeholder: 'Events & Networking' },
      { key: 'page_subtitle', label: 'Page Subtitle', type: 'textarea', rows: 2 },
      { key: 'empty_message', label: 'Empty State Message', type: 'text', placeholder: 'No upcoming events' },
    ]
  },
];

interface DynamicPageSettingsFormProps {
  settingsData: Record<string, any>;
  onSaveSuccess?: () => void;
}

export default function DynamicPageSettingsForm({ settingsData, onSaveSuccess }: DynamicPageSettingsFormProps) {
  const [selectedPage, setSelectedPage] = useState<string>('services');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get current page config
  const currentPageConfig = PAGE_CONFIGS.find(p => p.name === selectedPage);

  // Load form values when page changes or settings data changes
  useEffect(() => {
    if (currentPageConfig) {
      const values: Record<string, string> = {};
      currentPageConfig.fields.forEach(field => {
        const settingKey = `${selectedPage}_${field.key}`;
        values[field.key] = settingsData[settingKey] || '';
      });
      setFormValues(values);
    }
  }, [selectedPage, settingsData, currentPageConfig]);

  // Update form values when page selection changes
  const handlePageChange = (pageName: string) => {
    setSelectedPage(pageName);
    setMessage('');

    const pageConfig = PAGE_CONFIGS.find(p => p.name === pageName);
    if (pageConfig) {
      const values: Record<string, string> = {};
      pageConfig.fields.forEach(field => {
        const settingKey = `${pageName}_${field.key}`;
        values[field.key] = settingsData[settingKey] || '';
      });
      setFormValues(values);
    }
  };

  const handleFieldChange = (fieldKey: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(`Saving ${currentPageConfig?.label} settings...`);

    try {
      // Build settings object with proper keys
      const settingsToSave: Record<string, string> = {};
      if (currentPageConfig) {
        currentPageConfig.fields.forEach(field => {
          const settingKey = `${selectedPage}_${field.key}`;
          settingsToSave[settingKey] = formValues[field.key] || '';
        });
      }

      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsToSave)
      });

      setMessage(`✅ ${currentPageConfig?.label} settings saved successfully!`);
      setTimeout(() => setMessage(''), 3000);

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentPageConfig) {
    return <div className="text-red-400">Invalid page configuration</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Selector */}
      <div>
        <label className="block mb-2 text-sm font-medium text-muted">Select Page to Edit</label>
        <select
          value={selectedPage}
          onChange={(e) => handlePageChange(e.target.value)}
          className="w-full p-3 rounded bg-gray-900 border border-gray-700 text-white"
        >
          {PAGE_CONFIGS.map(page => (
            <option key={page.name} value={page.name}>
              {page.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded ${message.includes('Error') || message.includes('❌') ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'}`}>
          {message}
        </div>
      )}

      {/* Dynamic Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-xl font-bold text-white mb-4">
          {currentPageConfig.label} Page Settings
        </h3>

        {currentPageConfig.fields.map(field => (
          <div key={field.key}>
            <label className="block mb-2 text-sm font-medium text-muted">
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={formValues[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={field.rows || 3}
                className="w-full p-3 rounded bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition"
              />
            ) : (
              <input
                type="text"
                value={formValues[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full p-3 rounded bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition"
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-primary text-button-text rounded hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? 'Saving...' : `Save ${currentPageConfig.label} Settings`}
        </button>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded text-sm text-blue-300">
        <p className="font-medium mb-2">💡 Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Changes are saved immediately and reflected across the site</li>
          <li>Empty fields will use default values</li>
          <li>CTA sections appear at the bottom of each page</li>
          <li>Section titles are used on the homepage</li>
        </ul>
      </div>
    </div>
  );
}
