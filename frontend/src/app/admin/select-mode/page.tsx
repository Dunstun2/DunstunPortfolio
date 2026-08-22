'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/utils/api';

export default function SelectModePage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<'portfolio' | 'corporate'>('portfolio');
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(u);
    } catch { }

    // Fetch existing settings
    fetchApi('/settings')
      .then(res => {
        if (res.data?.site_mode) {
          setSelectedMode(res.data.site_mode);
        }
      })
      .catch(() => { });
  }, [router]);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await fetchApi('/settings', {
        method: 'POST',
        body: JSON.stringify({
          site_mode: selectedMode,
          setup_completed: 'true',
        }),
      });

      // Notify realtime updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('settings-updated'));
      }

      router.push('/admin');
    } catch (err: any) {
      alert('Failed to save website mode: ' + (err.message || 'Error occurred'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-light flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Background Orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl w-full relative z-10">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            Initial CMS Setup
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-3">
            Choose Your Website Type
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Welcome, <span className="text-white font-semibold">{user?.name || 'Administrator'}</span>. Select the website structure you want to build. This configures active CMS sections, navigation, and default content.
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          
          {/* Portfolio Card */}
          <div
            onClick={() => setSelectedMode('portfolio')}
            className={`cursor-pointer rounded-2xl p-6 sm:p-8 transition-all duration-300 relative border flex flex-col justify-between ${
              selectedMode === 'portfolio'
                ? 'bg-gray-900/90 border-primary shadow-[0_0_40px_rgba(59,130,246,0.25)] scale-[1.02]'
                : 'bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-900/70'
            }`}
          >
            {selectedMode === 'portfolio' && (
              <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                <span>✓</span> Selected
              </div>
            )}

            <div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-2xl font-bold mb-6">
                👤
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Personal Portfolio
              </h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Designed for individuals, freelancers, and professionals to present personal skills, career milestones, CV imports, and projects.
              </p>

              <div className="space-y-2 border-t border-gray-800 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Included Modules:</p>
                <ul className="text-xs text-gray-300 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">✓</span> Personal Hero & Bio
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">✓</span> AI CV / Resume Importer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">✓</span> Work Experience & Education
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">✓</span> Skills & Proficiency Bars
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">✓</span> Referees & Achievements
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary font-bold">✓</span> Blog, Projects, Contact & Media
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Corporate Card */}
          <div
            onClick={() => setSelectedMode('corporate')}
            className={`cursor-pointer rounded-2xl p-6 sm:p-8 transition-all duration-300 relative border flex flex-col justify-between ${
              selectedMode === 'corporate'
                ? 'bg-gray-900/90 border-secondary shadow-[0_0_40px_rgba(249,115,22,0.25)] scale-[1.02]'
                : 'bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-900/70'
            }`}
          >
            {selectedMode === 'corporate' && (
              <div className="absolute top-4 right-4 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                <span>✓</span> Selected
              </div>
            )}

            <div>
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary flex items-center justify-center text-2xl font-bold mb-6">
                🏢
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Corporate / Business
              </h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Streamlined business website CMS focusing on enterprise service offerings, company insights, client feedback, team branding, and inquiries.
              </p>

              <div className="space-y-2 border-t border-gray-800 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Included Modules:</p>
                <ul className="text-xs text-gray-300 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span> Enterprise Services Management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span> Company Insights & Blog
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span> Contact Forms & Inbox Management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span> Client Testimonials & Social Proof
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span> Cloud Media Asset Manager
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-secondary font-bold">✓</span> Multi-Template & Corporate Copy
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900/80 p-4 rounded-xl border border-gray-800">
          <p className="text-xs text-gray-400 text-center sm:text-left">
            💡 Initial setup configuration. Select your target website structure.
          </p>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white transition-all shadow-lg text-sm ${
              selectedMode === 'corporate'
                ? 'bg-secondary hover:bg-orange-600 shadow-secondary/20'
                : 'bg-primary hover:bg-blue-600 shadow-primary/20'
            }`}
          >
            {saving ? 'Configuring CMS...' : `Launch as ${selectedMode === 'corporate' ? 'Corporate Site' : 'Portfolio Site'} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
