const { About } = require('../models');

async function fetchAboutWithChildren(about) {
  if (!about) return null;
  const plain = about.toJSON ? about.toJSON() : { ...about };
  return plain;
}

// Helper: uniqueByTitle used for deduplication (no-op here since corporate uses JSON column)
function uniqueByTitle(arr) {
  const seen = new Set();
  return arr.filter(item => {
    const key = item.title || item.id || JSON.stringify(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

class AboutService {
  async getAll() {
    const abouts = await About.findAll({
      order: [['created_at', 'DESC']],
    });
    return Promise.all(abouts.map(a => fetchAboutWithChildren(a)));
  }

  async getPublished() {
    let about = await About.findOne({
      where: { status: 'published' },
      order: [['published_at', 'DESC']],
    });
    if (!about) {
      about = await About.findOne({
        order: [['created_at', 'DESC']],
      });
    }
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
    const { status, published_at, values, explorations, highlights, identity_cards, corporate_data, ...updateData } = data;

    // Apply simple column updates first
    await about.update(updateData);

    // Always persist corporate_data separately so Sequelize tracks the JSON mutation
    if (corporate_data !== undefined) {
      let corpObj = corporate_data;
      while (typeof corpObj === 'string') {
        try { corpObj = JSON.parse(corpObj); } catch { break; }
      }
      about.corporate_data = corpObj;
      about.changed('corporate_data', true);
      await about.save();
    }

    if (status) {
      about.status = status;
      await about.save();
    }

    // Note: values/explorations/highlights are stored in corporate_data JSON column
    // not in separate child tables in corporate mode, so no child table ops needed.

    return await this.getById(id);
  }



  async changeStatus(id, newStatus) {
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(newStatus)) throw new Error('Invalid status');

    const about = await About.findByPk(id);
    if (!about) throw new Error('About section not found');

    if (newStatus === 'published') {
      const { Op } = require('sequelize');
      await About.update(
        { status: 'archived' }, 
        { where: { status: 'published', id: { [Op.ne]: id } } }
      );
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
