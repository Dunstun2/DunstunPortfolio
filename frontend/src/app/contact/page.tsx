'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { getSocialIcon } from '@/utils/socialIcons';

export default function ContactPage() {
  const refreshKeySettings = useRealtimeRefresh('settings');
  // Configurable Contact Hero & Info
  const [heroTitle, setHeroTitle] = useState("Let's Connect");
  const [heroSubtitle, setHeroSubtitle] = useState("Have a project, opportunity, or idea? I'd be happy to hear from you.");
  const [pageTitle, setPageTitle] = useState("Let's Connect");
  const [pageSubtitle, setPageSubtitle] = useState("Have a project in mind or want to collaborate? I'd love to hear from you");

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('Open to selected opportunities and collaborations');
  const [responseTime, setResponseTime] = useState('I typically respond within 1–3 business days.');

  // Dynamic social media links configured in central Social Accounts Manager
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);

  // Contact Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    // 1. Fetch Global Settings (Email, Phone, Location, etc.)
    fetchApi('/settings')
      .then(res => {
        if (res.data) {
          // If Settings model contains values for email/phone/location, populate them
          if (res.data.contact_email) setEmail(res.data.contact_email);
          if (res.data.contact_phone) setPhone(res.data.contact_phone);
          if (res.data.contact_location) setLocation(res.data.contact_location);
          if (res.data.contact_availability) setAvailability(res.data.contact_availability);
          if (res.data.contact_response_time) setResponseTime(res.data.contact_response_time);
          if (res.data.contact_hero_title) setHeroTitle(res.data.contact_hero_title);
          if (res.data.contact_hero_subtitle) setHeroSubtitle(res.data.contact_hero_subtitle);
          if (res.data.contact_page_title) setPageTitle(res.data.contact_page_title);
          if (res.data.contact_page_subtitle) setPageSubtitle(res.data.contact_page_subtitle);
        }
      })
      .catch(err => console.error('Failed to load contact settings:', err));

    // 2. Fetch Reusable Social Media Accounts Configured in Social Accounts Manager
    fetchApi('/social')
      .then(res => {
        if (res.success) {
          setSocialAccounts(res.data || []);
        }
      })
      .catch(err => console.error('Failed to load social accounts:', err));
  }, [refreshKeySettings]);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const validatePhone = (phone: string) => {
    // Basic phone validation: strips non-digits (excluding +) and checks length
    const digits = phone.replace(/[^0-9+]/g, '');
    return digits.length >= 7 && digits.length <= 15;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitSuccess(null);

    if (!formName || !formEmail || !formMessage) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (!validateEmail(formEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (formPhone && !validatePhone(formPhone)) {
      setFormError('Please enter a valid phone number. E.g. +254 712 345 678');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetchApi('/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          phone: formPhone || null,
          subject: formSubject || 'No Subject',
          message: formMessage
        })
      });
      if (res.success || res.data) {
        setSubmitSuccess(true);
        setFormName('');
        setFormEmail('');
        setFormPhone('');
        setFormSubject('');
        setFormMessage('');
      } else {
        setSubmitSuccess(false);
      }
    } catch (err) {
      console.error(err);
      setSubmitSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-light pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Contact Hero */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-heading-light mb-4">
            {heroTitle.includes("Connect") ? (
              <>
                <span className="text-primary">{heroTitle.substring(0, heroTitle.indexOf("Connect"))}</span>
                <span className="text-secondary">{heroTitle.substring(heroTitle.indexOf("Connect"))}</span>
              </>
            ) : (
              <span className="text-primary">{heroTitle}</span>
            )}
          </h1>
          <p className="text-text-light/80 text-lg md:text-xl leading-relaxed">
            {heroSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left Column: Direct Info & Social Accounts */}
          <div className="space-y-8">

            {/* Contact Information Card */}
            <div className="glass p-8 rounded-3xl space-y-6">
              <h2 className="text-2xl font-bold text-heading-light border-b border-text-light/10 pb-3">
                <span className="text-primary">Get In </span><span className="text-secondary">Touch</span>
              </h2>

              <div className="space-y-4">
                {email && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0">
                      📧
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-light/50 uppercase tracking-wider">Email</h4>
                      <a href={`mailto:${email}`} className="text-heading-light hover:text-primary transition-colors text-base font-medium">
                        {email}
                      </a>
                    </div>
                  </div>
                )}

                {phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0">
                      📱
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-light/50 uppercase tracking-wider">Phone</h4>
                      <a href={`tel:${phone}`} className="text-heading-light hover:text-primary transition-colors text-base font-medium">
                        {phone}
                      </a>
                    </div>
                  </div>
                )}

                {location && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0">
                      📍
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-light/50 uppercase tracking-wider">Location</h4>
                      <p className="text-heading-light text-base font-medium">{location}</p>
                    </div>
                  </div>
                )}

                {availability && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0">
                      🟢
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-light/50 uppercase tracking-wider">Availability</h4>
                      <p className="text-heading-light text-base font-medium">{availability}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media & Professional Links (Central CMS Configured) */}
            {socialAccounts.length > 0 && (
              <div className="glass p-8 rounded-3xl space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-heading-light mb-1">
                    <span className="text-primary">Find Me </span><span className="text-secondary">Online</span>
                  </h2>
                  <p className="text-text-light/75 text-xs">
                    Connect with me or explore my work across these platforms.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {socialAccounts.map((account) => (
                    <a
                      key={account.id}
                      href={account.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3.5 bg-black/20 hover:bg-primary/15 border border-text-light/10 hover:border-primary/45 rounded-2xl transition-all duration-300 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-text-light/10 flex items-center justify-center text-text-light group-hover:text-primary transition-colors">
                        {getSocialIcon(account.platform_name)}
                      </div>
                      <div className="overflow-hidden">
                        <span className="block text-heading-light text-sm font-bold truncate">
                          {account.platform_name}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Response Time Information */}
            {responseTime && (
              <div className="glass p-5 rounded-2xl text-center text-sm text-text-light/70 italic border border-text-light/5">
                {responseTime}
              </div>
            )}

          </div>

          {/* Right Column: Dynamic Contact Form */}
          <div className="glass p-8 md:p-10 rounded-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-heading-light mb-2">
              <span className="text-primary">Send Me A </span><span className="text-secondary">Message</span>
            </h2>
            <p className="text-text-light/70 text-sm mb-8">
              Feel free to drop a message, and I will get back to you as soon as possible.
            </p>

            <form onSubmit={handleSendMessage} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-text-light/65 uppercase tracking-wider mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full bg-black/35 border border-text-light/15 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-primary text-text-light"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-light/65 uppercase tracking-wider mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  className="w-full bg-black/35 border border-text-light/15 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-primary text-text-light"
                  placeholder="e.g. john@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-light/65 uppercase tracking-wider mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={e => setFormSubject(e.target.value)}
                  className="w-full bg-black/35 border border-text-light/15 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-primary text-text-light"
                  placeholder="e.g. Collaboration Proposal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-light/65 uppercase tracking-wider mb-2">
                  Phone Number <span className="text-text-light/40 font-normal normal-case">(optional — for WhatsApp reply)</span>
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  className="w-full bg-black/35 border border-text-light/15 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-primary text-text-light"
                  placeholder="e.g. +254 712 345 678"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-light/65 uppercase tracking-wider mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formMessage}
                  onChange={e => setFormMessage(e.target.value)}
                  className="w-full bg-black/35 border border-text-light/15 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-primary text-text-light resize-none"
                  placeholder="Type your message details here..."
                />
              </div>

              {submitSuccess === true && (
                <div className="p-4 bg-green-500/15 border border-green-500/35 text-green-400 rounded-2xl text-sm">
                  ✓ Message sent successfully! Thank you for reaching out.
                </div>
              )}

              {submitSuccess === false && (
                <div className="p-4 bg-red-500/15 border border-red-500/35 text-red-400 rounded-2xl text-sm">
                  ✗ Failed to send message. Please check connection and try again.
                </div>
              )}

              {formError && (
                <div className="p-4 bg-yellow-500/15 border border-yellow-500/35 text-yellow-400 rounded-2xl text-sm">
                  ⚠️ {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary hover:bg-primary/85 disabled:bg-primary/50 text-white font-bold text-sm rounded-2xl shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.35)] transition-all flex items-center justify-center gap-2"
              >
                {submitting ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
