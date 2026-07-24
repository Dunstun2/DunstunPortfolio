const { Event } = require('../models');

class EventService {
  async getAll() {
    return await Event.findAll({ order: [['created_at', 'DESC']] });
  }

  async getPublished(options = {}) {
    const where = { status: 'published' };
    if (options.category) where.category = options.category;
    if (options.format) where.format = options.format;
    return await Event.findAll({ 
      where,
      order: [['published_at', 'DESC'], ['created_at', 'DESC']],
      limit: options.limit ? parseInt(options.limit) : undefined,
    });
  }

  async getPublishedBySlug(slug) {
    return await Event.findOne({ where: { slug, status: 'published' } });
  }

  async getById(id) {
    return await Event.findByPk(id);
  }

  async create(data) {
    const slug = data.title 
      ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4)
      : `event-${Date.now()}`;
    return await Event.create({ ...data, slug, status: 'draft' });
  }

  async update(id, data) {
    const event = await Event.findByPk(id);
    if (!event) throw new Error('Event not found');
    const { status, published_at, ...updateData } = data;
    if (updateData.title) {
      updateData.slug = updateData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + id.slice(0, 4);
    }
    return await event.update(updateData);
  }

  async changeStatus(id, newStatus) {
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(newStatus)) throw new Error('Invalid status');

    const event = await Event.findByPk(id);
    if (!event) throw new Error('Event not found');

    if (newStatus === 'published' && event.status !== 'published') {
      event.published_at = new Date();
    }

    event.status = newStatus;
    await event.save();
    return event;
  }

  async delete(id) {
    const event = await Event.findByPk(id);
    if (!event) throw new Error('Event not found');
    await event.destroy();
    return true;
  }
}

module.exports = new EventService();
