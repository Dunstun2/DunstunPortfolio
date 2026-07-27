const { About, Hero, Project, Service, Experience, Education, Skill, Testimonial, Event, BlogPost, Achievement, Certification } = require('../models');
const { Op } = require('sequelize');

class SectionStatusController {
  /**
   * Returns which portfolio sections have published/available content.
   * The navbar uses this to hide links for empty or archived sections.
   */
  async getAvailableSections(req, res) {
    try {
      const [about, hero, projects, services, experience, education, skills, testimonials, events, blog, achievements, certifications] = await Promise.all([
        About.count({ where: { status: 'published' } }),
        Hero.count({ where: { status: 'published' } }),
        Project.count({ where: { status: 'published' } }),
        Service.count({ where: { status: 'published' } }),
        Experience.count(),
        Education.count(),
        Skill.count(),
        Testimonial.count({ where: { status: 'published' } }).catch(() => Testimonial.count()),
        Event.count({ where: { status: 'published' } }).catch(() => Event.count()),
        BlogPost.count({ where: { status: 'published' } }).catch(() => BlogPost.count()),
        Achievement.count({ where: { status: 'published' } }).catch(() => Achievement.count()),
        Certification.count({ where: { status: 'published' } }).catch(() => Certification.count()),
      ]);

      res.json({
        success: true,
        data: {
          about: about > 0,
          hero: hero > 0,
          projects: projects > 0,
          services: services > 0,
          experience: experience > 0,
          education: education > 0,
          skills: skills > 0,
          testimonials: testimonials > 0,
          events: events > 0,
          blog: blog > 0,
          achievements: achievements > 0,
          certifications: certifications > 0,
          contact: true, // always available
        }
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
}

module.exports = new SectionStatusController();
