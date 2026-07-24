const { SocialAccount } = require('../models');

class SocialService {
  async getAll() { return await SocialAccount.findAll(); }
  async getById(id) { return await SocialAccount.findByPk(id); }
  async create(data) { return await SocialAccount.create(data); }
  async update(id, data) {
    const social = await SocialAccount.findByPk(id);
    if (!social) throw new Error('Social Account not found');
    return await social.update(data);
  }
  async delete(id) {
    const social = await SocialAccount.findByPk(id);
    if (!social) throw new Error('Social Account not found');
    await social.destroy();
    return true;
  }
}

module.exports = new SocialService();
