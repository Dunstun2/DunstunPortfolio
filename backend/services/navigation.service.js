const { NavigationItem } = require('../models');

class NavigationService {
  async getAll() {
    // Return all items, ordered by 'order' ascending
    return await NavigationItem.findAll({ 
      order: [['order', 'ASC']] 
    });
  }

  async getActive() {
    return await NavigationItem.findAll({
      where: { status: 'active' },
      order: [['order', 'ASC']]
    });
  }

  async getById(id) {
    return await NavigationItem.findByPk(id);
  }

  async create(data) {
    return await NavigationItem.create(data);
  }

  async update(id, data) {
    const navItem = await NavigationItem.findByPk(id);
    if (!navItem) throw new Error('Navigation item not found');
    return await navItem.update(data);
  }

  async delete(id) {
    const navItem = await NavigationItem.findByPk(id);
    if (!navItem) throw new Error('Navigation item not found');
    await navItem.destroy();
    return true;
  }
}

module.exports = new NavigationService();
