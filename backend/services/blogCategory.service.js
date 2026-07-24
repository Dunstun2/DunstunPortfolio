const { BlogCategory } = require('../models');

class BlogCategoryService {
  async getAll() {
    return await BlogCategory.findAll({ order: [['display_order', 'ASC'], ['created_at', 'DESC']] });
  }

  async getActive() {
    return await BlogCategory.findAll({
      where: { status: 'active' },
      order: [['display_order', 'ASC'], ['created_at', 'DESC']]
    });
  }

  async getById(id) {
    return await BlogCategory.findByPk(id);
  }

  async create(data) {
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    return await BlogCategory.create(data);
  }

  async update(id, data) {
    const category = await BlogCategory.findByPk(id);
    if (!category) throw new Error('Category not found');
    
    if (data.name && !data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    
    return await category.update(data);
  }

  async delete(id) {
    const category = await BlogCategory.findByPk(id);
    if (!category) throw new Error('Category not found');
    await category.destroy();
    return true;
  }
}

module.exports = new BlogCategoryService();
