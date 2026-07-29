const { Setting } = require('../models');

class SettingService {
  async getAllSettings() {
    const settings = await Setting.findAll({ raw: true });
    const result = {};
    settings.forEach(s => result[s.key] = s.value);

    // Provide defaults if they don't exist
    if (!result['primary_color']) result['primary_color'] = '59 130 246'; // Blue
    if (!result['secondary_color']) result['secondary_color'] = '249 115 22'; // Orange
    if (!result['background_dark_color']) result['background_dark_color'] = '15 23 42'; // Slate 900
    if (!result['background_light_color']) result['background_light_color'] = '241 245 249'; // Slate 100
    if (!result['heading_color']) result['heading_color'] = '255 255 255'; // White (light text on dark bg)
    if (!result['text_color']) result['text_color'] = '241 245 249'; // Slate 100 (light body text on dark bg)
    if (!result['muted_color']) result['muted_color'] = '148 163 184'; // Slate 400 (muted text)
    if (!result['nav_text_color']) result['nav_text_color'] = '255 255 255'; // White (nav text)
    if (!result['subheading_color']) result['subheading_color'] = '148 163 184'; // Slate 400 (subheadings)
    if (!result['button_text_color']) result['button_text_color'] = '255 255 255'; // White (button text)
    if (result['show_social_floater'] === undefined) result['show_social_floater'] = 'true';

    // Services Section Defaults
    if (!result['services_section_title']) result['services_section_title'] = 'What I Offer';
    if (!result['services_section_subtitle']) result['services_section_subtitle'] = 'Professional services tailored to bring your ideas to life';
    if (!result['services_page_title']) result['services_page_title'] = 'My Services';
    if (!result['services_page_subtitle']) result['services_page_subtitle'] = 'Professional services to help you build, grow, and succeed';
    if (!result['services_cta_title']) result['services_cta_title'] = 'Need a Custom Solution?';
    if (!result['services_cta_description']) result['services_cta_description'] = 'Don\'t see exactly what you\'re looking for? Let\'s discuss your unique needs and create a tailored solution.';
    if (!result['services_cta_button_text']) result['services_cta_button_text'] = 'Get in Touch';
    if (!result['services_detail_cta_title']) result['services_detail_cta_title'] = 'Ready to Get Started?';
    if (!result['services_detail_cta_description']) result['services_detail_cta_description'] = 'Let\'s discuss your project and how I can help bring your vision to life.';

    // ========================================
    // ABOUT SECTION
    // ========================================
    // Homepage Section
    if (!result['about_section_title']) result['about_section_title'] = 'About Me';
    if (!result['about_section_button_text']) result['about_section_button_text'] = 'Discover My Journey';
    // About Page
    if (!result['about_page_title']) result['about_page_title'] = 'About Me';
    if (!result['about_page_subtitle']) result['about_page_subtitle'] = 'Learn more about my journey, values, and what drives me';
    // Mission Section
    if (!result['about_mission_title']) result['about_mission_title'] = 'My Mission';
    if (!result['about_mission_description']) result['about_mission_description'] = 'Dedicated to creating meaningful impact through innovation and excellence';
    // Values Section
    if (!result['about_values_title']) result['about_values_title'] = 'Core Values';
    if (!result['about_values_description']) result['about_values_description'] = 'The principles that guide my work and decisions';
    // CTA Section
    if (!result['about_cta_title']) result['about_cta_title'] = 'Let\'s Connect';
    if (!result['about_cta_description']) result['about_cta_description'] = 'I\'m always open to new opportunities and collaborations';
    if (!result['about_cta_button_text']) result['about_cta_button_text'] = 'Get in Touch';

    // ========================================
    // PROJECTS SECTION
    // ========================================
    // Homepage Section
    if (!result['projects_section_title']) result['projects_section_title'] = 'Featured Projects';
    // Projects Page
    if (!result['projects_page_title']) result['projects_page_title'] = 'My Projects';
    if (!result['projects_page_subtitle']) result['projects_page_subtitle'] = 'Explore my work, case studies, and technical innovations';
    // CTA Section
    if (!result['projects_cta_title']) result['projects_cta_title'] = 'Have a Project in Mind?';
    if (!result['projects_cta_description']) result['projects_cta_description'] = 'Let\'s collaborate to bring your ideas to life with innovative solutions';
    if (!result['projects_cta_button_text']) result['projects_cta_button_text'] = 'Start a Project';
    // Detail Page CTA
    if (!result['projects_detail_cta_title']) result['projects_detail_cta_title'] = 'Interested in Similar Work?';
    if (!result['projects_detail_cta_description']) result['projects_detail_cta_description'] = 'Let\'s discuss how I can help with your project needs';
    // Empty State
    if (!result['projects_empty_message']) result['projects_empty_message'] = 'No projects available at this time';

    // ========================================
    // SKILLS SECTION
    // ========================================
    // Homepage Section
    if (!result['skills_section_title']) result['skills_section_title'] = 'Technical Skills';
    // Skills Page
    if (!result['skills_page_title']) result['skills_page_title'] = 'Skills & Expertise';
    if (!result['skills_page_subtitle']) result['skills_page_subtitle'] = 'Technologies, tools, and capabilities I work with';
    // CTA Section
    if (!result['skills_cta_title']) result['skills_cta_title'] = 'Looking for These Skills?';
    if (!result['skills_cta_description']) result['skills_cta_description'] = 'Let\'s discuss how my expertise can help achieve your goals';
    if (!result['skills_cta_button_text']) result['skills_cta_button_text'] = 'Let\'s Talk';
    // Empty State
    if (!result['skills_empty_message']) result['skills_empty_message'] = 'Skills information coming soon';

    // ========================================
    // EXPERIENCE SECTION
    // ========================================
    // Homepage Section
    if (!result['experience_section_title']) result['experience_section_title'] = 'Work Experience';
    // Experience Page
    if (!result['experience_page_title']) result['experience_page_title'] = 'Professional Journey';
    if (!result['experience_page_subtitle']) result['experience_page_subtitle'] = 'My career journey, roles, and professional achievements';
    // CTA Section
    if (!result['experience_cta_title']) result['experience_cta_title'] = 'Let\'s Work Together';
    if (!result['experience_cta_description']) result['experience_cta_description'] = 'Bring my experience and expertise to your next project';
    if (!result['experience_cta_button_text']) result['experience_cta_button_text'] = 'Get in Touch';
    // Empty State
    if (!result['experience_empty_message']) result['experience_empty_message'] = 'Experience information coming soon';

    // ========================================
    // EDUCATION SECTION
    // ========================================
    // Homepage Section
    if (!result['education_section_title']) result['education_section_title'] = 'Academic Education';
    // Education Page
    if (!result['education_page_title']) result['education_page_title'] = 'Education & Learning';
    if (!result['education_page_subtitle']) result['education_page_subtitle'] = 'My academic background, degrees, and scholarly achievements';
    // CTA Section
    if (!result['education_cta_title']) result['education_cta_title'] = 'Interested in Collaboration?';
    if (!result['education_cta_description']) result['education_cta_description'] = 'Let\'s connect and explore opportunities to work together';
    if (!result['education_cta_button_text']) result['education_cta_button_text'] = 'Contact Me';
    // Empty State
    if (!result['education_empty_message']) result['education_empty_message'] = 'Education information coming soon';

    // ========================================
    // CONTACT SECTION
    // ========================================
    // Homepage Section
    if (!result['contact_section_title']) result['contact_section_title'] = 'Get In Touch';
    // Contact Page
    if (!result['contact_page_title']) result['contact_page_title'] = 'Let\'s Connect';
    if (!result['contact_page_subtitle']) result['contact_page_subtitle'] = 'Have a project in mind or want to collaborate? I\'d love to hear from you';

    // Hero Section
    if (!result['hero_title']) result['hero_title'] = 'Let\'s Connect';
    if (!result['hero_subtitle']) result['hero_subtitle'] = 'Get In Touch';
    if (!result['hero_description']) result['hero_description'] = 'Have an opportunity, project idea, or collaboration in mind? I\'d be happy to hear from you.';
    if (!result['hero_image']) result['hero_image'] = '';

    // Introduction Section
    if (!result['intro_title']) result['intro_title'] = 'Let\'s Start a Conversation';
    if (!result['intro_description']) result['intro_description'] = 'Whether you\'re interested in working together, discussing an idea, or simply connecting professionally, feel free to reach out.';
    if (!result['intro_image']) result['intro_image'] = '';

    // Contact Information
    if (!result['contact_email']) result['contact_email'] = '';
    if (!result['contact_phone']) result['contact_phone'] = '';
    if (!result['contact_location']) result['contact_location'] = '';
    if (!result['contact_address']) result['contact_address'] = '';
    if (result['show_email'] === undefined) result['show_email'] = 'true';
    if (result['show_phone'] === undefined) result['show_phone'] = 'true';
    if (result['show_location'] === undefined) result['show_location'] = 'true';
    if (result['show_address'] === undefined) result['show_address'] = 'false';
    if (!result['preferred_method']) result['preferred_method'] = 'Email';

    // Availability
    if (!result['availability_status']) result['availability_status'] = 'available';
    if (!result['availability_message']) result['availability_message'] = 'Currently open to selected freelance projects and collaborations.';

    // Response Information
    if (!result['response_title']) result['response_title'] = 'Response Time';
    if (!result['response_description']) result['response_description'] = 'I typically respond within 1-3 business days.';
    if (!result['expected_response_time']) result['expected_response_time'] = '1-3 business days';

    // CTA
    if (!result['cta_title']) result['cta_title'] = 'Ready to Work Together?';
    if (!result['cta_description']) result['cta_description'] = 'Let\'s connect and discuss your project or opportunity.';
    if (!result['cta_button_text']) result['cta_button_text'] = 'Send Message';

    // Info Section (Legacy - keeping for compatibility)
    if (!result['contact_info_title']) result['contact_info_title'] = 'Contact Information';
    if (!result['contact_info_description']) result['contact_info_description'] = 'Feel free to reach out through any of these channels';

    // Form Section
    if (!result['contact_form_title']) result['contact_form_title'] = 'Send a Message';
    if (!result['contact_form_description']) result['contact_form_description'] = 'Fill out the form below and I\'ll get back to you as soon as possible';
    if (!result['contact_submit_button_text']) result['contact_submit_button_text'] = 'Send Message';

    // Form Configuration
    if (result['form_enabled'] === undefined) result['form_enabled'] = 'true';
    if (result['require_name'] === undefined) result['require_name'] = 'true';
    if (result['require_email'] === undefined) result['require_email'] = 'true';
    if (result['require_subject'] === undefined) result['require_subject'] = 'false';
    if (result['require_phone'] === undefined) result['require_phone'] = 'false';
    if (result['require_message'] === undefined) result['require_message'] = 'true';
    if (result['show_organization'] === undefined) result['show_organization'] = 'false';
    if (result['show_website'] === undefined) result['show_website'] = 'false';
    if (result['show_budget'] === undefined) result['show_budget'] = 'false';
    if (!result['contact_reasons']) result['contact_reasons'] = 'General Inquiry,Job Opportunity,Freelance Project,Collaboration,Partnership,Speaking / Event,Mentorship,Feedback,Other';

    // Success Message
    if (!result['contact_success_message']) result['contact_success_message'] = 'Thank you! Your message has been sent successfully';
    if (result['redirect_after_submit'] === undefined) result['redirect_after_submit'] = 'false';
    if (!result['redirect_url']) result['redirect_url'] = '';

    // Email Notifications
    if (!result['notification_email']) result['notification_email'] = '';
    if (result['send_admin_notification'] === undefined) result['send_admin_notification'] = 'true';
    if (result['send_auto_reply'] === undefined) result['send_auto_reply'] = 'false';
    if (!result['auto_reply_subject']) result['auto_reply_subject'] = 'Thanks for contacting me!';
    if (!result['auto_reply_message']) result['auto_reply_message'] = 'Thank you for reaching out. I have received your message and will get back to you as soon as possible.';

    // Spam Protection
    if (result['enable_rate_limiting'] === undefined) result['enable_rate_limiting'] = 'true';
    if (!result['max_submissions_per_hour']) result['max_submissions_per_hour'] = '5';
    if (result['enable_honeypot'] === undefined) result['enable_honeypot'] = 'true';
    if (!result['blocked_domains']) result['blocked_domains'] = '';

    // Privacy
    if (result['store_ip_address'] === undefined) result['store_ip_address'] = 'false';
    if (!result['data_retention_days']) result['data_retention_days'] = '90';
    if (result['show_privacy_notice'] === undefined) result['show_privacy_notice'] = 'true';
    if (!result['privacy_notice_text']) result['privacy_notice_text'] = 'Your information will be kept confidential and used solely for responding to your inquiry.';

    // Social CTA
    if (!result['contact_social_title']) result['contact_social_title'] = 'Connect on Social Media';
    if (!result['contact_social_description']) result['contact_social_description'] = 'Follow me on social media for updates and insights';

    // ========================================
    // TESTIMONIALS SECTION
    // ========================================
    // Homepage Section
    if (!result['testimonials_section_title']) result['testimonials_section_title'] = 'Client & Peer Feedback';
    // Testimonials Page
    if (!result['testimonials_page_title']) result['testimonials_page_title'] = 'What People Say';
    if (!result['testimonials_page_subtitle']) result['testimonials_page_subtitle'] = 'Testimonials and endorsements from clients and colleagues';
    // CTA Section
    if (!result['testimonials_cta_title']) result['testimonials_cta_title'] = 'Want to Share Your Experience?';
    if (!result['testimonials_cta_description']) result['testimonials_cta_description'] = 'I\'d love to hear about your experience working with me';
    if (!result['testimonials_cta_button_text']) result['testimonials_cta_button_text'] = 'Leave a Testimonial';
    // Empty State
    if (!result['testimonials_empty_message']) result['testimonials_empty_message'] = 'No testimonials available yet';

    // Events Section Defaults
    if (!result['events_section_title']) result['events_section_title'] = 'Events & Networking';
    if (!result['events_page_title']) result['events_page_title'] = 'Events & Networking';
    if (!result['events_page_subtitle']) result['events_page_subtitle'] = 'Speaking engagements, conferences, and networking opportunities';

    // Blog Section Defaults
    if (!result['blog_page_title']) result['blog_page_title'] = 'Insights, Ideas & Experiences';
    if (!result['blog_page_subtitle']) result['blog_page_subtitle'] = 'Thoughts, tutorials, and stories from my journey';

    return result;
  }

  async updateSettings(settingsData) {
    const keys = Object.keys(settingsData);
    for (const key of keys) {
      const value = settingsData[key];
      // Upsert the setting
      const [setting, created] = await Setting.findOrCreate({
        where: { key },
        defaults: { value }
      });
      if (!created) {
        setting.value = value;
        await setting.save();
      }
    }
    return await this.getAllSettings();
  }
}

module.exports = new SettingService();
