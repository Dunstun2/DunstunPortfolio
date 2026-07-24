const { Skill } = require('../models');

class SkillService {
  async getAll() {
    return await Skill.findAll({ order: [['order', 'ASC']] });
  }

  async getById(id) {
    return await Skill.findByPk(id);
  }

  async create(data) {
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
