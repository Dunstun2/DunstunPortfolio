'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import Link from '@/components/PreviewLink';
import InlineResourceText from '@/templateEngine/components/InlineResourceText';
import InlineResourceImage from '@/templateEngine/components/InlineResourceImage';
import { useInlineEdit } from '@/templateEngine/InlineEditContext';
import InlineButtonLink from '@/templateEngine/components/InlineButtonLink';
import { getFileUrl } from '@/utils/urls';

export default function CorporateAboutSection({ variant = 'highlights' }: { variant?: 'full' | 'highlights' }) {
  const [about, setAbout] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const { isInlineEditing } = useInlineEdit();
  const refreshKey = useRealtimeRefresh('about');
  const refreshKeySettings = useRealtimeRefresh('settings');

  useEffect(() => {
    Promise.all([
      fetchApi('/corporate/about/published')
        .catch(() => fetchApi('/about/published'))
        .then(res => setAbout(res?.data || null))
        .catch(() => setAbout(null)),
      fetchApi('/settings')
        .then(res => setSettings(res.data))
        .catch(() => setSettings(null))
    ]);
  }, [refreshKey, refreshKeySettings]);

  if (!about) return null;

  // Robust multi-pass JSON decoding for nested stringifications
  let corp: any = about.corporate_data || {};
  while (typeof corp === 'string') {
    try {
      corp = JSON.parse(corp);
    } catch {
      break;
    }
  }
  if (!corp || typeof corp !== 'object') {
    corp = {};
  }

  // 1. Hero & Branding Fields
  const heroHeadline = corp.hero_headline || settings?.about_section_title || 'Making Quality Products and Services Accessible';
  const heroIntro = corp.hero_intro || settings?.about_page_subtitle || about.personal_introduction || 'We are committed to providing reliable products and services that meet the everyday needs of our customers while delivering a simple, convenient, and trustworthy experience.';
  const heroImage = corp.hero_image || about.image_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80';
  const heroCta1Text = corp.hero_cta_primary_text || 'Explore Our Offerings';
  const heroCta1Url = corp.hero_cta_primary_url || '/services';
  const heroCta2Text = corp.hero_cta_secondary_text || 'Contact Us';
  const heroCta2Url = corp.hero_cta_secondary_url || '/contact';

  // 2. Who We Are Fields
  const businessName = corp.business_name || settings?.company_name || settings?.site_title || 'Our Company';
  const whoWeAreOverview = corp.who_we_are_overview || about.professional_summary || about.content || 'We are a customer-focused business providing quality products and professional services to individuals, businesses, and organizations. Our goal is to make it easier for our customers to access reliable solutions in one convenient place.';
  const categoriesSummary = corp.categories_summary || 'E-Commerce Products, Digital Solutions, Professional Services, and Support.';
  const whoServe = corp.who_serve || corp.who_we_serve || 'Individuals, SMEs, Corporate Clients, and Organizations looking for dependable solutions.';
  const generalPurpose = corp.general_purpose || 'Providing end-to-end quality solutions with transparent service and customer satisfaction at the core.';
  const buttonText = settings?.about_section_button_text || 'Learn More About Us';

  // 3. Mission & Vision
  const missionStatement = corp.mission_statement || about.mission_statement || 'To provide accessible, reliable, and high-quality products and services while creating a convenient and trustworthy experience for every customer.';
  const visionStatement = corp.vision_statement || about.vision_statement || 'To become a trusted and innovative brand that connects customers with the products and services they need.';

  // 4. Statistics / Key Metrics
  let statistics: { label: string; value: string }[] = corp.statistics || [];
  if ((!statistics || statistics.length === 0) && about.statistics) {
    let parsed = about.statistics;
    while (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch { break; }
    }
    if (Array.isArray(parsed) && parsed.length > 0) {
      statistics = parsed;
    }
  }
  if (!statistics || statistics.length === 0) {
    statistics = [
      { value: '500+', label: 'Customers Served' },
      { value: '100+', label: 'Products Available' },
      { value: '50+', label: 'Services Completed' },
      { value: '99%', label: 'Satisfaction Rate' },
    ];
  }
  statistics = (statistics || []).filter((s) => s?.label?.trim() && s?.value?.trim());

  // 5. Values
  let valuesList = (corp.values && Array.isArray(corp.values) && corp.values.length > 0) ? corp.values : [];
  if (valuesList.length === 0 && about.values && Array.isArray(about.values) && about.values.length > 0) {
    valuesList = about.values.map((v: any) => ({
      title: v.title || v.name || '',
      description: v.description || '',
      icon: v.icon || v.icon_name || '✨'
    }));
  }
  if (valuesList.length === 0) {
    valuesList = [
      { title: 'Quality', description: 'We strive to provide products and services that meet high standards.', icon: '⭐' },
      { title: 'Customer Satisfaction', description: 'Our customers are at the center of everything we do.', icon: '❤️' },
      { title: 'Trust', description: 'We value honesty, clarity, and complete transparency.', icon: '🛡️' },
      { title: 'Innovation', description: 'We continuously look for better ways to serve our customers.', icon: '💡' },
      { title: 'Reliability', description: 'We aim to deliver consistently and responsibly every time.', icon: '🎯' },
    ];
  }

  // 6. Why Choose Us
  const whyChooseUsList = (corp.why_choose_us && Array.isArray(corp.why_choose_us) && corp.why_choose_us.length > 0) ? corp.why_choose_us : [
    { title: 'Quality Assured', description: 'Carefully selected products and reliable, vetted services.', icon: '✅' },
    { title: 'Convenience', description: 'Easy browsing, seamless ordering, and quick access to services.', icon: '⚡' },
    { title: 'Trust & Transparency', description: 'Transparent communication, clear pricing, and no hidden terms.', icon: '🔒' },
    { title: 'Dedicated Support', description: 'Attentive assistance before, during, and after your purchase.', icon: '🎧' },
  ];

  // 7. Workflows (How It Works)
  const productsWorkflow = (corp.how_it_works_products && Array.isArray(corp.how_it_works_products) && corp.how_it_works_products.length > 0) ? corp.how_it_works_products : [
    { step: 1, title: 'Browse', description: 'Explore available products in our catalog.' },
    { step: 2, title: 'Choose', description: 'Select the items or options that best suit your needs.' },
    { step: 3, title: 'Order', description: 'Add to cart and securely complete your checkout.' },
    { step: 4, title: 'Receive', description: 'Get your products via fast delivery or pickup.' },
  ];
  const servicesWorkflow = (corp.how_it_works_services && Array.isArray(corp.how_it_works_services) && corp.how_it_works_services.length > 0) ? corp.how_it_works_services : [
    { step: 1, title: 'Explore Services', description: 'Find the specific service or package you need.' },
    { step: 2, title: 'Request or Book', description: 'Submit your project details or service inquiry.' },
    { step: 3, title: 'Confirmation', description: 'Receive instant confirmation and project roadmap.' },
    { step: 4, title: 'Service Delivery', description: 'Our experts execute and deliver your solution.' },
  ];

  // 8. Offerings (What We Offer)
  const productCategories = (corp.product_categories && Array.isArray(corp.product_categories) && corp.product_categories.length > 0) ? corp.product_categories : [
    { title: 'Digital Solutions', description: 'Software tools, licenses, and digital assets.', icon: '💻', link: '/projects' },
    { title: 'Hardware & Accessories', description: 'Quality accessories, equipment, and gadgets.', icon: '📦', link: '/projects' },
  ];
  const serviceCategories = (corp.service_categories && Array.isArray(corp.service_categories) && corp.service_categories.length > 0) ? corp.service_categories : [
    { title: 'Consultation & Strategy', description: 'Expert guidance tailored to your business goals.', icon: '💡', link: '/services' },
    { title: 'Technical & Maintenance Support', description: 'Ongoing care and professional installation services.', icon: '🛠️', link: '/services' },
  ];

  // 9. Commitment & Promises
  const commitmentStatement = corp.commitment_statement || 'We are committed to making every customer interaction simple, reliable, and valuable. From discovering a product or service to completing a purchase and receiving support, we aim to provide an experience that customers can trust.';
  const customerPromises: string[] = (corp.customer_promises && Array.isArray(corp.customer_promises) && corp.customer_promises.length > 0) ? corp.customer_promises : [
    'Clear and accurate product information',
    'Transparent pricing with zero hidden fees',
    'Prompt, professional, and reliable service delivery',
    'Secure transactions and customer privacy protection',
    'Dedicated customer support for all inquiries',
  ];

  // 10. Quality Guarantees
  const qualityText = corp.quality_text || 'Every product we supply and service we perform undergoes stringent quality verification. We stand behind our work with full accountability.';
  const qualityGuarantees = (corp.quality_guarantees && Array.isArray(corp.quality_guarantees) && corp.quality_guarantees.length > 0) ? corp.quality_guarantees : [
    { title: 'Authenticity Guarantee', description: '100% genuine products and certified professional service providers.' },
    { title: 'Secure Transactions', description: 'Encrypted payment channels and strict data privacy compliance.' },
    { title: 'Satisfaction Guarantee', description: 'Supportive return/revision policies ensuring complete customer peace of mind.' },
  ];

  // 11. Team Members
  const teamMembers = (corp.team_members && Array.isArray(corp.team_members)) ? corp.team_members : [];

  // 12. Testimonials
  const testimonialsHeadline = corp.testimonials_headline || 'What Our Customers Say';
  const testimonialsSummary = corp.testimonials_summary || 'Read genuine reviews from clients who rely on our products and services.';
  const featuredReviews = (corp.featured_reviews && Array.isArray(corp.featured_reviews)) ? corp.featured_reviews : [];

  // Business Type Filter
  const businessType = corp.business_type || 'both';
  const showProducts = businessType === 'products' || businessType === 'both';
  const showServices = businessType === 'services' || businessType === 'both';

  return (
    <section id="about" className="pt-4 md:pt-8 pb-12 relative bg-background space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">



        {/* ── 2. Who We Are (Overview Card with Photo & Metrics) ── */}
        <div className="glass p-6 sm:p-10 md:p-14 rounded-3xl mb-12 border border-white/10 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-center">
            
            {/* Visual Photo */}
            {(heroImage || isInlineEditing) && (
              <div className="w-full lg:w-1/2 flex-shrink-0">
                <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl group">
                  <InlineResourceImage
                    resource="about" id="active" field="image_url"
                    currentSrc={getFileUrl(heroImage)} alt="Company Overview"
                    className="w-full h-80 sm:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700"
                    wrapperClassName="w-full h-full"
                    width={1000}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                      {businessName} Excellence
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Content Details */}
            <div className="flex-1 w-full text-left space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs sm:text-sm font-bold uppercase tracking-wider">
                Who We Are
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-heading-light">
                {categoriesSummary}
              </h2>

              <p className="text-text-light/90 text-base md:text-lg leading-relaxed whitespace-pre-line">
                {whoWeAreOverview}
              </p>

              {/* General Purpose */}
              {generalPurpose && (
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 text-xs sm:text-sm">
                  <span className="text-primary font-bold">Core Purpose:</span> {generalPurpose}
                </div>
              )}

              {/* Target Audience */}
              {whoServe && (
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 text-xs sm:text-sm">
                  <span className="text-secondary font-bold">Who We Serve:</span> {whoServe}
                </div>
              )}

              {/* Statistics Metrics Grid */}
              {statistics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10">
                  {statistics.map((stat, idx) => (
                    <div key={idx} className="text-left">
                      <div className="text-2xl sm:text-3xl font-extrabold text-primary leading-none mb-1">
                        {stat.value}
                      </div>
                      <div className="text-[11px] sm:text-xs text-text-light/70 font-semibold uppercase tracking-wider">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {variant !== 'full' && (
                <div className="pt-4">
                  <InlineButtonLink
                    href="/about"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all shadow-lg hover:-translate-y-1"
                  >
                    {buttonText} <span>→</span>
                  </InlineButtonLink>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Extended Sections (Rendered on dedicated /about page) ── */}
        {variant === 'full' && (
          <>
            {/* ── 3. Mission & Vision Cards ── */}
            {(missionStatement || visionStatement) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {missionStatement && (
                  <div className="glass p-8 rounded-3xl border-t-4 border-t-primary border-x border-b border-white/10 shadow-lg space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-bold text-2xl shrink-0">
                        🎯
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-heading-light">Our Mission</h3>
                    </div>
                    <p className="text-text-light/90 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {missionStatement}
                    </p>
                  </div>
                )}

                {visionStatement && (
                  <div className="glass p-8 rounded-3xl border-t-4 border-t-secondary border-x border-b border-white/10 shadow-lg space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center font-bold text-2xl shrink-0">
                        👁️
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-heading-light">Our Vision</h3>
                    </div>
                    <p className="text-text-light/90 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {visionStatement}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── 4. Core Values ── */}
            {valuesList.length > 0 && (
              <div className="mb-12">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <span className="text-xs font-extrabold uppercase text-primary tracking-wider">What Guides Us</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-heading-light mt-1">Our Core Values</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                  {valuesList.map((val: any, i: number) => (
                    <div key={i} className="glass p-5 rounded-2xl border border-white/10 hover:border-primary/40 transition-all hover:-translate-y-1">
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">
                          {val.icon || '⭐'}
                        </div>
                        <h4 className="text-base font-bold text-heading-light">{val.title}</h4>
                      </div>
                      <p className="text-text-light/75 text-xs sm:text-sm leading-relaxed">{val.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 5. Why Choose Us ── */}
            {whyChooseUsList.length > 0 && (
              <div className="glass p-8 sm:p-12 rounded-3xl mb-12 border border-white/10">
                <div className="text-center max-w-xl mx-auto mb-8">
                  <span className="text-xs font-extrabold uppercase text-secondary tracking-wider">Our Competitive Edge</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-heading-light mt-1">Why Choose Us</h3>
                  <p className="text-xs sm:text-sm text-text-light/60 mt-1">What makes us the preferred partner for our customers.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {whyChooseUsList.map((reason: any, idx: number) => (
                    <div key={idx} className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-2 hover:border-white/20 transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-xl shrink-0">
                          {reason.icon || '✅'}
                        </div>
                        <h4 className="text-base font-bold text-heading-light">{reason.title}</h4>
                      </div>
                      <p className="text-xs text-text-light/75 leading-relaxed">{reason.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 6. Our Story (Timeline Journey) ── */}
            {(corp.story_beginning || corp.story_headline) && (
              <div className="glass p-8 sm:p-12 rounded-3xl mb-12 border border-white/10 space-y-8">
                <div className="text-center max-w-2xl mx-auto">
                  <span className="text-xs font-extrabold uppercase text-primary tracking-wider">The Journey</span>
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-heading-light mt-1 mb-2">
                    {corp.story_headline || 'Our Story'}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-light/60">How we grew from a clear problem to a complete solution.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="p-5 bg-white/5 rounded-2xl border-t-4 border-t-primary border-x border-b border-white/10 space-y-2">
                    <span className="text-xs font-extrabold uppercase text-primary tracking-wider block">1. The Beginning</span>
                    <p className="text-xs sm:text-sm text-text-light/80 leading-relaxed">{corp.story_beginning || 'Our journey began with a simple idea to make quality solutions accessible.'}</p>
                  </div>
                  <div className="p-5 bg-white/5 rounded-2xl border-t-4 border-t-amber-400 border-x border-b border-white/10 space-y-2">
                    <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wider block">2. The Problem</span>
                    <p className="text-xs sm:text-sm text-text-light/80 leading-relaxed">{corp.story_problem || 'Recognizing that customers struggled to find dependable, high-standard providers.'}</p>
                  </div>
                  <div className="p-5 bg-white/5 rounded-2xl border-t-4 border-t-emerald-400 border-x border-b border-white/10 space-y-2">
                    <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-wider block">3. The Solution</span>
                    <p className="text-xs sm:text-sm text-text-light/80 leading-relaxed">{corp.story_solution || 'Creating a reliable ecosystem built on verified quality, transparency, and support.'}</p>
                  </div>
                  <div className="p-5 bg-white/5 rounded-2xl border-t-4 border-t-cyan-400 border-x border-b border-white/10 space-y-2">
                    <span className="text-xs font-extrabold uppercase text-cyan-400 tracking-wider block">4. Today</span>
                    <p className="text-xs sm:text-sm text-text-light/80 leading-relaxed">{corp.story_today || 'Serving hundreds of happy customers with modern, scalable solutions.'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── 7 & 9. What We Offer + How It Works (Combined Adjacent Block) ── */}
            {((showProducts && (productCategories.length > 0 || productsWorkflow.length > 0)) ||
              (showServices && (serviceCategories.length > 0 || servicesWorkflow.length > 0))) && (
              <div className="mb-12 space-y-10">

                {/* Section headers */}
                <div className="text-center max-w-2xl mx-auto">
                  <span className="text-xs font-extrabold uppercase text-primary tracking-wider">Our Portfolio & Process</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-heading-light mt-1">What We Offer & How It Works</h3>
                  <p className="text-xs sm:text-sm text-text-light/60 mt-1">Explore what we provide and how we deliver it — step by step.</p>
                </div>

                {/* ── BOTH types: stacked sections, each full-width with 2 inner columns ── */}
                {showProducts && showServices ? (
                  <div className="space-y-8">
                    {/* What We Offer — 2-col */}
                    <div>
                      <h4 className="text-sm font-extrabold uppercase tracking-wider text-text-light/40 mb-4 text-center">📋 What We Offer</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Products */}
                        {productCategories.length > 0 && (
                          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
                            <h4 className="text-lg font-bold text-primary flex items-center gap-2">🛍️ Product Offerings</h4>
                            <div className="grid grid-cols-1 gap-3">
                              {productCategories.map((cat: any, i: number) => (
                                <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between hover:border-white/20 transition-all">
                                  <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">{cat.icon || '📦'}</div>
                                    <div>
                                      <h5 className="text-sm font-bold text-heading-light">{cat.title}</h5>
                                      <p className="text-xs text-text-light/70">{cat.description}</p>
                                    </div>
                                  </div>
                                  <Link href={cat.link || '/projects'} className="text-xs font-bold text-primary hover:underline ml-3 shrink-0">Browse →</Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Services */}
                        {serviceCategories.length > 0 && (
                          <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
                            <h4 className="text-lg font-bold text-secondary flex items-center gap-2">🛠️ Professional Services</h4>
                            <div className="grid grid-cols-1 gap-3">
                              {serviceCategories.map((cat: any, i: number) => (
                                <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between hover:border-white/20 transition-all">
                                  <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-xl shrink-0">{cat.icon || '💼'}</div>
                                    <div>
                                      <h5 className="text-sm font-bold text-heading-light">{cat.title}</h5>
                                      <p className="text-xs text-text-light/70">{cat.description}</p>
                                    </div>
                                  </div>
                                  <Link href={cat.link || '/services'} className="text-xs font-bold text-secondary hover:underline ml-3 shrink-0">Request →</Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* How It Works — 2-col */}
                    {(productsWorkflow.length > 0 || servicesWorkflow.length > 0) && (
                      <div>
                        <h4 className="text-sm font-extrabold uppercase tracking-wider text-text-light/40 mb-4 text-center">⚙️ How It Works</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {productsWorkflow.length > 0 && (
                            <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
                              <h4 className="text-base font-bold text-primary flex items-center gap-2">🛍️ Ordering Products</h4>
                              <div className="space-y-3">
                                {productsWorkflow.map((step: any, i: number) => (
                                  <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1.5">
                                    <div className="flex items-center gap-3">
                                      <span className="w-8 h-8 rounded-xl bg-primary text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow">{step.step || i + 1}</span>
                                      <h5 className="text-sm font-bold text-heading-light">{step.title}</h5>
                                    </div>
                                    <p className="text-xs text-text-light/70 pl-11">{step.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {servicesWorkflow.length > 0 && (
                            <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
                              <h4 className="text-base font-bold text-secondary flex items-center gap-2">🛠️ Booking Services</h4>
                              <div className="space-y-3">
                                {servicesWorkflow.map((step: any, i: number) => (
                                  <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1.5">
                                    <div className="flex items-center gap-3">
                                      <span className="w-8 h-8 rounded-xl bg-secondary text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow">{step.step || i + 1}</span>
                                      <h5 className="text-sm font-bold text-heading-light">{step.title}</h5>
                                    </div>
                                    <p className="text-xs text-text-light/70 pl-11">{step.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── SINGLE type: What We Offer (left) + How It Works (right) side-by-side on lg ── */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left — What We Offer */}
                    <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
                      {showProducts ? (
                        <>
                          <h4 className="text-lg font-bold text-primary flex items-center gap-2">🛍️ Product Offerings</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {productCategories.map((cat: any, i: number) => (
                              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between hover:border-white/20 transition-all">
                                <div className="flex items-center gap-3.5">
                                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">{cat.icon || '📦'}</div>
                                  <div>
                                    <h5 className="text-sm font-bold text-heading-light">{cat.title}</h5>
                                    <p className="text-xs text-text-light/70">{cat.description}</p>
                                  </div>
                                </div>
                                <Link href={cat.link || '/projects'} className="text-xs font-bold text-primary hover:underline ml-3 shrink-0">Browse →</Link>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <h4 className="text-lg font-bold text-secondary flex items-center gap-2">🛠️ Professional Services</h4>
                          <div className="grid grid-cols-1 gap-3">
                            {serviceCategories.map((cat: any, i: number) => (
                              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between hover:border-white/20 transition-all">
                                <div className="flex items-center gap-3.5">
                                  <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-xl shrink-0">{cat.icon || '💼'}</div>
                                  <div>
                                    <h5 className="text-sm font-bold text-heading-light">{cat.title}</h5>
                                    <p className="text-xs text-text-light/70">{cat.description}</p>
                                  </div>
                                </div>
                                <Link href={cat.link || '/services'} className="text-xs font-bold text-secondary hover:underline ml-3 shrink-0">Request →</Link>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Right — How It Works */}
                    <div className="glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
                      {showProducts ? (
                        <>
                          <h4 className="text-base font-bold text-primary flex items-center gap-2">🛍️ How Ordering Works</h4>
                          <div className="space-y-3">
                            {productsWorkflow.map((step: any, i: number) => (
                              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1.5">
                                <div className="flex items-center gap-3">
                                  <span className="w-8 h-8 rounded-xl bg-primary text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow">{step.step || i + 1}</span>
                                  <h5 className="text-sm font-bold text-heading-light">{step.title}</h5>
                                </div>
                                <p className="text-xs text-text-light/70 pl-11">{step.description}</p>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <h4 className="text-base font-bold text-secondary flex items-center gap-2">🛠️ How Booking Works</h4>
                          <div className="space-y-3">
                            {servicesWorkflow.map((step: any, i: number) => (
                              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1.5">
                                <div className="flex items-center gap-3">
                                  <span className="w-8 h-8 rounded-xl bg-secondary text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow">{step.step || i + 1}</span>
                                  <h5 className="text-sm font-bold text-heading-light">{step.title}</h5>
                                </div>
                                <p className="text-xs text-text-light/70 pl-11">{step.description}</p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── 8. Our Commitment & Customer Promises ── */}
            <div className="glass p-8 sm:p-12 rounded-3xl mb-12 border border-white/10 bg-gradient-to-br from-primary/10 to-transparent space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase text-primary tracking-wider">Accountability</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-heading-light mt-1 mb-3">Our Commitment to Customers</h3>
                <p className="text-text-light/90 text-sm sm:text-base leading-relaxed">{commitmentStatement}</p>
              </div>

              {customerPromises.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-sm font-bold text-heading-light mb-3">Our Guiding Customer Promises:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {customerPromises.map((promise, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/10 text-xs sm:text-sm font-semibold text-heading-light">
                        <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-xs font-extrabold shrink-0">
                          ✓
                        </div>
                        <span>{promise}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>


            {/* ── 10. Quality & Trust Assurance ── */}
            {qualityGuarantees.length > 0 && (
              <div className="glass p-8 sm:p-12 rounded-3xl mb-12 border border-white/10 space-y-6">
                <div className="text-center max-w-xl mx-auto">
                  <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-wider">Certified Standards</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-heading-light mt-1">Quality & Trust Assurance</h3>
                  <p className="text-xs sm:text-sm text-text-light/75 mt-2 leading-relaxed">{qualityText}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {qualityGuarantees.map((g: any, i: number) => (
                    <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-2 hover:border-emerald-400/40 transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
                          🛡️
                        </div>
                        <h4 className="text-base font-bold text-heading-light">{g.title}</h4>
                      </div>
                      <p className="text-xs text-text-light/80 leading-relaxed">{g.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 11. Meet The Leadership Team ── */}
            {teamMembers.length > 0 && (
              <div className="mb-12">
                <div className="text-center max-w-xl mx-auto mb-8">
                  <span className="text-xs font-extrabold uppercase text-primary tracking-wider">Our People</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-heading-light mt-1">
                    {corp.team_subtitle || 'Meet The People Behind The Brand'}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teamMembers.map((member: any, i: number) => (
                    <div key={i} className="glass p-6 rounded-2xl border border-white/10 text-center space-y-3 hover:border-primary/40 transition-all hover:-translate-y-1">
                      {member.image ? (
                        <img
                          src={getFileUrl(member.image)}
                          alt={member.name}
                          className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-primary/50 shadow-md"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-white/10 mx-auto flex items-center justify-center text-3xl border border-white/20">
                          👤
                        </div>
                      )}
                      <div>
                        <h4 className="text-lg font-bold text-heading-light">{member.name}</h4>
                        <p className="text-xs text-primary font-bold uppercase tracking-wider mt-0.5">{member.role}</p>
                      </div>
                      {member.bio && (
                        <p className="text-xs text-text-light/75 leading-relaxed pt-2 border-t border-white/10">{member.bio}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 12. Testimonials / Reviews (If configured in About CMS) ── */}
            {featuredReviews.length > 0 && (
              <div className="glass p-8 sm:p-12 rounded-3xl mb-12 border border-white/10 space-y-6">
                <div className="text-center max-w-xl mx-auto">
                  <span className="text-xs font-extrabold uppercase text-primary tracking-wider">Social Proof</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-heading-light mt-1">{testimonialsHeadline}</h3>
                  <p className="text-xs sm:text-sm text-text-light/60 mt-1">{testimonialsSummary}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredReviews.map((rev: any, i: number) => (
                    <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                      <div className="flex items-center gap-1 text-amber-400 text-sm">
                        {'★'.repeat(rev.rating || 5)}
                      </div>
                      <p className="text-xs sm:text-sm text-text-light/85 italic leading-relaxed">"{rev.review}"</p>
                      <div className="pt-2 border-t border-white/10">
                        <span className="text-xs font-bold text-heading-light block">{rev.name}</span>
                        {rev.role && <span className="text-[11px] text-text-light/50">{rev.role}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 13. Final Call to Action ── */}
            <div className="glass p-8 sm:p-14 rounded-3xl text-center border border-white/10 bg-gradient-to-r from-primary/25 via-background to-secondary/25 shadow-2xl space-y-5">
              <h3 className="text-2xl sm:text-4xl font-extrabold text-heading-light">
                {corp.cta_headline || 'Ready to Find What You Need?'}
              </h3>
              <p className="text-xs sm:text-base text-text-light/80 max-w-xl mx-auto">
                {corp.cta_subheadline || 'Explore our catalog or get in touch with our team today.'}
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link
                  href={corp.cta_btn1_url || (!showServices ? '/projects' : '/services')}
                  className="px-8 py-3.5 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary/90 transition-all shadow-lg hover:-translate-y-0.5"
                >
                  {corp.cta_btn1_text || (!showServices ? 'Explore Products' : 'Explore Services')} →
                </Link>
                <Link
                  href={corp.cta_btn2_url || '/contact'}
                  className="px-8 py-3.5 border border-white/20 text-heading-light font-bold text-sm rounded-full hover:bg-white/10 transition-all"
                >
                  {corp.cta_btn2_text || 'Contact Us'}
                </Link>
              </div>
            </div>
          </>
        )}

      </div>
    </section>
  );
}
