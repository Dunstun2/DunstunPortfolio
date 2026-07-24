const { BlogTag } = require('../models');

class BlogTagService {
  async getAll() {
    return await BlogTag.findAll({ order: [['name', 'ASC']] });
  }

  async getById(id) {
    return await BlogTag.findByPk(id);
  }

  async create(data) {
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    return await BlogTag.create(data);
  }

  async update(id, data) {
    const tag = await BlogTag.findByPk(id);
    if (!tag) throw new Error('Tag not found');
    
    if (data.name && !data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    
    return await tag.update(data);
  }

  async delete(id) {
    const tag = await BlogTag.findByPk(id);
    if (!tag) throw new Error('Tag not found');
    await tag.destroy();
    return true;
  }
}

module.exports = new BlogTagService();
