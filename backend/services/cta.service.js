const { CTA } = require('../models');

class CTAService {
  async getAll() { return await CTA.findAll(); }
  async getById(id) { return await CTA.findByPk(id); }
  async create(data) { return await CTA.create(data); }
  async update(id, data) {
    const cta = await CTA.findByPk(id);
    if (!cta) throw new Error('CTA not found');
    return await cta.update(data);
  }
  async delete(id) {
    const cta = await CTA.findByPk(id);
    if (!cta) throw new Error('CTA not found');
    await cta.destroy();
    return true;
  }
}

module.exports = new CTAService();
