'use client';
import ColoredTitle from '@/templateEngine/components/ColoredTitle';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import InlineText from '@/templateEngine/components/InlineText';
import { useInlineEdit } from '@/templateEngine/InlineEditContext';
import { Mail, Phone, MapPin } from 'lucide-react';
import { getSocialIcon } from '@/utils/socialIcons';


export default function ContactSection() {
  const { isInlineEditing } = useInlineEdit();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', phone: '', message: '' });
  const [settings, setSettings] = useState<any>({});
  const [socials, setSocials] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const refreshKeySettings = useRealtimeRefresh('settings');
  const refreshKeySocial = useRealtimeRefresh('social');

  useEffect(() => {
    fetchApi('/settings').then(res => setSettings(res.data || {})).catch(() => { });
  }, [refreshKeySettings]);

  useEffect(() => {
    fetchApi('/social').then(res => {
      if (res.success && res.data) {
        setSocials(res.data);
      }
    }).catch(() => { });
  }, [refreshKeySocial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInlineEditing) return;
    setStatus('loading');
    try {
      await fetchApi('/contact', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', phone: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Failed to send message');
    }
  };

  const sectionTitle = settings?.contact_section_title || "Let's Connect";
  
  // Hardcoded defaults for demo if settings are empty
  const email = settings.contact_email || 'user@example.com';
  const phone = settings.contact_phone || '+1 234 567 890';
  const location = settings.contact_location || 'City, Country';
  const availability = settings.contact_availability || 'Open to selected opportunities and collaborations';

  return (
    <section id="contact" className="pt-6 md:pt-10 pb-12 md:pb-16 bg-bg-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-heading-light mb-3">
            <ColoredTitle settingKey="contact_section_title" title={sectionTitle} />
          </h2>
          <p className="text-text-light/80 text-lg max-w-2xl mx-auto font-medium">
            <InlineText settingKey="contact_section_subtitle" defaultValue="Have a project, opportunity, or idea? I'd be happy to hear from you.">
              Have a project, opportunity, or idea? I&apos;d be happy to hear from you.
            </InlineText>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Get In Touch Card */}
            <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 bg-black/20">
              <h3 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4">
                <ColoredTitle settingKey="contact_get_in_touch_title" title="Get In Touch" />
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-primary">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-text-light/50 mb-1">Email</div>
                    <a href={`mailto:${email}`} className="text-sm md:text-base font-semibold text-heading-light hover:text-primary transition-colors">
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-secondary">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-text-light/50 mb-1">Phone</div>
                    <a href={`tel:${phone}`} className="text-sm md:text-base font-semibold text-heading-light hover:text-secondary transition-colors">
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-red-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-text-light/50 mb-1">Location</div>
                    <div className="text-sm md:text-base font-semibold text-heading-light">
                      {location}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-green-500">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-text-light/50 mb-1">Availability</div>
                    <div className="text-sm md:text-base font-semibold text-heading-light">
                      {availability}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Find Me Online Card */}
            <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 bg-black/20">
              <h3 className="text-2xl font-bold mb-4">
                <ColoredTitle settingKey="contact_find_me_title" title="Find Me Online" />
              </h3>
              <p className="text-xs text-text-light/70 mb-6 font-medium">
                <InlineText settingKey="contact_find_me_subtitle" defaultValue="Connect with me or explore my work across these platforms.">
                  Connect with me or explore my work across these platforms.
                </InlineText>
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {socials.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                  >
                    <div className="text-text-light group-hover:text-primary transition-colors flex items-center justify-center">
                      {getSocialIcon(social.platform_name)}
                    </div>
                    <span className="text-sm font-semibold text-heading-light">{social.platform_name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Notice Banner */}
            <div className="glass p-4 rounded-xl border border-white/5 bg-black/20 text-center text-sm font-medium text-text-light/70 italic">
              <InlineText settingKey="contact_response_time" defaultValue="I typically respond within 1-2 business days.">
                I typically respond within 1-2 business days.
              </InlineText>
            </div>

          </div>

          {/* RIGHT COLUMN (FORM) */}
          <div className="lg:col-span-7">
            <div className="glass p-6 md:p-8 lg:p-10 rounded-2xl border border-white/5 bg-black/20 h-full">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">
                  <ColoredTitle settingKey="contact_form_title" title="Send Me A Message" />
                </h3>
                <p className="text-xs text-text-light/70 font-medium">
                  <InlineText settingKey="contact_form_subtitle" defaultValue="Feel free to drop a message, and I will get back to you as soon as possible.">
                    Feel free to drop a message, and I will get back to you as soon as possible.
                  </InlineText>
                </p>
              </div>

              {status === 'success' ? (
                <div className="text-center py-20 flex flex-col items-center justify-center h-[70%]">
                  <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-3xl font-bold text-heading-light mb-3">Message Sent!</h3>
                  <p className="text-text-light/80 text-lg">Thank you for reaching out. I&apos;ll be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-heading-light mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-heading-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-heading-light mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-heading-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-heading-light mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Collaboration Proposal"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-heading-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-heading-light mb-2">
                      Phone Number <span className="text-text-light/50 normal-case font-medium tracking-normal">(optional - for WhatsApp reply)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +254 712 345 678"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-heading-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-heading-light mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Type your message details here..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-heading-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm resize-none"
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>

                  {status === 'error' && (
                    <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type={isInlineEditing ? 'button' : 'submit'}
                    disabled={status === 'loading'}
                    onClick={(e) => {
                      if (isInlineEditing) {
                        e.preventDefault();
                        const editable = (e.currentTarget as HTMLElement).querySelector('[contenteditable="true"]') as HTMLElement;
                        editable?.focus();
                      }
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer"
                  >
                    {status === 'loading' ? 'Sending...' : (
                      <InlineText settingKey="submit_button_text" defaultValue="Send Message">
                        {settings?.submit_button_text || 'Send Message'}
                      </InlineText>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
          
        </div>
      </div>

    </section>
  );
}
