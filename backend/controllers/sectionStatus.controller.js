const { About, Hero, Project, Service, Experience, Education, Skill, Testimonial, Event, BlogPost, Achievement, Certification } = require('../models');

// Helper: count with optional where clause, always returns 0 on error
const safeCount = async (model, where) => {
  try {
    return await model.count(where ? { where } : {});
  } catch {
    return 0;
  }
};

class SectionStatusController {
  /**
   * Returns which portfolio sections have published/available content.
   * The navbar uses this to hide links for empty or archived sections.
   */
  async getAvailableSections(req, res) {
    try {
      const [about, hero, projects, services, experience, education, skills, testimonials, events, blog, achievements, certifications] = await Promise.all([
        safeCount(About, { status: 'published' }),
        safeCount(Hero, { status: 'published' }),
        safeCount(Project, { status: 'published' }),
        safeCount(Service, { status: 'published' }),
        safeCount(Experience),
        safeCount(Education),
        safeCount(Skill),
        safeCount(Testimonial, { status: 'published' }),
        safeCount(Event, { status: 'published' }),
        safeCount(BlogPost, { status: 'published' }),
        safeCount(Achievement, { status: 'published' }),
        safeCount(Certification, { status: 'published' }),
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
          contact: true,
        }
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
}

module.exports = new SectionStatusController();

