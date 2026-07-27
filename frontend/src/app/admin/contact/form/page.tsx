'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';

export default function AdminContactForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Form Status
    form_enabled: true,

    // Form Fields Configuration
    require_name: true,
    require_email: true,
    require_subject: false,
    require_phone: false,
    require_message: true,

    // Additional Fields
    show_organization: false,
    show_website: false,
    show_budget: false,

    // Reason for Contact Options (comma-separated)
    contact_reasons: 'General Inquiry,Job Opportunity,Freelance Project,Collaboration,Partnership,Speaking / Event,Mentorship,Feedback,Other',

    // Success Message
    success_message: 'Thank you for reaching out! Your message has been received. I\'ll get back to you as soon as possible.',

    // Redirect After Submission
    redirect_after_submit: false,
    redirect_url: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetchApi('/settings');
      if (res.success && res.data) {
        const data = res.data;
        setFormData(prev => ({
          ...prev,
          ...data,
          // Ensure boolean fields are properly coerced
          form_enabled: data.form_enabled === true || data.form_enabled === 'true',
          require_name: data.require_name === true || data.require_name === 'true',
          require_email: data.require_email === true || data.require_email === 'true',
          require_subject: data.require_subject === true || data.require_subject === 'true',
          require_phone: data.require_phone === true || data.require_phone === 'true',
          require_message: data.require_message === true || data.require_message === 'true',
          show_organization: data.show_organization === true || data.show_organization === 'true',
          show_website: data.show_website === true || data.show_website === 'true',
          show_budget: data.show_budget === true || data.show_budget === 'true',
          redirect_after_submit: data.redirect_after_submit === true || data.redirect_after_submit === 'true',
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      alert('Contact form settings saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save contact form settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contact Form Configuration</h1>
        <p className="text-text-light/70">
          Customize the contact form fields, validation rules, and submission behavior
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Form Status */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🔄</span> Form Status
          </h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.form_enabled}
              onChange={(e) => handleChange('form_enabled', e.target.checked)}
              className="w-5 h-5"
            />
            <div>
              <span className="font-semibold">Enable Contact Form</span>
              <p className="text-sm text-text-light/60">
                When disabled, the contact form will not be displayed on the contact page
              </p>
            </div>
          </label>
        </div>

        {/* Required Fields */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>✅</span> Required Fields
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_name}
                onChange={(e) => handleChange('require_name', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Require Name</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_email}
                onChange={(e) => handleChange('require_email', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Require Email</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_subject}
                onChange={(e) => handleChange('require_subject', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Require Subject</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_phone}
                onChange={(e) => handleChange('require_phone', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Require Phone Number</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.require_message}
                onChange={(e) => handleChange('require_message', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Require Message</span>
            </label>
          </div>
        </div>

        {/* Additional Optional Fields */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>➕</span> Additional Fields (Optional)
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.show_organization}
                onChange={(e) => handleChange('show_organization', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Show Organization/Company Field</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.show_website}
                onChange={(e) => handleChange('show_website', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Show Website Field</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.show_budget}
                onChange={(e) => handleChange('show_budget', e.target.checked)}
                className="w-4 h-4"
              />
              <span>Show Budget/Timeline Field</span>
            </label>
          </div>
        </div>

        {/* Reason for Contact */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📋</span> Reason for Contact Options
          </h2>
          <div>
            <label className="block text-sm font-semibold mb-2">
              Contact Reasons (comma-separated)
            </label>
            <textarea
              rows={3}
              value={formData.contact_reasons}
              onChange={(e) => handleChange('contact_reasons', e.target.value)}
              placeholder="General Inquiry,Job Opportunity,Freelance Project"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-text-light/50 mt-1">
              These options will appear in a dropdown for visitors to select why they're contacting you
            </p>
          </div>
        </div>

        {/* Submission Behavior */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🎯</span> Submission Behavior
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Success Message
              </label>
              <textarea
                rows={3}
                value={formData.success_message}
                onChange={(e) => handleChange('success_message', e.target.value)}
                placeholder="Thank you for reaching out..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-text-light/50 mt-1">
                Message shown to visitors after successful form submission
              </p>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={formData.redirect_after_submit}
                  onChange={(e) => handleChange('redirect_after_submit', e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Redirect to a page after submission</span>
              </label>

              {formData.redirect_after_submit && (
                <input
                  type="text"
                  value={formData.redirect_url}
                  onChange={(e) => handleChange('redirect_url', e.target.value)}
                  placeholder="/thank-you"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                />
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Form Settings'}
          </button>
        </div>
      </form>

      {/* Preview Section */}
      <div className="mt-8 glass p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Preview Your Contact Form
        </h3>
        <p className="text-sm text-text-light/70 mb-4">
          Visit your <a href="/contact" target="_blank" className="text-primary hover:underline">Contact Page</a> to see how the form looks with your current settings
        </p>
      </div>
    </div>
  );
}
