'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';

export default function AdminContactInfo() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lockedFields, setLockedFields] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    // Hero Section
    hero_title: '',
    hero_subtitle: '',
    hero_description: '',
    hero_image: '',

    // Introduction
    intro_title: '',
    intro_description: '',
    intro_image: '',

    // Contact Information
    contact_email: '',
    contact_phone: '',
    contact_location: '',
    contact_address: '',
    show_email: true,
    show_phone: true,
    show_location: true,
    show_address: false,
    preferred_method: '',

    // Availability
    availability_status: 'available',
    availability_message: '',

    // Response Information
    response_title: '',
    response_description: '',
    expected_response_time: '',

    // CTA
    cta_title: '',
    cta_description: '',
    cta_button_text: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetchApi('/settings');
      if (res.success && res.data) {
        // Convert string booleans to actual booleans
        const loadedData = {
          hero_title: res.data.hero_title || '',
          hero_subtitle: res.data.hero_subtitle || '',
          hero_description: res.data.hero_description || '',
          hero_image: res.data.hero_image || '',
          intro_title: res.data.intro_title || '',
          intro_description: res.data.intro_description || '',
          intro_image: res.data.intro_image || '',
          contact_email: res.data.contact_email || '',
          contact_phone: res.data.contact_phone || '',
          contact_location: res.data.contact_location || '',
          contact_address: res.data.contact_address || '',
          show_email: res.data.show_email === 'true' || res.data.show_email === true,
          show_phone: res.data.show_phone === 'true' || res.data.show_phone === true,
          show_location: res.data.show_location === 'true' || res.data.show_location === true,
          show_address: res.data.show_address === 'true' || res.data.show_address === true,
          preferred_method: res.data.preferred_method || '',
          availability_status: res.data.availability_status || 'available',
          availability_message: res.data.availability_message || '',
          response_title: res.data.response_title || '',
          response_description: res.data.response_description || '',
          expected_response_time: res.data.expected_response_time || '',
          cta_title: res.data.cta_title || '',
          cta_description: res.data.cta_description || '',
          cta_button_text: res.data.cta_button_text || '',
        };

        setFormData(loadedData);

        // Lock all fields by default
        const locks: Record<string, boolean> = {};
        Object.keys(loadedData).forEach(field => locks[field] = true);
        setLockedFields(locks);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLock = (field: string) => {
    setLockedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const unlockAll = () => {
    const allFields = Object.keys(formData);
    const locks: Record<string, boolean> = {};
    allFields.forEach(field => locks[field] = false);
    setLockedFields(locks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Convert booleans to strings for storage
      const dataToSave = {
        ...formData,
        show_email: formData.show_email.toString(),
        show_phone: formData.show_phone.toString(),
        show_location: formData.show_location.toString(),
        show_address: formData.show_address.toString(),
      };

      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify(dataToSave),
      });
      alert('Contact information saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save contact information');
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
        <h1 className="text-3xl font-bold mb-2">Contact Information</h1>
        <p className="text-text-light/70">
          Configure how visitors can reach you and what they see on the contact page
        </p>
      </div>

      {/* Unlock All Button */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-text-light/70">
          <span className="font-semibold">Tip:</span> Fields are locked by default. Click the lock icon or "Unlock All" to edit.
        </div>
        <button
          type="button"
          onClick={unlockAll}
          className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition font-semibold text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
          Unlock All Fields
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Section */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🎯</span> Hero Section
          </h2>
          <div className="space-y-4">
            {/* Title Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold">Title</label>
                <button
                  type="button"
                  onClick={() => toggleLock('hero_title')}
                  className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition flex items-center gap-1"
                >
                  {lockedFields.hero_title ? (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Locked
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      Unlocked
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={formData.hero_title}
                onChange={(e) => handleChange('hero_title', e.target.value)}
                disabled={lockedFields.hero_title}
                placeholder="Let's Connect"
                className={`w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary ${lockedFields.hero_title ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Subtitle Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold">Subtitle</label>
                <button
                  type="button"
                  onClick={() => toggleLock('hero_subtitle')}
                  className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition flex items-center gap-1"
                >
                  {lockedFields.hero_subtitle ? (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Locked
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      Unlocked
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={formData.hero_subtitle}
                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                disabled={lockedFields.hero_subtitle}
                placeholder="Get In Touch"
                className={`w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary ${lockedFields.hero_subtitle ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Description Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold">Description</label>
                <button
                  type="button"
                  onClick={() => toggleLock('hero_description')}
                  className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition flex items-center gap-1"
                >
                  {lockedFields.hero_description ? (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Locked
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      Unlocked
                    </>
                  )}
                </button>
              </div>
              <textarea
                rows={3}
                value={formData.hero_description}
                onChange={(e) => handleChange('hero_description', e.target.value)}
                disabled={lockedFields.hero_description}
                placeholder="Have an opportunity, project idea, or collaboration in mind?"
                className={`w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary ${lockedFields.hero_description ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>👋</span> Introduction Section
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Section Title</label>
              <input
                type="text"
                value={formData.intro_title}
                onChange={(e) => handleChange('intro_title', e.target.value)}
                placeholder="Let's Start a Conversation"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                rows={3}
                value={formData.intro_description}
                onChange={(e) => handleChange('intro_description', e.target.value)}
                placeholder="Whether you're interested in working together..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📞</span> Contact Details
          </h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                />
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.show_email}
                    onChange={(e) => handleChange('show_email', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Show on contact page</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  placeholder="+254 XXX XXX XXX"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                />
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.show_phone}
                    onChange={(e) => handleChange('show_phone', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Show on contact page</span>
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Location (City, Country)</label>
                <input
                  type="text"
                  value={formData.contact_location}
                  onChange={(e) => handleChange('contact_location', e.target.value)}
                  placeholder="Nairobi, Kenya"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                />
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.show_location}
                    onChange={(e) => handleChange('show_location', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Show on contact page</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Physical Address (Optional)</label>
                <input
                  type="text"
                  value={formData.contact_address}
                  onChange={(e) => handleChange('contact_address', e.target.value)}
                  placeholder="123 Street Name"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                />
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.show_address}
                    onChange={(e) => handleChange('show_address', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Show on contact page</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Preferred Contact Method</label>
              <input
                type="text"
                value={formData.preferred_method}
                onChange={(e) => handleChange('preferred_method', e.target.value)}
                placeholder="Email"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-text-light/50 mt-1">
                e.g., "Email", "Phone", "WhatsApp", "LinkedIn"
              </p>
            </div>
          </div>
        </div>

        {/* Availability Status */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🟢</span> Availability Status
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Current Status</label>
              <select
                value={formData.availability_status}
                onChange={(e) => handleChange('availability_status', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              >
                <option value="available">Available</option>
                <option value="open_to_opportunities">Open to Opportunities</option>
                <option value="available_for_freelance">Available for Freelance</option>
                <option value="available_for_collaboration">Available for Collaboration</option>
                <option value="limited_availability">Limited Availability</option>
                <option value="currently_unavailable">Currently Unavailable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Availability Message</label>
              <textarea
                rows={2}
                value={formData.availability_message}
                onChange={(e) => handleChange('availability_message', e.target.value)}
                placeholder="Currently open to selected freelance projects and collaborations."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Response Information */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>⏱️</span> Response Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Section Title</label>
              <input
                type="text"
                value={formData.response_title}
                onChange={(e) => handleChange('response_title', e.target.value)}
                placeholder="Response Time"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                rows={2}
                value={formData.response_description}
                onChange={(e) => handleChange('response_description', e.target.value)}
                placeholder="I typically respond within..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Expected Response Time</label>
              <input
                type="text"
                value={formData.expected_response_time}
                onChange={(e) => handleChange('expected_response_time', e.target.value)}
                placeholder="1-3 business days"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🎯</span> Call-to-Action
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">CTA Title</label>
              <input
                type="text"
                value={formData.cta_title}
                onChange={(e) => handleChange('cta_title', e.target.value)}
                placeholder="Ready to Work Together?"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">CTA Description</label>
              <textarea
                rows={2}
                value={formData.cta_description}
                onChange={(e) => handleChange('cta_description', e.target.value)}
                placeholder="Let's connect and discuss your project..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Button Text</label>
              <input
                type="text"
                value={formData.cta_button_text}
                onChange={(e) => handleChange('cta_button_text', e.target.value)}
                placeholder="Send Message"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
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
            {saving ? 'Saving...' : 'Save Contact Information'}
          </button>
        </div>
      </form>
    </div>
  );
}
