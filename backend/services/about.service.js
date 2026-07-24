const { About, AboutIdentityCard, AboutValue, AboutExploration, AboutHighlight } = require('../models');

const includeConfig = [
  { model: AboutIdentityCard, as: 'identity_cards' },
  { model: AboutValue, as: 'values' },
  { model: AboutExploration, as: 'explorations' },
  { model: AboutHighlight, as: 'highlights' }
];

class AboutService {
  async getAll() {
    return await About.findAll({ 
      order: [['created_at', 'DESC']],
      include: includeConfig
    });
  }

  async getPublished() {
    return await About.findOne({ 
      where: { status: 'published' },
      order: [['published_at', 'DESC']],
      include: includeConfig
    });
  }

  async getById(id) {
    return await About.findByPk(id, { include: includeConfig });
  }

  async create(data) {
    return await About.create({ ...data, status: 'draft' });
  }

  async update(id, data) {
    const about = await About.findByPk(id, { include: includeConfig });
    if (!about) throw new Error('About section not found');
    const { status, published_at, identity_cards, values, explorations, highlights, ...updateData } = data;
    
    await about.update(updateData);

    if (identity_cards && Array.isArray(identity_cards)) {
      await AboutIdentityCard.destroy({ where: { about_id: id } });
      await AboutIdentityCard.bulkCreate(identity_cards.map(item => ({ ...item, about_id: id, id: undefined, created_at: undefined, updated_at: undefined })));
    }
    
    if (values && Array.isArray(values)) {
      await AboutValue.destroy({ where: { about_id: id } });
      await AboutValue.bulkCreate(values.map(item => ({ ...item, about_id: id, id: undefined, created_at: undefined, updated_at: undefined })));
    }
    
    if (explorations && Array.isArray(explorations)) {
      await AboutExploration.destroy({ where: { about_id: id } });
      await AboutExploration.bulkCreate(explorations.map(item => ({ ...item, about_id: id, id: undefined, created_at: undefined, updated_at: undefined })));
    }
    
    if (highlights && Array.isArray(highlights)) {
      await AboutHighlight.destroy({ where: { about_id: id } });
      await AboutHighlight.bulkCreate(highlights.map(item => ({ ...item, about_id: id, id: undefined, created_at: undefined, updated_at: undefined })));
    }

    return await About.findByPk(id, { include: includeConfig });
  }

  async changeStatus(id, newStatus) {
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(newStatus)) throw new Error('Invalid status');

    const about = await About.findByPk(id);
    if (!about) throw new Error('About section not found');

    if (newStatus === 'published') {
      await About.update({ status: 'archived' }, { where: { status: 'published' } });
      about.published_at = new Date();
    }

    about.status = newStatus;
    await about.save();
    return about;
  }

  async delete(id) {
    const about = await About.findByPk(id);
    if (!about) throw new Error('About section not found');
    await about.destroy();
    return true;
  }

  // --- Sub-items CRUD ---
  
  // Identity Cards
  async addIdentityCard(aboutId, data) { return await AboutIdentityCard.create({ about_id: aboutId, ...data }); }
  async updateIdentityCard(id, data) { await AboutIdentityCard.update(data, { where: { id } }); return await AboutIdentityCard.findByPk(id); }
  async deleteIdentityCard(id) { return await AboutIdentityCard.destroy({ where: { id } }); }

  // Values
  async addValue(aboutId, data) { return await AboutValue.create({ about_id: aboutId, ...data }); }
  async updateValue(id, data) { await AboutValue.update(data, { where: { id } }); return await AboutValue.findByPk(id); }
  async deleteValue(id) { return await AboutValue.destroy({ where: { id } }); }

  // Explorations
  async addExploration(aboutId, data) { return await AboutExploration.create({ about_id: aboutId, ...data }); }
  async updateExploration(id, data) { await AboutExploration.update(data, { where: { id } }); return await AboutExploration.findByPk(id); }
  async deleteExploration(id) { return await AboutExploration.destroy({ where: { id } }); }

  // Highlights
  async addHighlight(aboutId, data) { return await AboutHighlight.create({ about_id: aboutId, ...data }); }
  async updateHighlight(id, data) { await AboutHighlight.update(data, { where: { id } }); return await AboutHighlight.findByPk(id); }
  async deleteHighlight(id) { return await AboutHighlight.destroy({ where: { id } }); }
}

module.exports = new AboutService();
