const { Category } = require('../models');

class CategoryService {
  async getAll() { return await Category.findAll(); }
  async getById(id) { return await Category.findByPk(id); }
  async create(data) { return await Category.create(data); }
  async update(id, data) {
    const category = await Category.findByPk(id);
    if (!category) throw new Error('Category not found');
    return await category.update(data);
  }
  async delete(id) {
    const category = await Category.findByPk(id);
    if (!category) throw new Error('Category not found');
    await category.destroy();
    return true;
  }
}

module.exports = new CategoryService();
