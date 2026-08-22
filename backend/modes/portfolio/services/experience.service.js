const { Experience } = require('../models');
const { sanitizeObjectDates } = require('../../../utils/dateSanitizer');

const DATE_SPEC = {
  start_date: { required: true, fallback: '2020-01-01' },
  end_date: { required: false }
};

class ExperienceService {
  async getAll() {
    return await Experience.findAll({ order: [['order', 'ASC'], ['start_date', 'DESC']] });
  }

  async getById(id) {
    return await Experience.findByPk(id);
  }

  async create(data) {
    const cleanData = sanitizeObjectDates(data, DATE_SPEC);
    if (cleanData.title && cleanData.company) {
      const existing = await Experience.findOne({ where: { title: cleanData.title, company: cleanData.company } });
      if (existing) throw new Error('An experience with this title and company already exists.');
    }
    return await Experience.create(cleanData);
  }

  async update(id, data) {
    const experience = await Experience.findByPk(id);
    if (!experience) throw new Error('Experience not found');
    const cleanData = sanitizeObjectDates(data, DATE_SPEC);
    return await experience.update(cleanData);
  }

  async delete(id) {
    const experience = await Experience.findByPk(id);
    if (!experience) throw new Error('Experience not found');
    await experience.destroy();
    return true;
  }
}

module.exports = new ExperienceService();
