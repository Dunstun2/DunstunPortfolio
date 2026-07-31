const { Education } = require('../models');
const { sanitizeObjectDates } = require('../utils/dateSanitizer');

const DATE_SPEC = {
  start_date: { required: true, fallback: '2020-01-01' },
  end_date: { required: false },
  expected_graduation: { required: false }
};

class EducationService {
  async getAll() {
    return await Education.findAll({ order: [['order', 'ASC'], ['start_date', 'DESC']] });
  }

  async getById(id) {
    return await Education.findByPk(id);
  }

  async create(data) {
    const cleanData = sanitizeObjectDates(data, DATE_SPEC);
    if (cleanData.degree && cleanData.institution) {
      const existing = await Education.findOne({ where: { degree: cleanData.degree, institution: cleanData.institution } });
      if (existing) throw new Error('An education entry with this degree and institution already exists.');
    }
    return await Education.create(cleanData);
  }

  async update(id, data) {
    const education = await Education.findByPk(id);
    if (!education) throw new Error('Education not found');
    const cleanData = sanitizeObjectDates(data, DATE_SPEC);
    return await education.update(cleanData);
  }

  async delete(id) {
    const education = await Education.findByPk(id);
    if (!education) throw new Error('Education not found');
    await education.destroy();
    return true;
  }
}

module.exports = new EducationService();
