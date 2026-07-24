'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';

export default function AdminContactSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Email Notifications
    notification_email: '',
    send_admin_notification: true,
    send_auto_reply: false,
    auto_reply_subject: 'Thanks for contacting me!',
    auto_reply_message: 'Thank you for reaching out. I have received your message and will get back to you as soon as possible.',
    
    // Spam Protection
    enable_rate_limiting: true,
    max_submissions_per_hour: 5,
    enable_honeypot: true,
    blocked_domains: '',
    
    // Privacy & Data
    store_ip_address: false,
    data_retention_days: 90,
    show_privacy_notice: true,
    privacy_notice_text: 'Your information will be kept confidential and used solely for responding to your inquiry.',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetchApi('/settings');
      if (res.success && res.data) {
        setFormData(prev => ({
          ...prev,
          ...res.data,
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
      alert('Contact settings saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save contact settings');
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
        <h1 className="text-3xl font-bold mb-2">Contact Settings</h1>
        <p className="text-text-light/70">
          Configure email notifications, spam protection, and privacy settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Email Notifications */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📧</span> Email Notifications
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Notification Email Address
              </label>
              <input
                type="email"
                value={formData.notification_email}
                onChange={(e) => handleChange('notification_email', e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-text-light/50 mt-1">
                You'll receive notifications when someone submits the contact form
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.send_admin_notification}
                onChange={(e) => handleChange('send_admin_notification', e.target.checked)}
                className="w-4 h-4"
              />
              <div>
                <span className="font-semibold">Send admin notification on new message</span>
                <p className="text-sm text-text-light/60">
                  Get an email alert when a new contact message is received
                </p>
              </div>
            </label>

            <div className="pt-4 border-t border-white/10">
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={formData.send_auto_reply}
                  onChange={(e) => handleChange('send_auto_reply', e.target.checked)}
                  className="w-4 h-4"
                />
                <div>
                  <span className="font-semibold">Send auto-reply to visitor</span>
                  <p className="text-sm text-text-light/60">
                    Automatically send a confirmation email to the person who submitted the form
                  </p>
                </div>
              </label>

              {formData.send_auto_reply && (
                <div className="space-y-4 ml-7">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Auto-Reply Subject
                    </label>
                    <input
                      type="text"
                      value={formData.auto_reply_subject}
                      onChange={(e) => handleChange('auto_reply_subject', e.target.value)}
                      placeholder="Thanks for contacting me!"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Auto-Reply Message
                    </label>
                    <textarea
                      rows={4}
                      value={formData.auto_reply_message}
                      onChange={(e) => handleChange('auto_reply_message', e.target.value)}
                      placeholder="Thank you for reaching out..."
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Spam Protection */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🛡️</span> Spam Protection
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enable_rate_limiting}
                onChange={(e) => handleChange('enable_rate_limiting', e.target.checked)}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <span className="font-semibold">Enable rate limiting</span>
                <p className="text-sm text-text-light/60">
                  Limit the number of submissions from the same IP address
                </p>
              </div>
            </label>

            {formData.enable_rate_limiting && (
              <div className="ml-7">
                <label className="block text-sm font-semibold mb-2">
                  Max Submissions Per Hour
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.max_submissions_per_hour}
                  onChange={(e) => handleChange('max_submissions_per_hour', parseInt(e.target.value))}
                  className="w-32 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                />
              </div>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enable_honeypot}
                onChange={(e) => handleChange('enable_honeypot', e.target.checked)}
                className="w-4 h-4"
              />
              <div>
                <span className="font-semibold">Enable honeypot field</span>
                <p className="text-sm text-text-light/60">
                  Add an invisible field to catch spam bots (recommended)
                </p>
              </div>
            </label>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Blocked Email Domains (comma-separated)
              </label>
              <input
                type="text"
                value={formData.blocked_domains}
                onChange={(e) => handleChange('blocked_domains', e.target.value)}
                placeholder="spam.com, fake-email.net"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-text-light/50 mt-1">
                Submissions from these domains will be automatically rejected
              </p>
            </div>
          </div>
        </div>

        {/* Privacy & Data Management */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🔒</span> Privacy & Data Management
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.store_ip_address}
                onChange={(e) => handleChange('store_ip_address', e.target.checked)}
                className="w-4 h-4"
              />
              <div>
                <span className="font-semibold">Store visitor IP addresses</span>
                <p className="text-sm text-text-light/60">
                  Log IP addresses for spam prevention (may require privacy disclosure)
                </p>
              </div>
            </label>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Data Retention Period (days)
              </label>
              <input
                type="number"
                min="30"
                max="365"
                value={formData.data_retention_days}
                onChange={(e) => handleChange('data_retention_days', parseInt(e.target.value))}
                className="w-32 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-text-light/50 mt-1">
                Messages older than this will be automatically deleted
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={formData.show_privacy_notice}
                  onChange={(e) => handleChange('show_privacy_notice', e.target.checked)}
                  className="w-4 h-4"
                />
                <div>
                  <span className="font-semibold">Show privacy notice</span>
                  <p className="text-sm text-text-light/60">
                    Display a privacy message below the contact form
                  </p>
                </div>
              </label>

              {formData.show_privacy_notice && (
                <div className="ml-7">
                  <label className="block text-sm font-semibold mb-2">
                    Privacy Notice Text
                  </label>
                  <textarea
                    rows={2}
                    value={formData.privacy_notice_text}
                    onChange={(e) => handleChange('privacy_notice_text', e.target.value)}
                    placeholder="Your information will be kept confidential..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SMTP Configuration Alert */}
        <div className="glass p-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/5">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-yellow-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            SMTP Configuration Required
          </h3>
          <p className="text-sm text-text-light/70">
            Email notifications require SMTP configuration in your backend .env file:
          </p>
          <pre className="mt-3 p-3 bg-gray-900 rounded-lg text-xs font-mono text-gray-400 overflow-x-auto">
            {`SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
SMTP_FROM=your@email.com`}
          </pre>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Contact Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
