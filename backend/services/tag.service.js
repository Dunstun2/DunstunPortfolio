const { Tag } = require('../models');

class TagService {
  async getAll() { return await Tag.findAll(); }
  async getById(id) { return await Tag.findByPk(id); }
  async create(data) { return await Tag.create(data); }
  async update(id, data) {
    const tag = await Tag.findByPk(id);
    if (!tag) throw new Error('Tag not found');
    return await tag.update(data);
  }
  async delete(id) {
    const tag = await Tag.findByPk(id);
    if (!tag) throw new Error('Tag not found');
    await tag.destroy();
    return true;
  }
}

module.exports = new TagService();
