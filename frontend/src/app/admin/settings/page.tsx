'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/utils/api';
import { useRealtimeRefresh } from '@/utils/useRealtimeRefresh';
import { useRouter } from 'next/navigation';
import { SOCIAL_PLATFORMS, getSocialIcon } from '@/utils/socialIcons';
import DynamicPageSettingsForm from '@/components/admin/DynamicPageSettingsForm';

export default function SettingsAdmin() {
  const refreshKeySettings = useRealtimeRefresh('settings');
  const refreshKeySocial = useRealtimeRefresh('social');
  const [activeTab, setActiveTab] = useState<'theme' | 'content' | 'social'>('theme');

  // Theme State
  const [primary, setPrimary] = useState('59 130 246');
  const [secondary, setSecondary] = useState('249 115 22');
  const [bgDark, setBgDark] = useState('15 23 42');
  const [bgLight, setBgLight] = useState('241 245 249');
  const [headingColor, setHeadingColor] = useState('255 255 255');
  const [textColor, setTextColor] = useState('241 245 249');
  const [mutedColor, setMutedColor] = useState('148 163 184');
  const [navTextColor, setNavTextColor] = useState('255 255 255');
  const [subheadingColor, setSubheadingColor] = useState('148 163 184');
  const [buttonTextColor, setButtonTextColor] = useState('255 255 255');
  const [showSocialFloater, setShowSocialFloater] = useState(true);

  // Services Section Content State
  const [servicesSectionTitle, setServicesSectionTitle] = useState('What I Offer');
  const [servicesSectionSubtitle, setServicesSectionSubtitle] = useState('Professional services tailored to bring your ideas to life');
  const [servicesPageTitle, setServicesPageTitle] = useState('My Services');
  const [servicesPageSubtitle, setServicesPageSubtitle] = useState('Professional services to help you build, grow, and succeed');
  const [servicesCtaTitle, setServicesCtaTitle] = useState('Need a Custom Solution?');
  const [servicesCtaDescription, setServicesCtaDescription] = useState('Don\'t see exactly what you\'re looking for? Let\'s discuss your unique needs and create a tailored solution.');
  const [servicesCtaButtonText, setServicesCtaButtonText] = useState('Get in Touch');
  const [servicesDetailCtaTitle, setServicesDetailCtaTitle] = useState('Ready to Get Started?');
  const [servicesDetailCtaDescription, setServicesDetailCtaDescription] = useState('Let\'s discuss your project and how I can help bring your vision to life.');

  // Active content page selector
  const [activeContentPage, setActiveContentPage] = useState<'services' | 'about' | 'projects' | 'skills' | 'experience' | 'education' | 'contact' | 'testimonials' | 'events' | 'blog'>('services');

  // About Section Content State
  const [aboutSectionTitle, setAboutSectionTitle] = useState('About Me');
  const [aboutSectionButtonText, setAboutSectionButtonText] = useState('Discover My Journey');

  // Projects Section Content State
  const [projectsSectionTitle, setProjectsSectionTitle] = useState('Featured Projects');
  const [projectsPageTitle, setProjectsPageTitle] = useState('My Projects');
  const [projectsPageSubtitle, setProjectsPageSubtitle] = useState('Explore my work, case studies, and technical innovations');

  // Skills Section Content State
  const [skillsSectionTitle, setSkillsSectionTitle] = useState('Technical Skills');
  const [skillsPageTitle, setSkillsPageTitle] = useState('Skills & Expertise');
  const [skillsPageSubtitle, setSkillsPageSubtitle] = useState('Technologies, tools, and capabilities I work with');

  // Experience Section Content State
  const [experienceSectionTitle, setExperienceSectionTitle] = useState('Work Experience');
  const [experiencePageTitle, setExperiencePageTitle] = useState('Professional Journey');
  const [experiencePageSubtitle, setExperiencePageSubtitle] = useState('My career journey, roles, and professional achievements');

  // Education Section Content State
  const [educationSectionTitle, setEducationSectionTitle] = useState('Academic Education');
  const [educationPageTitle, setEducationPageTitle] = useState('Education & Learning');
  const [educationPageSubtitle, setEducationPageSubtitle] = useState('My academic background, degrees, and scholarly achievements');

  // Contact Section Content State
  const [contactSectionTitle, setContactSectionTitle] = useState('Get In Touch');
  const [contactPageTitle, setContactPageTitle] = useState('Let\'s Connect');
  const [contactPageSubtitle, setContactPageSubtitle] = useState('Have a project in mind or want to collaborate? I\'d love to hear from you');

  // Testimonials Section Content State
  const [testimonialsSectionTitle, setTestimonialsSectionTitle] = useState('Client & Peer Feedback');
  const [testimonialsPageTitle, setTestimonialsPageTitle] = useState('What People Say');
  const [testimonialsPageSubtitle, setTestimonialsPageSubtitle] = useState('Testimonials and endorsements from clients and colleagues');

  // Events Section Content State
  const [eventsSectionTitle, setEventsSectionTitle] = useState('Events & Networking');
  const [eventsPageTitle, setEventsPageTitle] = useState('Events & Networking');
  const [eventsPageSubtitle, setEventsPageSubtitle] = useState('Speaking engagements, conferences, and networking opportunities');

  // Blog Section Content State
  const [blogPageTitle, setBlogPageTitle] = useState('Insights, Ideas & Experiences');
  const [blogPageSubtitle, setBlogPageSubtitle] = useState('Thoughts, tutorials, and stories from my journey');

  // Social State
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);

  // All settings data for dynamic form
  const [allSettings, setAllSettings] = useState<Record<string, any>>({});

  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Load current settings
    fetchApi('/settings').then(res => {
      if (res.data) {
        // Store all settings for dynamic form
        setAllSettings(res.data);

        if (res.data.primary_color) setPrimary(res.data.primary_color);
        if (res.data.secondary_color) setSecondary(res.data.secondary_color);
        if (res.data.background_dark_color) setBgDark(res.data.background_dark_color);
        if (res.data.background_light_color) setBgLight(res.data.background_light_color);
        if (res.data.heading_color) setHeadingColor(res.data.heading_color);
        if (res.data.text_color) setTextColor(res.data.text_color);
        if (res.data.muted_color) setMutedColor(res.data.muted_color);
        if (res.data.nav_text_color) setNavTextColor(res.data.nav_text_color);
        if (res.data.subheading_color) setSubheadingColor(res.data.subheading_color);
        if (res.data.button_text_color) setButtonTextColor(res.data.button_text_color);
        if (res.data.show_social_floater !== undefined) setShowSocialFloater(res.data.show_social_floater === 'true');

        // Services Section Content
        if (res.data.services_section_title) setServicesSectionTitle(res.data.services_section_title);
        if (res.data.services_section_subtitle) setServicesSectionSubtitle(res.data.services_section_subtitle);
        if (res.data.services_page_title) setServicesPageTitle(res.data.services_page_title);
        if (res.data.services_page_subtitle) setServicesPageSubtitle(res.data.services_page_subtitle);
        if (res.data.services_cta_title) setServicesCtaTitle(res.data.services_cta_title);
        if (res.data.services_cta_description) setServicesCtaDescription(res.data.services_cta_description);
        if (res.data.services_cta_button_text) setServicesCtaButtonText(res.data.services_cta_button_text);
        if (res.data.services_detail_cta_title) setServicesDetailCtaTitle(res.data.services_detail_cta_title);
        if (res.data.services_detail_cta_description) setServicesDetailCtaDescription(res.data.services_detail_cta_description);

        // About Section Content
        if (res.data.about_section_title) setAboutSectionTitle(res.data.about_section_title);
        if (res.data.about_section_button_text) setAboutSectionButtonText(res.data.about_section_button_text);

        // Projects Section Content
        if (res.data.projects_section_title) setProjectsSectionTitle(res.data.projects_section_title);
        if (res.data.projects_page_title) setProjectsPageTitle(res.data.projects_page_title);
        if (res.data.projects_page_subtitle) setProjectsPageSubtitle(res.data.projects_page_subtitle);

        // Skills Section Content
        if (res.data.skills_section_title) setSkillsSectionTitle(res.data.skills_section_title);
        if (res.data.skills_page_title) setSkillsPageTitle(res.data.skills_page_title);
        if (res.data.skills_page_subtitle) setSkillsPageSubtitle(res.data.skills_page_subtitle);

        // Experience Section Content
        if (res.data.experience_section_title) setExperienceSectionTitle(res.data.experience_section_title);
        if (res.data.experience_page_title) setExperiencePageTitle(res.data.experience_page_title);
        if (res.data.experience_page_subtitle) setExperiencePageSubtitle(res.data.experience_page_subtitle);

        // Education Section Content
        if (res.data.education_section_title) setEducationSectionTitle(res.data.education_section_title);
        if (res.data.education_page_title) setEducationPageTitle(res.data.education_page_title);
        if (res.data.education_page_subtitle) setEducationPageSubtitle(res.data.education_page_subtitle);

        // Contact Section Content
        if (res.data.contact_section_title) setContactSectionTitle(res.data.contact_section_title);
        if (res.data.contact_page_title) setContactPageTitle(res.data.contact_page_title);
        if (res.data.contact_page_subtitle) setContactPageSubtitle(res.data.contact_page_subtitle);

        // Testimonials Section Content
        if (res.data.testimonials_section_title) setTestimonialsSectionTitle(res.data.testimonials_section_title);
        if (res.data.testimonials_page_title) setTestimonialsPageTitle(res.data.testimonials_page_title);
        if (res.data.testimonials_page_subtitle) setTestimonialsPageSubtitle(res.data.testimonials_page_subtitle);

        // Events Section Content
        if (res.data.events_section_title) setEventsSectionTitle(res.data.events_section_title);
        if (res.data.events_page_title) setEventsPageTitle(res.data.events_page_title);
        if (res.data.events_page_subtitle) setEventsPageSubtitle(res.data.events_page_subtitle);

        // Blog Section Content
        if (res.data.blog_page_title) setBlogPageTitle(res.data.blog_page_title);
        if (res.data.blog_page_subtitle) setBlogPageSubtitle(res.data.blog_page_subtitle);
      }
    }).catch(err => console.error(err));

    // Load social accounts
    fetchApi('/social').then(res => {
      if (res.success) {
        setSocialAccounts(res.data || []);
      }
    }).catch(err => console.error(err));
  }, [router, refreshKeySettings, refreshKeySocial]);

  // Real-time theme preview
  useEffect(() => {
    // Only apply if the variables are somewhat valid (simple check)
    if (primary) document.documentElement.style.setProperty('--color-primary-rgb', primary);
    if (secondary) document.documentElement.style.setProperty('--color-secondary-rgb', secondary);
    if (bgDark) {
      document.documentElement.style.setProperty('--color-bg-dark-rgb', bgDark);
      const parts = bgDark.split(' ');
      if (parts.length >= 3) {
        document.documentElement.style.setProperty('--glass-bg', `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, 0.7)`);
      }
    }
    if (bgLight) document.documentElement.style.setProperty('--color-bg-light-rgb', bgLight);
    if (headingColor) document.documentElement.style.setProperty('--color-heading-light-rgb', headingColor);
    if (textColor) document.documentElement.style.setProperty('--color-text-light-rgb', textColor);
    if (mutedColor) document.documentElement.style.setProperty('--color-muted-light-rgb', mutedColor);
    if (navTextColor) document.documentElement.style.setProperty('--color-nav-text-rgb', navTextColor);
    if (subheadingColor) document.documentElement.style.setProperty('--color-subheading-rgb', subheadingColor);
    if (buttonTextColor) document.documentElement.style.setProperty('--color-button-text-rgb', buttonTextColor);
  }, [primary, secondary, bgDark, bgLight, headingColor, textColor, mutedColor, navTextColor, subheadingColor, buttonTextColor]);

  // --- Theme Logic ---
  const handleThemeSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving Theme...');
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          primary_color: primary,
          secondary_color: secondary,
          background_dark_color: bgDark,
          background_light_color: bgLight,
          heading_color: headingColor,
          text_color: textColor,
          muted_color: mutedColor,
          nav_text_color: navTextColor,
          subheading_color: subheadingColor,
          button_text_color: buttonTextColor
        })
      });
      setMessage('Theme updated across the app.');
      document.documentElement.style.setProperty('--color-primary-rgb', primary);
      document.documentElement.style.setProperty('--color-secondary-rgb', secondary);
      document.documentElement.style.setProperty('--color-bg-dark-rgb', bgDark);
      document.documentElement.style.setProperty('--color-bg-light-rgb', bgLight);
      document.documentElement.style.setProperty('--color-heading-light-rgb', headingColor);
      document.documentElement.style.setProperty('--color-text-light-rgb', textColor);
      document.documentElement.style.setProperty('--color-muted-light-rgb', mutedColor);
      document.documentElement.style.setProperty('--color-nav-text-rgb', navTextColor);
      document.documentElement.style.setProperty('--color-subheading-rgb', subheadingColor);
      document.documentElement.style.setProperty('--color-button-text-rgb', buttonTextColor);

      const [r, g, b] = bgDark.split(' ').map(Number);
      document.documentElement.style.setProperty('--glass-bg', `rgba(${r}, ${g}, ${b}, 0.7)`);

      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleResetToDefaults = () => {
    setPrimary('59 130 246');       // Blue 500
    setSecondary('249 115 22');     // Orange 500
    setBgDark('15 23 42');          // Slate 900
    setBgLight('248 250 252');      // Slate 50
    setHeadingColor('255 255 255'); // White
    setTextColor('241 245 249');    // Slate 100
    setMutedColor('148 163 184');   // Slate 400
    setNavTextColor('255 255 255'); // White
    setSubheadingColor('148 163 184'); // Slate 400
    setButtonTextColor('255 255 255'); // White
    setMessage('Reset to default colors! Click Save to apply permanently.');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleToggleFloater = async (checked: boolean) => {
    setShowSocialFloater(checked);
    setMessage('Updating floater setting...');
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          show_social_floater: checked.toString()
        })
      });
      setMessage('Floater setting updated.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
      setShowSocialFloater(!checked); // revert on error
    }
  };

  // --- Content Save Handlers ---
  const handleServicesContentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving Services Section Content...');
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          services_section_title: servicesSectionTitle,
          services_section_subtitle: servicesSectionSubtitle,
          services_page_title: servicesPageTitle,
          services_page_subtitle: servicesPageSubtitle,
          services_cta_title: servicesCtaTitle,
          services_cta_description: servicesCtaDescription,
          services_cta_button_text: servicesCtaButtonText,
          services_detail_cta_title: servicesDetailCtaTitle,
          services_detail_cta_description: servicesDetailCtaDescription,
        })
      });
      setMessage('Services section content updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleAboutContentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving About Section Content...');
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          about_section_title: aboutSectionTitle,
          about_section_button_text: aboutSectionButtonText,
        })
      });
      setMessage('About section content updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleProjectsContentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving Projects Section Content...');
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          projects_section_title: projectsSectionTitle,
          projects_page_title: projectsPageTitle,
          projects_page_subtitle: projectsPageSubtitle,
        })
      });
      setMessage('Projects section content updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleSkillsContentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving Skills Section Content...');
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          skills_section_title: skillsSectionTitle,
          skills_page_title: skillsPageTitle,
          skills_page_subtitle: skillsPageSubtitle,
        })
      });
      setMessage('Skills section content updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleExperienceContentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving Experience Section Content...');
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          experience_section_title: experienceSectionTitle,
          experience_page_title: experiencePageTitle,
          experience_page_subtitle: experiencePageSubtitle,
        })
      });
      setMessage('Experience section content updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleEducationContentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving Education Section Content...');
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          education_section_title: educationSectionTitle,
          education_page_title: educationPageTitle,
          education_page_subtitle: educationPageSubtitle,
        })
      });
      setMessage('Education section content updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleContactContentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving Contact Section Content...');
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          contact_section_title: contactSectionTitle,
          contact_page_title: contactPageTitle,
          contact_page_subtitle: contactPageSubtitle,
        })
      });
      setMessage('Contact section content updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleTestimonialsContentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving Testimonials Section Content...');
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          testimonials_section_title: testimonialsSectionTitle,
          testimonials_page_title: testimonialsPageTitle,
          testimonials_page_subtitle: testimonialsPageSubtitle,
        })
      });
      setMessage('Testimonials section content updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleEventsContentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving Events Section Content...');
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          events_section_title: eventsSectionTitle,
          events_page_title: eventsPageTitle,
          events_page_subtitle: eventsPageSubtitle,
        })
      });
      setMessage('Events section content updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleBlogContentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Saving Blog Section Content...');
    try {
      await fetchApi('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          blog_page_title: blogPageTitle,
          blog_page_subtitle: blogPageSubtitle,
        })
      });
      setMessage('Blog section content updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const rgbToHex = (rgbStr: string) => {
    const parts = rgbStr.trim().split(/\s+/).map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return '#000000';
    return '#' + parts.map(x => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join('');
  };

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r} ${g} ${b}`;
  };

  // --- Social Logic ---
  const isWhatsApp = (platformName: string) => platformName?.toLowerCase().includes('whatsapp');

  // Extract phone number from a wa.me URL, or return the raw value if it's already just a number
  const extractWhatsAppNumber = (url: string) => {
    if (!url) return '';
    const match = url.match(/wa\.me\/([\d]+)/);
    if (match) return match[1];
    // If it's already just digits (user typed a number), return as-is
    return url.replace(/[^\d]/g, '') || url;
  };

  // Build wa.me URL from a phone number, auto-adding Kenya country code if needed
  const buildWhatsAppUrl = (phone: string) => {
    let cleaned = phone.replace(/[^\d]/g, '');
    // If number starts with 0, replace leading 0 with Kenya country code (254)
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    }
    return cleaned ? `https://wa.me/${cleaned}` : '';
  };

  const addSocialAccount = () => {
    setSocialAccounts([...socialAccounts, { id: 'new-' + Date.now(), platform_name: '', url: '', icon_class: 'fas fa-link', isNew: true, is_favorite: false }]);
  };

  const updateSocialField = (index: number, field: string, value: string) => {
    const updated = [...socialAccounts];
    updated[index] = { ...updated[index], [field]: value };
    setSocialAccounts(updated);
  };

  const saveSocialAccount = async (index: number) => {
    const account = { ...socialAccounts[index] };

    // For WhatsApp, auto-build the wa.me URL from the entered phone number
    if (isWhatsApp(account.platform_name)) {
      const cleaned = account.url?.replace(/[^\d]/g, '');
      if (!account.platform_name || !cleaned) {
        setMessage('Platform name and phone number are required.');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      account.url = buildWhatsAppUrl(cleaned);
    } else {
      if (!account.platform_name || !account.url) {
        setMessage('Platform name and URL are required.');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
    }

    setMessage('Saving...');
    try {
      if (account.isNew) {
        const { isNew, ...payload } = account;
        const res = await fetchApi('/social', { method: 'POST', body: JSON.stringify(payload) });
        if (res.success) {
          const updated = [...socialAccounts];
          updated[index] = res.data;
          setSocialAccounts(updated);
          setMessage('Social account created!');
        }
      } else {
        await fetchApi(`/social/${account.id}`, { method: 'PUT', body: JSON.stringify(account) });
        // Update local state with the constructed URL
        const updated = [...socialAccounts];
        updated[index] = { ...updated[index], url: account.url };
        setSocialAccounts(updated);
        setMessage('Social account updated!');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const deleteSocialAccount = async (index: number) => {
    const account = socialAccounts[index];
    if (account.isNew) {
      const updated = [...socialAccounts];
      updated.splice(index, 1);
      setSocialAccounts(updated);
      return;
    }
    if (!confirm('Delete this social link?')) return;
    setMessage('Deleting...');
    try {
      await fetchApi(`/social/${account.id}`, { method: 'DELETE' });
      const updated = [...socialAccounts];
      updated.splice(index, 1);
      setSocialAccounts(updated);
      setMessage('Deleted!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };



  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Global Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg w-fit mb-8 border border-gray-800">
        <button
          onClick={() => setActiveTab('theme')}
          className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ${activeTab === 'theme' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
        >
          <i className="fas fa-palette mr-2"></i>Theme
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ${activeTab === 'content' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
        >
          💼 Content
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ${activeTab === 'social' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
        >
          <i className="fas fa-share-nodes mr-2"></i>Social Media
        </button>
      </div>

      {/* Status message */}
      {message && (
        <div className="mb-6 p-4 bg-blue-900/50 text-blue-200 rounded-lg border border-blue-800 max-w-3xl flex items-center animate-fade-in">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {message}
        </div>
      )}

      {/* ======================== THEME TAB ======================== */}
      {activeTab === 'theme' && (
        <div className="animate-fade-in space-y-8">
          <div className="bg-gray-800 p-6 rounded-xl max-w-2xl border border-gray-700 shadow-xl">
            <h2 className="text-xl font-bold mb-1 text-white">Color Palette</h2>
            <p className="text-gray-400 mb-6 text-sm">
              Enter RGB values (space separated) or click the swatch to pick a shade visually.
            </p>

            <form onSubmit={handleThemeSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Primary Color</label>
                <p className="text-xs text-text-light/60 mb-2">
                  Applies to main action buttons (e.g., "Download Resume"), active navigation items, progress bar fills, and primary timeline markers.
                </p>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={primary}
                    onChange={e => setPrimary(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 59 130 246"
                  />
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 shadow-inner flex-shrink-0 cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="color"
                      value={rgbToHex(primary)}
                      onChange={e => setPrimary(hexToRgb(e.target.value))}
                      className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Secondary Color</label>
                <p className="text-xs text-text-light/60 mb-2">
                  Applies to date badges (e.g., "January 2026"), percentage values, highlighted heading tags (like "Feedback" or "Skills"), and accent links.
                </p>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={secondary}
                    onChange={e => setSecondary(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 249 115 22"
                  />
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 shadow-inner flex-shrink-0 cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="color"
                      value={rgbToHex(secondary)}
                      onChange={e => setSecondary(hexToRgb(e.target.value))}
                      className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Dark Mode Background</label>
                <p className="text-xs text-text-light/60 mb-2">
                  The primary background color used throughout the app when in dark mode (default: Slate 900).
                </p>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={bgDark}
                    onChange={e => setBgDark(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 15 23 42"
                  />
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 shadow-inner flex-shrink-0 cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="color"
                      value={rgbToHex(bgDark)}
                      onChange={e => setBgDark(hexToRgb(e.target.value))}
                      className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Light Mode Background</label>
                <p className="text-xs text-text-light/60 mb-2">
                  The primary background color used throughout the app when in light mode (default: Slate 100).
                </p>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={bgLight}
                    onChange={e => setBgLight(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 241 245 249"
                  />
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 shadow-inner flex-shrink-0 cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="color"
                      value={rgbToHex(bgLight)}
                      onChange={e => setBgLight(hexToRgb(e.target.value))}
                      className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Heading Color</label>
                <p className="text-xs text-text-light/60 mb-2">
                  Applied to main titles and section headings (e.g., "Projects", "Experience").
                </p>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={headingColor}
                    onChange={e => setHeadingColor(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 255 255 255"
                  />
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 shadow-inner flex-shrink-0 cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="color"
                      value={rgbToHex(headingColor)}
                      onChange={e => setHeadingColor(hexToRgb(e.target.value))}
                      className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Base / Body Text Color</label>
                <p className="text-xs text-text-light/60 mb-2">
                  Applied to standard paragraphs, descriptions, and the core highlight blockquotes.
                </p>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={textColor}
                    onChange={e => setTextColor(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 241 245 249"
                  />
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 shadow-inner flex-shrink-0 cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="color"
                      value={rgbToHex(textColor)}
                      onChange={e => setTextColor(hexToRgb(e.target.value))}
                      className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Subheading / Label Color</label>
                <p className="text-xs text-text-light/60 mb-2">
                  Applied to small, bold section labels (e.g., "KEY COURSEWORK", "RESEARCH").
                </p>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={subheadingColor}
                    onChange={e => setSubheadingColor(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 148 163 184"
                  />
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 shadow-inner flex-shrink-0 cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="color"
                      value={rgbToHex(subheadingColor)}
                      onChange={e => setSubheadingColor(hexToRgb(e.target.value))}
                      className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Muted / Tag Color</label>
                <p className="text-xs text-text-light/60 mb-2">
                  Applied to secondary information, date labels, and UI tags (e.g., Coursework pills).
                </p>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={mutedColor}
                    onChange={e => setMutedColor(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 148 163 184"
                  />
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 shadow-inner flex-shrink-0 cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="color"
                      value={rgbToHex(mutedColor)}
                      onChange={e => setMutedColor(hexToRgb(e.target.value))}
                      className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Navigation Bar Text Color</label>
                <p className="text-xs text-text-light/60 mb-2">
                  Applied to the top navigation links ("About", "Projects", etc).
                </p>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={navTextColor}
                    onChange={e => setNavTextColor(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 255 255 255"
                  />
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 shadow-inner flex-shrink-0 cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="color"
                      value={rgbToHex(navTextColor)}
                      onChange={e => setNavTextColor(hexToRgb(e.target.value))}
                      className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Button Text Color</label>
                <p className="text-xs text-text-light/60 mb-2">
                  Applied to the text inside Primary and Secondary buttons.
                </p>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={buttonTextColor}
                    onChange={e => setButtonTextColor(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 255 255 255"
                  />
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 shadow-inner flex-shrink-0 cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="color"
                      value={rgbToHex(buttonTextColor)}
                      onChange={e => setButtonTextColor(hexToRgb(e.target.value))}
                      className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-8 py-3 bg-primary hover:bg-blue-600 rounded-lg font-bold transition-colors shadow-lg shadow-primary/20 text-white"
                >
                  Save Theme Colors
                </button>
                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="flex-1 sm:flex-none px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-bold transition-colors text-gray-300"
                >
                  Reset to Defaults
                </button>
              </div>
            </form>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl max-w-2xl border border-gray-700 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-white">Preview</h2>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-2.5 bg-primary rounded-lg text-white font-medium shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
                  Primary Button
                </button>
                <button className="px-6 py-2.5 bg-secondary rounded-lg text-white font-medium shadow-lg shadow-secondary/20 hover:opacity-90 transition-opacity">
                  Secondary Button
                </button>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                <p className="text-gray-300">This text highlights a <span className="text-primary font-bold">primary accent</span> and a <span className="text-secondary font-bold">secondary accent</span> to demonstrate contrast.</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl max-w-2xl border border-gray-700 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-white">How Colors are Used</h2>
            <div className="space-y-4 text-sm text-text-light/80">
              <p>
                Apart from the customizable colors above, the site relies on a **5-Core Color System** that automatically switches between dark and light themes:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs">
                <li><strong>Primary Color:</strong> Used exclusively for main interactive actions (buttons, active navigation) and key timeline markers.</li>
                <li><strong>Secondary Color:</strong> Used for highlighted keywords, milestone tags (e.g., date ranges), and skill levels.</li>
                <li><strong>Base Background:</strong> slate-900 (Dark theme) / slate-100 (Light theme). Adjusts automatically via the theme toggle.</li>
                <li><strong>Card Surfaces:</strong> Semi-transparent glass panels with backdrop filters that shift between transparent dark (Dark theme) and frosted white (Light theme) to group items cleanly.</li>
                <li><strong>Text & Details:</strong> High-contrast Slate text with varying opacities to establish clean content hierarchy.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ======================== CONTENT TAB ======================== */}
      {activeTab === 'content' && (
        <div className="animate-fade-in space-y-8">
          <div className="bg-gray-800 p-6 rounded-xl max-w-3xl border border-gray-700 shadow-xl">
            <h2 className="text-2xl font-bold mb-2 text-white">📝 Page Content Settings</h2>
            <p className="text-gray-400 mb-6">
              Edit content for any page across your portfolio. Select a page below and customize titles, descriptions, CTA sections, and more.
            </p>

            <DynamicPageSettingsForm
              settingsData={allSettings}
              onSaveSuccess={() => {
                // Refresh settings after save
                fetchApi('/settings').then(res => {
                  if (res.data) {
                    setAllSettings(res.data);
                  }
                });
              }}
            />
          </div>
        </div>
      )}

      {/* ======================== SOCIAL TAB ======================== */}
      {activeTab === 'social' && (
        <div className="animate-fade-in space-y-6">
          <div className="flex justify-between items-center max-w-4xl">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Social Accounts</h2>
              <p className="text-sm text-gray-400">Manage links to your social media profiles. These appear in the Hero and Footer sections.</p>
            </div>
            <button
              onClick={addSocialAccount}
              className="px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-2 text-sm font-medium"
            >
              <i className="fas fa-plus"></i> Add Account
            </button>
          </div>

          <div className="bg-gray-800 p-4 rounded-xl max-w-4xl border border-gray-700 flex items-center justify-between">
            <div>
              <h3 className="text-md font-bold text-white mb-1">Floating Sidebar</h3>
              <p className="text-xs text-gray-400">Displays a sticky sidebar with all your social icons on the left side of the screen.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showSocialFloater}
                onChange={(e) => handleToggleFloater(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="max-w-4xl space-y-4">
            {socialAccounts.length === 0 ? (
              <div className="p-12 border-2 border-dashed border-gray-700 rounded-xl text-center">
                <i className="fas fa-share-nodes text-4xl text-gray-600 mb-4 block"></i>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No social accounts configured</h3>
                <p className="text-gray-500 mb-4">Click the button above to add your first social media link.</p>
              </div>
            ) : (
              socialAccounts.map((account, index) => (
                <div key={account.id} className={`bg-gray-800 border rounded-xl p-5 shadow-lg relative transition-all ${account.isNew ? 'border-primary/50 ring-1 ring-primary/20' : 'border-gray-700'}`}>
                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex gap-4">
                    <button
                      onClick={() => saveSocialAccount(index)}
                      className="text-primary hover:text-blue-400 font-medium text-sm flex items-center gap-1.5 transition-colors"
                    >
                      <i className="fas fa-save"></i> Save
                    </button>
                    <button
                      onClick={() => deleteSocialAccount(index)}
                      className="text-red-500 hover:text-red-400 font-medium text-sm flex items-center gap-1.5 transition-colors"
                    >
                      <i className="fas fa-trash-alt"></i> Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 mr-28">
                    {/* Platform Name */}
                    <div className="col-span-1 sm:col-span-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Platform</label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-gray-400 hover:text-gray-300">
                          <input
                            type="checkbox"
                            checked={account.is_favorite || false}
                            onChange={(e) => updateSocialField(index, 'is_favorite', e.target.checked as any)}
                            className="rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary w-3.5 h-3.5"
                          />
                          Favorite
                        </label>
                      </div>
                      <select
                        value={SOCIAL_PLATFORMS.includes(account.platform_name as any) ? account.platform_name : '__custom__'}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === '__custom__') {
                            updateSocialField(index, 'platform_name', '');
                          } else {
                            updateSocialField(index, 'platform_name', val);
                          }
                        }}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2.5 text-white text-sm focus:border-primary outline-none transition-colors mb-2"
                      >
                        <option value="__custom__">Custom...</option>
                        {SOCIAL_PLATFORMS.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                      {!SOCIAL_PLATFORMS.includes(account.platform_name as any) && (
                        <input
                          type="text"
                          value={account.platform_name}
                          onChange={e => updateSocialField(index, 'platform_name', e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 rounded p-2.5 text-white text-sm focus:border-primary outline-none transition-colors"
                          placeholder="Platform name"
                        />
                      )}
                    </div>

                    {/* Profile URL / WhatsApp Phone */}
                    <div className="col-span-1 sm:col-span-6">
                      {isWhatsApp(account.platform_name) ? (
                        <>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Phone Number</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">+</span>
                            <input
                              type="tel"
                              value={extractWhatsAppNumber(account.url)}
                              onChange={e => {
                                // Store the raw phone number — it gets converted to wa.me URL on save
                                const digits = e.target.value.replace(/[^\d]/g, '');
                                updateSocialField(index, 'url', digits);
                              }}
                              className="w-full bg-gray-900 border border-gray-700 rounded p-2.5 pl-7 text-white text-sm focus:border-primary outline-none transition-colors"
                              placeholder="254712345678"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            Enter with country code (e.g. <strong>254712345678</strong>) or local format (e.g. <strong>0712345678</strong>) — Kenya code <strong>254</strong> is added automatically.
                          </p>
                        </>
                      ) : (
                        <>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Profile URL</label>
                          <input
                            type="text"
                            value={account.url}
                            onChange={e => updateSocialField(index, 'url', e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2.5 text-white text-sm focus:border-primary outline-none transition-colors"
                            placeholder="https://linkedin.com/in/yourname"
                          />
                        </>
                      )}
                    </div>

                    {/* Icon Preview */}
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Icon</label>
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 flex-shrink-0 bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center text-gray-300">
                          {getSocialIcon(account.platform_name)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )
      }
    </div >
  );
}
