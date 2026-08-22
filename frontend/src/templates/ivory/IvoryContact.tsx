'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import type { TemplateSectionProps } from '@/templateEngine/types';
import InlineText from '@/templateEngine/components/InlineText';
import CorporateContact from '@/modes/corporate/components/CorporateContact';

export default function IvoryContact({ config }: TemplateSectionProps) {
  const [settings, setSettings] = useState<any>({});
  const refreshKey = useRealtimeRefresh('settings');
  
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  useEffect(() => {
    fetchApi('/settings').then(res => setSettings(res.data)).catch(() => {});
  }, [refreshKey]);

  if (settings?.site_mode === 'corporate') {
    return <CorporateContact />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });
    try {
      await fetchApi('/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setStatus({ loading: false, success: true, error: '' });
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus(s => ({ ...s, success: false })), 5000);
    } catch (err: any) {
      setStatus({ loading: false, success: false, error: err.message || 'Failed to send message.' });
    }
  };

  return (
    <section id="contact" className="py-32 bg-bg-dark min-h-[90vh] flex items-center">
      <div className="max-w-[90rem] mx-auto px-6 md:px-12 lg:px-24 w-full">
        
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left Side: Contact Info & Typography */}
          <div className="lg:w-1/2">
            <span className="text-primary font-mono text-sm uppercase tracking-widest block mb-4">
                <InlineText settingKey="contact_section_subtitle" defaultValue="Inquiries" />
              </span>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-black text-heading-light tracking-tighter leading-[1.1] mb-8">
              Let's create <br/> something <br/> exceptional.
            </h2>
            
            <p className="text-text-light/80 text-lg leading-relaxed max-w-md mb-12">
              Whether you have a specific project in mind or just want to explore possibilities, I'm always open to discussing new opportunities.
            </p>
            
            <div className="space-y-6">
              {settings.contact_email && (
                <div>
                  <div className="text-muted-light font-mono text-xs uppercase tracking-widest mb-1">Email</div>
                  <a href={`mailto:${settings.contact_email}`} className="text-2xl font-heading font-bold text-heading-light hover:text-primary transition-colors">
                    {settings.contact_email}
                  </a>
                </div>
              )}
              
              {settings.contact_phone && (
                <div>
                  <div className="text-muted-light font-mono text-xs uppercase tracking-widest mb-1">Phone</div>
                  <a href={`tel:${settings.contact_phone}`} className="text-2xl font-heading font-bold text-heading-light hover:text-primary transition-colors">
                    {settings.contact_phone}
                  </a>
                </div>
              )}
              
              {settings.contact_address && (
                <div>
                  <div className="text-muted-light font-mono text-xs uppercase tracking-widest mb-1">Location</div>
                  <div className="text-xl font-heading font-bold text-text-light">
                    {settings.contact_address}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Minimalist Form */}
          <div className="lg:w-1/2">
            <div className="bg-text-light/5 p-8 md:p-12 rounded-[2rem] border border-text-light/10">
              <h3 className="text-2xl font-heading font-bold text-heading-light mb-8">Send a Message</h3>
              
              {status.success && (
                <div className="mb-8 p-4 bg-primary/20 text-primary border border-primary/30 rounded-xl">
                  Message sent successfully! I'll get back to you soon.
                </div>
              )}
              {status.error && (
                <div className="mb-8 p-4 bg-red-900/20 text-red-400 border border-red-900/30 rounded-xl">
                  {status.error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-light/80 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-bg-dark border border-text-light/10 rounded-xl px-4 py-3 text-text-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light/80 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-bg-dark border border-text-light/10 rounded-xl px-4 py-3 text-text-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light/80 mb-2">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-bg-dark border border-text-light/10 rounded-xl px-4 py-3 text-text-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                    placeholder="Tell me about your project..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={status.loading}
                  className="w-full bg-heading-light text-bg-dark hover:bg-primary hover:text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {status.loading ? (
                    <div className="w-5 h-5 border-2 border-bg-dark border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Send Message <i className="fas fa-arrow-right text-sm"></i></>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
