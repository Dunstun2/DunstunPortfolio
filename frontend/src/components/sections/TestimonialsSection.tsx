'use client';
import SectionTitle from '@/components/SectionTitle';
import { useEffect, useState, useRef } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { API_BASE_URL, getFileUrl } from '@/utils/urls';
import Link from 'next/link';

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const refreshKey = useRealtimeRefresh('testimonials');
  const refreshKeySettings = useRealtimeRefresh('settings');

  const initialForm = {
    author_name: '',
    email: '',
    author_title: '',
    company: '',
    relationship: '',
    content: '',
    avatar_url: '',
    photo_consent: false,
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    Promise.all([
      fetchApi('/testimonials/published'),
      fetchApi('/settings')
    ])
      .then(([testimonialsRes, settingsRes]) => {
        setTestimonials(testimonialsRes.data || []);
        setSettings(settingsRes.data);
      })
      .catch(() => { });
  }, [refreshKey, refreshKeySettings]);

  if (!testimonials.length) return null;

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE_URL}/media`, {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();
      const url = json.success && json.data?.file_path
        ? getFileUrl(json.data.file_path)
        : null;
      if (url) {
        setFormData(prev => ({ ...prev, avatar_url: url }));
      }
    } catch (err) { console.error(err); }
    finally { setUploadingPhoto(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchApi('/testimonials/submit', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setSubmitted(true);
      setFormData(initialForm);
    } catch (err) {
      console.error(err);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="testimonials" className="py-4 md:py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center md:text-left mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-bold text-heading-light mb-2">
              <SectionTitle title={settings?.testimonials_section_title || 'Client & Peer Feedback'} />
            </h2>
            <p className="text-text-light/70 text-sm max-w-xl">
              Endorsements and testimonials from colleagues, partners, and clients I&apos;ve collaborated with.
            </p>
          </div>

          <button
            onClick={() => { setShowModal(true); setSubmitted(false); }}
            className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 text-white font-bold text-sm rounded-full shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)] transition-all hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Leave Feedback / Endorsement
          </button>
        </div>

        {/* Cards Grid */}
        {testimonials.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {testimonials.slice(0, 3).map((test) => {
                const showPhoto = (test.display_photo !== false) && !!test.avatar_url;
                const showName = test.display_name !== false;
                const showTitle = test.display_title !== false;
                const showCompany = test.display_company !== false;

                return (
                  <div key={test.id} className="glass p-8 rounded-2xl relative flex flex-col justify-between">
                    <div>
                      <div className="text-primary/20 absolute top-4 right-4">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 32 32"><path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"></path></svg>
                      </div>
                      <p className="text-text-light italic mb-8 relative z-10 leading-relaxed">&ldquo;{test.content}&rdquo;</p>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-text-light/10">
                      {showPhoto ? (
                        <img src={test.avatar_url} alt={test.author_name} className="w-12 h-12 rounded-full object-cover border border-primary/30" />
                      ) : showName ? (
                        <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-lg font-bold text-primary">
                          {test.author_name ? test.author_name.charAt(0).toUpperCase() : '?'}
                        </div>
                      ) : null}

                      <div>
                        {showName && <h4 className="text-heading-light font-bold">{test.author_name}</h4>}
                        <div className="text-primary text-xs">
                          {showTitle && test.author_title && <span>{test.author_title}</span>}
                          {showTitle && test.author_title && showCompany && test.company && <span> @ </span>}
                          {showCompany && test.company && <span>{test.company}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View All Testimonials & Mobile Leave Feedback */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <Link
                href="/testimonials"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-primary rounded-full hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.5)] transition-all hover:-translate-y-1 border border-primary/50"
              >
                View All Testimonials &rarr;
              </Link>

              <button
                onClick={() => { setShowModal(true); setSubmitted(false); }}
                className="inline-flex md:hidden items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-full transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Leave Feedback / Endorsement
              </button>
            </div>
          </>
        ) : null}

      </div>

      {/* Public Feedback Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="glass bg-bg-dark border border-text-light/20 rounded-3xl p-6 md:p-8 max-w-2xl w-full relative my-8 text-left shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-text-light/50 hover:text-white text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10"
            >
              &times;
            </button>

            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-heading-light">Thank You!</h3>
                <p className="text-text-light/80 text-sm max-w-md mx-auto">
                  Your feedback has been submitted successfully and sent for administrative moderation before publishing.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary/80 transition-colors mt-4"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-heading-light">Submit Feedback & Endorsement</h3>
                  <p className="text-xs text-text-light/70 mt-1">Share your experience, collaboration, or feedback.</p>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-light/80 mb-1">Your Name *</label>
                    <input
                      required
                      type="text"
                      value={formData.author_name}
                      onChange={e => setFormData({ ...formData, author_name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full bg-black/40 border border-text-light/15 rounded-xl px-3.5 py-2.5 text-sm text-text-light placeholder-text-light/40 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-light/80 mb-1">Your Email (Private) *</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@company.com"
                      className="w-full bg-black/40 border border-text-light/15 rounded-xl px-3.5 py-2.5 text-sm text-text-light placeholder-text-light/40 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Role & Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-text-light/80 mb-1">Professional Title / Role</label>
                    <input
                      type="text"
                      value={formData.author_title}
                      onChange={e => setFormData({ ...formData, author_title: e.target.value })}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full bg-black/40 border border-text-light/15 rounded-xl px-3.5 py-2.5 text-sm text-text-light placeholder-text-light/40 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-light/80 mb-1">Organization / Company (Optional)</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. ABC Technologies"
                      className="w-full bg-black/40 border border-text-light/15 rounded-xl px-3.5 py-2.5 text-sm text-text-light placeholder-text-light/40 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Relationship */}
                <div>
                  <label className="block text-xs font-bold text-text-light/80 mb-1">Relationship / Context</label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                    placeholder="e.g. Worked together at safaricom / Client project"
                    className="w-full bg-black/40 border border-text-light/15 rounded-xl px-3.5 py-2.5 text-sm text-text-light placeholder-text-light/40 focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Feedback Message */}
                <div>
                  <label className="block text-xs font-bold text-text-light/80 mb-1">Your Feedback / Testimonial *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Describe your working experience or recommendation..."
                    className="w-full bg-black/40 border border-text-light/15 rounded-xl px-3.5 py-2.5 text-sm text-text-light placeholder-text-light/40 focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Profile Photo (Optional) */}
                <div className="p-4 bg-black/30 rounded-2xl border border-text-light/10 space-y-3">
                  <label className="block text-xs font-bold text-heading-light">📷 Add a Profile Photo (Optional)</label>
                  <p className="text-xs text-text-light/60">Your photo may appear alongside your feedback if approved.</p>

                  <div className="flex items-center gap-3">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Uploaded" className="w-12 h-12 rounded-full object-cover border border-primary" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-black/40 border border-text-light/20 flex items-center justify-center text-xs text-text-light/40 font-bold">
                        1:1
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]); }} />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {uploadingPhoto ? 'Uploading...' : 'Choose Image File'}
                    </button>
                    {formData.avatar_url && (
                      <button type="button" onClick={() => setFormData({ ...formData, avatar_url: '', photo_consent: false })} className="text-xs text-red-400 hover:underline font-bold">
                        Remove
                      </button>
                    )}
                  </div>

                  {formData.avatar_url && (
                    <label className="flex items-center gap-2 pt-2 text-xs text-text-light/90 cursor-pointer">
                      <input
                        required
                        type="checkbox"
                        checked={formData.photo_consent}
                        onChange={e => setFormData({ ...formData, photo_consent: e.target.checked })}
                        className="rounded bg-black/40 border-text-light/30 text-primary focus:ring-primary"
                      />
                      <span>I give permission for my photo to be displayed alongside my feedback if published. *</span>
                    </label>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-bold text-text-light/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-7 py-2.5 bg-primary hover:bg-primary/80 text-white font-bold text-sm rounded-full shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)] transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
