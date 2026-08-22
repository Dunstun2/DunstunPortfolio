'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import FilePicker from '@/components/FilePicker';

const defaultCorporateData = {
  // 1. Hero & Featured Visual
  hero_headline: 'Making Quality Products and Services Accessible',
  hero_intro: 'We are committed to providing reliable products and services that meet the everyday needs of our customers while delivering a simple, convenient, and trustworthy experience.',
  hero_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  hero_cta_primary_text: 'Explore Our Offerings',
  hero_cta_primary_url: '/services',
  hero_cta_secondary_text: 'Contact Us',
  hero_cta_secondary_url: '/contact',

  // 2. Who We Are
  business_name: 'Our Company',
  who_we_are_overview: 'We are a customer-focused business providing quality products and professional services to individuals, businesses, and organizations. Our goal is to make it easier for our customers to access reliable solutions in one convenient place.',
  who_serve: 'Individuals, SMEs, Corporate Clients, and Organizations looking for dependable solutions.',
  who_we_serve: 'Individuals, SMEs, Corporate Clients, and Organizations looking for dependable solutions.',
  categories_summary: 'E-Commerce Products, Digital Solutions, Professional Services, and Support.',
  general_purpose: 'Providing end-to-end quality solutions with transparent service and customer satisfaction at the core.',

  // 3. Our Story
  story_headline: 'Our Journey From Idea to Impact',
  story_beginning: 'Our journey began with a simple idea: to make reliable products and services more accessible and convenient.',
  story_problem: 'We recognized that customers often had difficulty finding trusted providers, comparing options, and accessing everything they needed in one place.',
  story_solution: 'This inspired us to create a business focused on convenience, quality, and customer satisfaction with verified standards.',
  story_today: 'Today, we serve hundreds of satisfied clients across multiple sectors, constantly innovating to deliver unmatched value.',

  // 4. What We Offer
  business_type: 'both' as 'products' | 'services' | 'both',
  product_categories: [
    { title: 'Digital Solutions', description: 'Software tools, licenses, and digital assets.', icon: '💻', link: '/projects' },
    { title: 'Hardware & Accessories', description: 'Quality accessories, equipment, and gadgets.', icon: '📦', link: '/projects' },
  ],
  service_categories: [
    { title: 'Consultation & Strategy', description: 'Expert guidance tailored to your business goals.', icon: '💡', link: '/services' },
    { title: 'Technical & Maintenance Support', description: 'Ongoing care and professional installation services.', icon: '🛠️', link: '/services' },
  ],

  // 5 & 6. Mission & Vision
  mission_statement: 'To provide accessible, reliable, and high-quality products and services while creating a convenient and trustworthy experience for every customer.',
  vision_statement: 'To become a trusted and innovative brand that connects customers with the products and services they need.',

  // 7. Our Values
  values: [
    { title: 'Quality', description: 'We strive to provide products and services that meet high standards.', icon: '⭐' },
    { title: 'Customer Satisfaction', description: 'Our customers are at the center of everything we do.', icon: '❤️' },
    { title: 'Trust', description: 'We value honesty, clarity, and complete transparency.', icon: '🛡️' },
    { title: 'Innovation', description: 'We continuously look for better ways to serve our customers.', icon: '💡' },
    { title: 'Reliability', description: 'We aim to deliver consistently and responsibly every time.', icon: '🎯' },
  ],

  // 8. Why Choose Us
  why_choose_us: [
    { title: 'Quality Assured', description: 'Carefully selected products and reliable, vetted services.', icon: '✅' },
    { title: 'Convenience', description: 'Easy browsing, seamless ordering, and quick access to services.', icon: '⚡' },
    { title: 'Trust & Transparency', description: 'Transparent communication, clear pricing, and no hidden terms.', icon: '🔒' },
    { title: 'Dedicated Support', description: 'Attentive assistance before, during, and after your purchase.', icon: '🎧' },
  ],

  // 9. Our Commitment
  commitment_statement: 'We are committed to making every customer interaction simple, reliable, and valuable. From discovering a product or service to completing a purchase and receiving support, we aim to provide an experience that customers can trust.',
  customer_promises: [
    'Clear and accurate product information',
    'Transparent pricing with zero hidden fees',
    'Prompt, professional, and reliable service delivery',
    'Secure transactions and customer privacy protection',
    'Dedicated customer support for all inquiries',
  ],

  // 10. How It Works
  how_it_works_products: [
    { step: 1, title: 'Browse', description: 'Explore available products in our catalog.' },
    { step: 2, title: 'Choose', description: 'Select the items or options that best suit your needs.' },
    { step: 3, title: 'Order', description: 'Add to cart and securely complete your checkout.' },
    { step: 4, title: 'Receive', description: 'Get your products via fast delivery or pickup.' },
  ],
  how_it_works_services: [
    { step: 1, title: 'Explore Services', description: 'Find the specific service or package you need.' },
    { step: 2, title: 'Request or Book', description: 'Submit your project details or service inquiry.' },
    { step: 3, title: 'Confirmation', description: 'Receive instant confirmation and project roadmap.' },
    { step: 4, title: 'Service Delivery', description: 'Our experts execute and deliver your solution.' },
  ],

  // 11. Quality & Trust Assurance
  quality_text: 'Every product we supply and service we perform undergoes stringent quality verification. We stand behind our work with full accountability.',
  quality_guarantees: [
    { title: 'Authenticity Guarantee', description: '100% genuine products and certified professional service providers.' },
    { title: 'Secure Transactions', description: 'Encrypted payment channels and strict data privacy compliance.' },
    { title: 'Satisfaction Guarantee', description: 'Supportive return/revision policies ensuring complete customer peace of mind.' },
  ],

  // 12. Meet the Team
  team_subtitle: 'The People Behind The Brand',
  team_members: [
    {
      name: 'Sarah Jenkins',
      role: 'Chief Executive Officer (CEO)',
      bio: '15+ years of strategic leadership and enterprise innovation, driving digital transformation and customer excellence.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'David Chen',
      role: 'Chief Technology Officer (CTO)',
      bio: 'Pioneer in cloud architecture and scalable systems with a passion for emerging technologies and robust engineering.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Head of Operations',
      bio: 'Specializes in streamlining operational workflows, client relationships, and ensuring top-tier service quality.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Marcus Vance',
      role: 'Lead Solutions Architect',
      bio: 'Expert in technical strategy, custom software design, and high-performance system integration.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Aisha Patel',
      role: 'Customer Experience Manager',
      bio: 'Dedicated to creating exceptional customer journeys, proactive support, and continuous service enhancement.',
      image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80'
    }
  ] as { name: string; role: string; bio: string; image?: string }[],

  // 13. Achievements & Social Proof (Statistics)
  statistics: [
    { value: '500+', label: 'Customers Served' },
    { value: '100+', label: 'Products Available' },
    { value: '50+', label: 'Services Completed' },
    { value: '99%', label: 'Satisfaction Rate' },
  ],

  // 14. Testimonials & Reviews
  testimonials_headline: 'What Our Customers Say',
  testimonials_summary: 'Read genuine reviews from clients who rely on our products and services.',
  featured_reviews: [] as { name: string; review: string; rating: number; role?: string }[],

  // 15. Call to Action
  cta_headline: 'Ready to Find What You Need?',
  cta_subheadline: 'Explore our catalog or get in touch with our team today.',
  cta_btn1_text: 'Explore Services',
  cta_btn1_url: '/services',
  cta_btn2_text: 'Contact Us',
  cta_btn2_url: '/contact',
};

export default function CorporateAdminAbout() {
  const refreshKey = useRealtimeRefresh('about', false);
  const [formData, setFormData] = useState<any>({ ...defaultCorporateData });
  const [editId, setEditId] = useState('');
  const [activeTab, setActiveTab] = useState('whoweare');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [filePickerTarget, setFilePickerTarget] = useState<string | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async () => {
    try {
      // Use public /published endpoint — no auth needed, always returns the active record with its ID
      let data: any = null;
      try {
        const res = await fetchApi('/corporate/about/published');
        data = res?.data || null;
      } catch {
        try {
          const res = await fetchApi('/corporate/about');
          const items = res?.data || [];
          data = items.find((item: any) => item.status === 'published') || items[0] || null;
        } catch {
          console.error('[LoadData] Could not fetch about data');
          return;
        }
      }

      if (data) {
        setEditId(data.id);
        let corpData = data.corporate_data || {};
        while (typeof corpData === 'string') {
          try { corpData = JSON.parse(corpData); } catch { break; }
        }
        if (!corpData || typeof corpData !== 'object') corpData = {};

        // Parse statistics
        let mergedStats = corpData.statistics;
        if ((!mergedStats || mergedStats.length === 0) && data.statistics) {
          let parsed = data.statistics;
          if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed); } catch {} }
          if (Array.isArray(parsed) && parsed.length > 0) mergedStats = parsed;
        }

        const serveText = corpData.who_serve || corpData.who_we_serve || defaultCorporateData.who_serve;

        // corpData always wins over defaults
        setFormData({
          ...defaultCorporateData,
          ...corpData,
          business_name: corpData.business_name || data.company_name || defaultCorporateData.business_name,
          who_we_are_overview: corpData.who_we_are_overview || data.professional_summary || data.content || defaultCorporateData.who_we_are_overview,
          who_serve: serveText,
          who_we_serve: serveText,
          categories_summary: corpData.categories_summary || defaultCorporateData.categories_summary,
          statistics: mergedStats && mergedStats.length > 0 ? mergedStats : defaultCorporateData.statistics,
          values: corpData.values && corpData.values.length > 0 ? corpData.values : defaultCorporateData.values,
          why_choose_us: corpData.why_choose_us && corpData.why_choose_us.length > 0 ? corpData.why_choose_us : defaultCorporateData.why_choose_us,
        });
      }
    } catch (e) {
      console.error('[LoadData Error]', e);
    }
  }, []);



  useEffect(() => {
    loadData();
  }, [loadData]);

  const autoSave = useCallback(async (currentData: any) => {
    setSaveStatus('saving');
    try {
      const payload = {
        personal_introduction: currentData.hero_intro || '',
        professional_summary: currentData.who_we_are_overview || '',
        mission_statement: currentData.mission_statement || '',
        vision_statement: currentData.vision_statement || '',
        image_url: currentData.hero_image || '',
        statistics: currentData.statistics || [],
        values: currentData.values || [],
        corporate_data: currentData,
        status: 'published',
      };

      console.log('[AutoSave] editId:', editId, '| business_type:', currentData.business_type);

      if (editId) {
        // Primary: update by known ID
        await fetchApi(`/corporate/about/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
        console.log('[AutoSave] ✅ Saved via PUT /:id');
      } else {
        // Fallback: update the active published record (no ID needed)
        try {
          await fetchApi('/corporate/about/active', { method: 'PUT', body: JSON.stringify(payload) });
          console.log('[AutoSave] ✅ Saved via PUT /active');
        } catch {
          // If no record exists yet, create one
          const res = await fetchApi('/corporate/about', { method: 'POST', body: JSON.stringify({ ...payload, status: 'published' }) });
          if (res?.data?.id) setEditId(res.data.id);
          console.log('[AutoSave] ✅ Created new record');
        }
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e: any) {
      console.error('[AutoSave Error]', e?.message || e);
      setSaveStatus('idle');
    }
  }, [editId]);


  const handleFieldChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    if (field === 'who_serve') updated.who_we_serve = value;
    if (field === 'who_we_serve') updated.who_serve = value;
    setFormData(updated);
    setSaveStatus('idle');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => autoSave(updated), 1000);
  };

  const handleFileSelected = (url: string) => {
    if (filePickerTarget?.startsWith('team-image-')) {
      const idx = parseInt(filePickerTarget.replace('team-image-', ''));
      const team = [...(formData.team_members || [])];
      team[idx] = { ...team[idx], image: url };
      handleFieldChange('team_members', team);
    } else if (filePickerTarget) {
      handleFieldChange(filePickerTarget, url);
    }
    setShowFilePicker(false);
    setFilePickerTarget(null);
  };

  const tabs = [
    { id: 'whoweare', label: '1. Who We Are', icon: '🏢' },
    { id: 'story', label: '2. Our Story', icon: '📖' },
    { id: 'offerings', label: '3. What We Offer', icon: '📦' },
    { id: 'mission', label: '4. Mission & Vision', icon: '🎯' },
    { id: 'values', label: '5. Core Values', icon: '💎' },
    { id: 'whyus', label: '6. Why Choose Us', icon: '⭐' },
    { id: 'commitment', label: '7. Commitment', icon: '🤝' },
    { id: 'howitworks', label: '8. How It Works', icon: '⚙️' },
    { id: 'quality', label: '9. Quality Assurance', icon: '🛡️' },
    { id: 'team', label: '10. Meet The Team', icon: '👥' },
    { id: 'stats', label: '11. Statistics & Proof', icon: '📊' },
    { id: 'cta', label: '12. Final Call to Action', icon: '📣' },
  ];

  return (
    <div className="min-h-screen bg-bg-dark text-text-light p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-heading-light flex items-center gap-3">
            <span className="text-primary">🏢</span> Corporate About CMS
          </h1>
          <p className="text-text-light/60 text-xs md:text-sm mt-1">
            Build brand identity, explain your story, showcase products/services, and drive trust.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && <span className="text-xs text-yellow-400 animate-pulse font-medium">Auto-saving...</span>}
          {saveStatus === 'saved' && <span className="text-xs text-green-400 font-bold">✓ All Changes Saved</span>}
          <button
            onClick={() => autoSave(formData)}
            className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Save Now
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1">
          <div className="glass rounded-2xl border border-white/10 p-2 sticky top-20 max-h-[80vh] overflow-y-auto space-y-1">
            <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-primary border-b border-white/10 mb-1">
              About Page 12 Sections
            </div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary/20 text-primary border border-primary/40 font-bold'
                    : 'text-text-light/70 hover:text-text-light hover:bg-white/5'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-3 space-y-6">

          {/* 1. WHO WE ARE */}
          {activeTab === 'whoweare' && (
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-5">
              <h2 className="text-lg font-bold text-heading-light flex items-center gap-2">🏢 1. Who We Are</h2>
              <p className="text-xs text-text-light/60">Explain the core identity, featured photo, and overall scope of your business.</p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Company Featured Image</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.hero_image || ''}
                    onChange={(e) => handleFieldChange('hero_image', e.target.value)}
                    placeholder="Image URL or pick file..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => { setFilePickerTarget('hero_image'); setShowFilePicker(true); }}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold shrink-0"
                  >
                    📁 Pick Image
                  </button>
                </div>
                {formData.hero_image && (
                  <img src={formData.hero_image} alt="Company Overview" className="mt-3 rounded-xl w-full object-contain border border-white/10 bg-white/5 max-h-[420px]" />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Business Name</label>
                <input
                  type="text"
                  value={formData.business_name || ''}
                  onChange={(e) => handleFieldChange('business_name', e.target.value)}
                  placeholder="e.g. Acme Enterprise Ltd"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Business Identity Overview</label>
                <textarea
                  value={formData.who_we_are_overview || ''}
                  onChange={(e) => handleFieldChange('who_we_are_overview', e.target.value)}
                  rows={4}
                  placeholder="Explain what the business does and your overall focus..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Who You Serve</label>
                  <input
                    type="text"
                    value={formData.who_serve || ''}
                    onChange={(e) => handleFieldChange('who_serve', e.target.value)}
                    placeholder="e.g. Individuals, SMEs, & Corporate Clients"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Main Categories Summary</label>
                  <input
                    type="text"
                    value={formData.categories_summary || ''}
                    onChange={(e) => handleFieldChange('categories_summary', e.target.value)}
                    placeholder="e.g. Products, Digital Services, Maintenance"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. OUR STORY */}
          {activeTab === 'story' && (
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-5">
              <h2 className="text-lg font-bold text-heading-light flex items-center gap-2">📖 3. Our Story / How We Started</h2>
              <p className="text-xs text-text-light/60">Structure: The Beginning → The Problem → The Solution → Where We Are Today.</p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Story Section Headline</label>
                <input
                  type="text"
                  value={formData.story_headline || ''}
                  onChange={(e) => handleFieldChange('story_headline', e.target.value)}
                  placeholder="e.g. Our Journey From Idea to Impact"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">1. The Beginning</label>
                  <textarea
                    value={formData.story_beginning || ''}
                    onChange={(e) => handleFieldChange('story_beginning', e.target.value)}
                    rows={2}
                    placeholder="How and why the business was started..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">2. The Problem / Opportunity</label>
                  <textarea
                    value={formData.story_problem || ''}
                    onChange={(e) => handleFieldChange('story_problem', e.target.value)}
                    rows={2}
                    placeholder="What challenge or gap inspired the business..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">3. The Solution Created</label>
                  <textarea
                    value={formData.story_solution || ''}
                    onChange={(e) => handleFieldChange('story_solution', e.target.value)}
                    rows={2}
                    placeholder="How you created convenience, quality, and trust..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">4. Where We Are Today</label>
                  <textarea
                    value={formData.story_today || ''}
                    onChange={(e) => handleFieldChange('story_today', e.target.value)}
                    rows={2}
                    placeholder="Your current scale, achievements, and momentum..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. WHAT WE OFFER */}
          {activeTab === 'offerings' && (
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-6">
              <h2 className="text-lg font-bold text-heading-light flex items-center gap-2">📦 4. What We Offer</h2>
              <p className="text-xs text-text-light/60">Summarize your product & service categories with links to your Shop/Services pages.</p>

              {/* Business Type Selector */}
              <div className="p-4 bg-white/5 rounded-2xl border border-primary/30 space-y-3">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-primary">⚡ Business Type — What does this business offer?</label>
                <p className="text-[11px] text-text-light/50">This controls which sections appear on your About page under "What We Offer".</p>
                <div className="flex flex-wrap gap-3 pt-1">
                  {(['products', 'services', 'both'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleFieldChange('business_type', type)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        formData.business_type === type
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                          : 'bg-white/5 text-text-light/70 border-white/10 hover:border-primary/40'
                      }`}
                    >
                      {type === 'products' && '🛍️ Products Only'}
                      {type === 'services' && '🛠️ Services Only'}
                      {type === 'both' && '🛍️ + 🛠️ Both Products & Services'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Categories — only shown when type includes products */}
              {(formData.business_type === 'products' || formData.business_type === 'both') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-primary">🛍️ Product Categories</h3>
                  <button
                    onClick={() => {
                      const updated = [...(formData.product_categories || []), { title: '', description: '', icon: '📦', link: '/projects' }];
                      handleFieldChange('product_categories', updated);
                    }}
                    className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-lg border border-primary/30"
                  >
                    + Add Product Category
                  </button>
                </div>

                {(formData.product_categories || []).map((cat: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10 flex gap-3 items-center">
                    <input
                      type="text"
                      value={cat.icon || '📦'}
                      onChange={(e) => {
                        const copy = [...formData.product_categories];
                        copy[idx].icon = e.target.value;
                        handleFieldChange('product_categories', copy);
                      }}
                      className="w-10 text-center bg-white/5 border border-white/10 rounded-lg py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={cat.title || ''}
                      onChange={(e) => {
                        const copy = [...formData.product_categories];
                        copy[idx].title = e.target.value;
                        handleFieldChange('product_categories', copy);
                      }}
                      placeholder="Category Title (e.g. Electronics)"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={cat.description || ''}
                      onChange={(e) => {
                        const copy = [...formData.product_categories];
                        copy[idx].description = e.target.value;
                        handleFieldChange('product_categories', copy);
                      }}
                      placeholder="Short Description"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => {
                        const copy = formData.product_categories.filter((_: any, i: number) => i !== idx);
                        handleFieldChange('product_categories', copy);
                      }}
                      className="text-red-400 text-xs px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              )}

              {/* Service Categories — only shown when type includes services */}
              {(formData.business_type === 'services' || formData.business_type === 'both') && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-secondary">🛠️ Service Categories</h3>
                  <button
                    onClick={() => {
                      const updated = [...(formData.service_categories || []), { title: '', description: '', icon: '💼', link: '/services' }];
                      handleFieldChange('service_categories', updated);
                    }}
                    className="px-3 py-1 bg-secondary/20 text-secondary text-xs font-bold rounded-lg border border-secondary/30"
                  >
                    + Add Service Category
                  </button>
                </div>

                {(formData.service_categories || []).map((cat: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10 flex gap-3 items-center">
                    <input
                      type="text"
                      value={cat.icon || '💼'}
                      onChange={(e) => {
                        const copy = [...formData.service_categories];
                        copy[idx].icon = e.target.value;
                        handleFieldChange('service_categories', copy);
                      }}
                      className="w-10 text-center bg-white/5 border border-white/10 rounded-lg py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={cat.title || ''}
                      onChange={(e) => {
                        const copy = [...formData.service_categories];
                        copy[idx].title = e.target.value;
                        handleFieldChange('service_categories', copy);
                      }}
                      placeholder="Service Title (e.g. Repair Services)"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={cat.description || ''}
                      onChange={(e) => {
                        const copy = [...formData.service_categories];
                        copy[idx].description = e.target.value;
                        handleFieldChange('service_categories', copy);
                      }}
                      placeholder="Short Description"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => {
                        const copy = formData.service_categories.filter((_: any, i: number) => i !== idx);
                        handleFieldChange('service_categories', copy);
                      }}
                      className="text-red-400 text-xs px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {/* 5. MISSION & VISION */}
          {activeTab === 'mission' && (
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-5">
              <h2 className="text-lg font-bold text-heading-light flex items-center gap-2">🎯 5 & 6. Mission & Vision</h2>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Our Mission</label>
                <textarea
                  value={formData.mission_statement || ''}
                  onChange={(e) => handleFieldChange('mission_statement', e.target.value)}
                  rows={3}
                  placeholder="To provide accessible, reliable, and high-quality products..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Our Vision</label>
                <textarea
                  value={formData.vision_statement || ''}
                  onChange={(e) => handleFieldChange('vision_statement', e.target.value)}
                  rows={3}
                  placeholder="To become a trusted and innovative brand..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* 7. CORE VALUES */}
          {activeTab === 'values' && (
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-heading-light flex items-center gap-2">💎 7. Core Values</h2>
                <button
                  onClick={() => {
                    const copy = [...(formData.values || []), { title: '', description: '', icon: '⭐' }];
                    handleFieldChange('values', copy);
                  }}
                  className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-lg border border-primary/30"
                >
                  + Add Value
                </button>
              </div>

              {(formData.values || []).map((val: any, idx: number) => (
                <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={val.icon || '⭐'}
                      onChange={(e) => {
                        const copy = [...formData.values];
                        copy[idx].icon = e.target.value;
                        handleFieldChange('values', copy);
                      }}
                      className="w-10 text-center bg-white/5 border border-white/10 rounded-lg py-1.5 text-sm"
                    />
                    <input
                      type="text"
                      value={val.title || ''}
                      onChange={(e) => {
                        const copy = [...formData.values];
                        copy[idx].title = e.target.value;
                        handleFieldChange('values', copy);
                      }}
                      placeholder="Value Name (e.g. Quality, Customer Satisfaction)"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-bold"
                    />
                    <button
                      onClick={() => {
                        const copy = formData.values.filter((_: any, i: number) => i !== idx);
                        handleFieldChange('values', copy);
                      }}
                      className="text-red-400 text-xs px-2"
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    value={val.description || ''}
                    onChange={(e) => {
                      const copy = [...formData.values];
                      copy[idx].description = e.target.value;
                      handleFieldChange('values', copy);
                    }}
                    rows={2}
                    placeholder="Description of this value..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 8. WHY CHOOSE US */}
          {activeTab === 'whyus' && (
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-heading-light flex items-center gap-2">⭐ 8. Why Choose Us</h2>
                <button
                  onClick={() => {
                    const copy = [...(formData.why_choose_us || []), { title: '', description: '', icon: '✅' }];
                    handleFieldChange('why_choose_us', copy);
                  }}
                  className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-lg border border-primary/30"
                >
                  + Add Reason
                </button>
              </div>

              {(formData.why_choose_us || []).map((item: any, idx: number) => (
                <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={item.icon || '✅'}
                      onChange={(e) => {
                        const copy = [...formData.why_choose_us];
                        copy[idx].icon = e.target.value;
                        handleFieldChange('why_choose_us', copy);
                      }}
                      className="w-10 text-center bg-white/5 border border-white/10 rounded-lg py-1.5 text-sm"
                    />
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => {
                        const copy = [...formData.why_choose_us];
                        copy[idx].title = e.target.value;
                        handleFieldChange('why_choose_us', copy);
                      }}
                      placeholder="Reason Title (e.g. Convenience, Competitive Pricing)"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-bold"
                    />
                    <button
                      onClick={() => {
                        const copy = formData.why_choose_us.filter((_: any, i: number) => i !== idx);
                        handleFieldChange('why_choose_us', copy);
                      }}
                      className="text-red-400 text-xs px-2"
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => {
                      const copy = [...formData.why_choose_us];
                      copy[idx].description = e.target.value;
                      handleFieldChange('why_choose_us', copy);
                    }}
                    rows={2}
                    placeholder="Explanation of customer benefit..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 9. OUR COMMITMENT */}
          {activeTab === 'commitment' && (
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-5">
              <h2 className="text-lg font-bold text-heading-light flex items-center gap-2">🤝 9. Our Commitment to Customers</h2>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Commitment Statement</label>
                <textarea
                  value={formData.commitment_statement || ''}
                  onChange={(e) => handleFieldChange('commitment_statement', e.target.value)}
                  rows={3}
                  placeholder="We are committed to making every customer interaction simple, reliable..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* 10. HOW IT WORKS */}
          {activeTab === 'howitworks' && (
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-6">
              <h2 className="text-lg font-bold text-heading-light flex items-center gap-2">⚙️ 10. How It Works</h2>

              {/* Products Workflow */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-primary">🛍️ Buying Products Workflow (4 Steps)</h3>
                {(formData.how_it_works_products || []).map((step: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10 flex gap-3 items-center">
                    <span className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={step.title || ''}
                      onChange={(e) => {
                        const copy = [...formData.how_it_works_products];
                        copy[idx].title = e.target.value;
                        handleFieldChange('how_it_works_products', copy);
                      }}
                      placeholder="Step Title (e.g. Browse)"
                      className="w-1/3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold"
                    />
                    <input
                      type="text"
                      value={step.description || ''}
                      onChange={(e) => {
                        const copy = [...formData.how_it_works_products];
                        copy[idx].description = e.target.value;
                        handleFieldChange('how_it_works_products', copy);
                      }}
                      placeholder="Step details..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>

              {/* Services Workflow */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-secondary">🛠️ Booking Services Workflow (4 Steps)</h3>
                {(formData.how_it_works_services || []).map((step: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10 flex gap-3 items-center">
                    <span className="w-8 h-8 rounded-full bg-secondary/20 text-secondary font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={step.title || ''}
                      onChange={(e) => {
                        const copy = [...formData.how_it_works_services];
                        copy[idx].title = e.target.value;
                        handleFieldChange('how_it_works_services', copy);
                      }}
                      placeholder="Step Title (e.g. Explore Services)"
                      className="w-1/3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold"
                    />
                    <input
                      type="text"
                      value={step.description || ''}
                      onChange={(e) => {
                        const copy = [...formData.how_it_works_services];
                        copy[idx].description = e.target.value;
                        handleFieldChange('how_it_works_services', copy);
                      }}
                      placeholder="Step details..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 11. QUALITY & TRUST */}
          {activeTab === 'quality' && (
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-5">
              <h2 className="text-lg font-bold text-heading-light flex items-center gap-2">🛡️ 11. Quality, Trust & Assurance</h2>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Quality Statement</label>
                <textarea
                  value={formData.quality_text || ''}
                  onChange={(e) => handleFieldChange('quality_text', e.target.value)}
                  rows={3}
                  placeholder="Explain quality checks, verified sources, and guarantees..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* 12. MEET THE TEAM */}
          {activeTab === 'team' && (
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-heading-light flex items-center gap-2">👥 12. Meet The Team</h2>
                <button
                  onClick={() => {
                    const copy = [...(formData.team_members || []), { name: '', role: '', bio: '', image: '' }];
                    handleFieldChange('team_members', copy);
                  }}
                  className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-lg border border-primary/30"
                >
                  + Add Team Member
                </button>
              </div>

              {(formData.team_members || []).map((m: any, idx: number) => (
                <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/20 shrink-0">
                      {m.image ? (
                        <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        <button
                          onClick={() => { setFilePickerTarget(`team-image-${idx}`); setShowFilePicker(true); }}
                          className="text-xs text-text-light/50"
                        >
                          📷 Photo
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={m.name || ''}
                      onChange={(e) => {
                        const copy = [...formData.team_members];
                        copy[idx].name = e.target.value;
                        handleFieldChange('team_members', copy);
                      }}
                      placeholder="Name"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold"
                    />
                    <input
                      type="text"
                      value={m.role || ''}
                      onChange={(e) => {
                        const copy = [...formData.team_members];
                        copy[idx].role = e.target.value;
                        handleFieldChange('team_members', copy);
                      }}
                      placeholder="Role / Title"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => {
                        const copy = formData.team_members.filter((_: any, i: number) => i !== idx);
                        handleFieldChange('team_members', copy);
                      }}
                      className="text-red-400 text-xs px-2"
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    value={m.bio || ''}
                    onChange={(e) => {
                      const copy = [...formData.team_members];
                      copy[idx].bio = e.target.value;
                      handleFieldChange('team_members', copy);
                    }}
                    rows={2}
                    placeholder="Short bio..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 13. STATISTICS & SOCIAL PROOF */}
          {activeTab === 'stats' && (
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-heading-light flex items-center gap-2">📊 13. Statistics & Social Proof</h2>
                <button
                  onClick={() => {
                    const copy = [...(formData.statistics || []), { value: '', label: '' }];
                    handleFieldChange('statistics', copy);
                  }}
                  className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-lg border border-primary/30"
                >
                  + Add Metric
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(formData.statistics || []).map((stat: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10 flex gap-2 items-center">
                    <input
                      type="text"
                      value={stat.value || ''}
                      onChange={(e) => {
                        const copy = [...formData.statistics];
                        copy[idx].value = e.target.value;
                        handleFieldChange('statistics', copy);
                      }}
                      placeholder="500+"
                      className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-extrabold text-primary"
                    />
                    <input
                      type="text"
                      value={stat.label || ''}
                      onChange={(e) => {
                        const copy = [...formData.statistics];
                        copy[idx].label = e.target.value;
                        handleFieldChange('statistics', copy);
                      }}
                      placeholder="Customers Served"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => {
                        const copy = formData.statistics.filter((_: any, i: number) => i !== idx);
                        handleFieldChange('statistics', copy);
                      }}
                      className="text-red-400 text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 14. FINAL CALL TO ACTION */}
          {activeTab === 'cta' && (
            <div className="glass rounded-2xl border border-white/10 p-6 space-y-5">
              <h2 className="text-lg font-bold text-heading-light flex items-center gap-2">📣 14. Final Call to Action</h2>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">CTA Section Headline</label>
                <input
                  type="text"
                  value={formData.cta_headline || ''}
                  onChange={(e) => handleFieldChange('cta_headline', e.target.value)}
                  placeholder="e.g. Ready to Find What You Need?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">CTA Subheadline</label>
                <input
                  type="text"
                  value={formData.cta_subheadline || ''}
                  onChange={(e) => handleFieldChange('cta_subheadline', e.target.value)}
                  placeholder="e.g. Explore our products or talk to an advisor today."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Button 1 Text</label>
                  <input
                    type="text"
                    value={formData.cta_btn1_text || ''}
                    onChange={(e) => handleFieldChange('cta_btn1_text', e.target.value)}
                    placeholder="Explore Services"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Button 1 Link</label>
                  <input
                    type="text"
                    value={formData.cta_btn1_url || ''}
                    onChange={(e) => handleFieldChange('cta_btn1_url', e.target.value)}
                    placeholder="/services"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {showFilePicker && (
        <FilePicker
          onSelect={handleFileSelected}
          onClose={() => { setShowFilePicker(false); setFilePickerTarget(null); }}
          accept="image"
        />
      )}
    </div>
  );
}
