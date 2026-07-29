const { Education } = require('../models');

class EducationService {
  async getAll() {
    return await Education.findAll({ order: [['order', 'ASC'], ['start_date', 'DESC']] });
  }

  async getById(id) {
    return await Education.findByPk(id);
  }

  async create(data) {
    if (data.degree && data.institution) {
      const existing = await Education.findOne({ where: { degree: data.degree, institution: data.institution } });
      if (existing) throw new Error('An education entry with this degree and institution already exists.');
    }
    return await Education.create(data);
  }

  async update(id, data) {
    const education = await Education.findByPk(id);
    if (!education) throw new Error('Education not found');
    return await education.update(data);
  }

  async delete(id) {
    const education = await Education.findByPk(id);
    if (!education) throw new Error('Education not found');
    await education.destroy();
    return true;
  }
}

module.exports = new EducationService();
