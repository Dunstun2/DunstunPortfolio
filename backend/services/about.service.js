const { About, AboutIdentityCard, AboutValue, AboutExploration, AboutHighlight } = require('../models');

// Helper: fetch an About record with its children using separate queries
// instead of Sequelize's `include` (which hydrates massive object graphs
// through the sqlite3 N-API layer, causing an OOM leak on Node 22 + Windows).
async function fetchAboutWithChildren(about) {
  if (!about) return null;
  const id = about.id || about.get('id');
  const plain = about.toJSON ? about.toJSON() : { ...about };

  const [cards, values, explorations, highlights] = await Promise.all([
    AboutIdentityCard.findAll({ where: { about_id: id }, raw: true }),
    AboutValue.findAll({ where: { about_id: id }, raw: true }),
    AboutExploration.findAll({ where: { about_id: id }, raw: true }),
    AboutHighlight.findAll({ where: { about_id: id }, raw: true }),
  ]);

  plain.identity_cards = cards;
  plain.values = values;
  plain.explorations = explorations;
  plain.highlights = highlights;
  return plain;
}

class AboutService {
  async getAll() {
    const abouts = await About.findAll({
      order: [['created_at', 'DESC']],
    });
    return Promise.all(abouts.map(a => fetchAboutWithChildren(a)));
  }

  async getPublished() {
    const about = await About.findOne({
      where: { status: 'published' },
      order: [['published_at', 'DESC']],
    });
    return fetchAboutWithChildren(about);
  }

  async getById(id) {
    const about = await About.findByPk(id);
    return fetchAboutWithChildren(about);
  }

  async create(data) {
    return await About.create({ ...data, status: 'draft' });
  }

  async update(id, data) {
    const about = await About.findByPk(id);
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

    return await this.getById(id);
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
