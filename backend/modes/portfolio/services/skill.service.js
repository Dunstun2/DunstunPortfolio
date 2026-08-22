const { Skill } = require('../models');

class SkillService {
  async getAll() {
    return await Skill.findAll({ order: [['order', 'ASC']] });
  }

  async getById(id) {
    return await Skill.findByPk(id);
  }

  async create(data) {
    if (data.name) {
      const existing = await Skill.findOne({ where: { name: data.name } });
      if (existing) throw new Error('A skill with this name already exists.');
    }
    return await Skill.create(data);
  }

  async update(id, data) {
    const skill = await Skill.findByPk(id);
    if (!skill) throw new Error('Skill not found');
    return await skill.update(data);
  }

  async delete(id) {
    const skill = await Skill.findByPk(id);
    if (!skill) throw new Error('Skill not found');
    await skill.destroy();
    return true;
  }
}

module.exports = new SkillService();
