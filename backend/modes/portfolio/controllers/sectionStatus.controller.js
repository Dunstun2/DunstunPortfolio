const { About, Hero, Project, Service, Experience, Education, Skill, Testimonial, Event, BlogPost, Achievement, Certification, Referee, Setting } = require('../models');

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
   * Returns which portfolio/corporate sections have published/available content.
   * The navbar uses this to hide links for empty, archived, or disabled sections.
   */
  async getAvailableSections(req, res) {
    try {
      const queryMode = req.query.mode || req.headers['x-site-mode'];
      let siteMode = queryMode;
      if (!siteMode || (siteMode !== 'corporate' && siteMode !== 'portfolio')) {
        const modeSetting = await Setting.findOne({ where: { key: 'site_mode' } });
        siteMode = modeSetting?.value || 'portfolio';
      }
      const isCorporate = siteMode === 'corporate';


      let models = { About, Hero, Project, Service, Experience, Education, Skill, Testimonial, Event, BlogPost, Achievement, Certification, Referee };
      if (isCorporate) {
        try {
          const corpModels = require('../../corporate/models');
          models = { ...models, ...corpModels };
        } catch {}
      }

      const [about, hero, projects, services, experience, education, skills, testimonials, events, blog, achievements, certifications, referees] = await Promise.all([
        safeCount(models.About, { status: 'published' }),
        safeCount(models.Hero, { status: 'published' }),
        safeCount(models.Project, { status: 'published' }),
        safeCount(models.Service, { status: 'published' }),
        safeCount(models.Experience),
        safeCount(models.Education),
        safeCount(models.Skill),
        safeCount(models.Testimonial, { status: 'published' }),
        safeCount(models.Event, { status: 'published' }),
        safeCount(models.BlogPost, { status: 'published' }),
        safeCount(models.Achievement, { status: 'published' }),
        safeCount(models.Certification, { status: 'published' }),
        safeCount(models.Referee, { status: 'published' }),
      ]);

      res.json({
        success: true,
        data: {
          site_mode: siteMode,
          about: about > 0,
          hero: hero > 0,
          projects: projects > 0,
          services: services > 0,
          experience: isCorporate ? false : experience > 0,
          education: isCorporate ? false : education > 0,
          skills: isCorporate ? false : skills > 0,
          testimonials: testimonials > 0,
          events: isCorporate ? false : events > 0,
          blog: blog > 0,
          achievements: isCorporate ? false : achievements > 0,
          certifications: isCorporate ? false : certifications > 0,
          referees: isCorporate ? false : referees > 0,
          cvImport: !isCorporate,
          contact: true,
        }
      });


    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
}

module.exports = new SectionStatusController();

