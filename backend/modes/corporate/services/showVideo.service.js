const { ShowVideo } = require('../models');
const { Op } = require('sequelize');

class ShowVideoService {
  /** All videos for admin management */
  async getAll() {
    return await ShowVideo.findAll({ order: [['sort_order', 'ASC'], ['created_at', 'DESC']] });
  }

  /** Active+published or scheduled-and-due videos for the live banner */
  async getActive() {
    const now = new Date();
    return await ShowVideo.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          { status: 'published' },
          {
            status: 'scheduled',
            scheduled_at: { [Op.lte]: now },
          },
        ],
      },
      order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
    });
  }

  async getById(id) {
    return await ShowVideo.findByPk(id);
  }

  async create(data) {
    return await ShowVideo.create(data);
  }

  async update(id, data) {
    const video = await ShowVideo.findByPk(id);
    if (!video) throw new Error('ShowVideo not found');
    return await video.update(data);
  }

  async delete(id) {
    const video = await ShowVideo.findByPk(id);
    if (!video) throw new Error('ShowVideo not found');
    await video.destroy();
    return { success: true };
  }

  async reorder(orderedIds) {
    await Promise.all(
      orderedIds.map((id, idx) => ShowVideo.update({ sort_order: idx }, { where: { id } }))
    );
    return this.getAll();
  }
}

module.exports = new ShowVideoService();
