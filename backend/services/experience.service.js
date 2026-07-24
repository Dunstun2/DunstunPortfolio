const { Experience } = require('../models');

class ExperienceService {
  async getAll() {
    return await Experience.findAll({ order: [['order', 'ASC'], ['start_date', 'DESC']] });
  }

  async getById(id) {
    return await Experience.findByPk(id);
  }

  async create(data) {
    return await Experience.create(data);
  }

  async update(id, data) {
    const experience = await Experience.findByPk(id);
    if (!experience) throw new Error('Experience not found');
    return await experience.update(data);
  }

  async delete(id) {
    const experience = await Experience.findByPk(id);
    if (!experience) throw new Error('Experience not found');
    await experience.destroy();
    return true;
  }
}

module.exports = new ExperienceService();
