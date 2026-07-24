const { Testimonial } = require('../models');

class TestimonialService {
  async getAll() {
    return await Testimonial.findAll({ order: [['order', 'ASC'], ['created_at', 'DESC']] });
  }

  async getPublished() {
    return await Testimonial.findAll({ 
      where: { status: 'published' },
      order: [['order', 'ASC'], ['created_at', 'DESC']]
    });
  }

  async getById(id) {
    return await Testimonial.findByPk(id);
  }

  async create(data) {
    return await Testimonial.create({ ...data, status: data.status || 'draft' });
  }

  async submitPublic(data) {
    return await Testimonial.create({
      author_name: data.author_name,
      email: data.email,
      author_title: data.author_title,
      company: data.company,
      relationship: data.relationship,
      content: data.content,
      avatar_url: data.avatar_url,
      photo_consent: !!data.photo_consent,
      display_photo: !!data.avatar_url && !!data.photo_consent,
      display_name: true,
      display_title: true,
      display_company: true,
      status: 'draft',
    });
  }

  async update(id, data) {
    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) throw new Error('Testimonial not found');
    const { status, ...updateData } = data;
    return await testimonial.update(updateData);
  }

  async changeStatus(id, newStatus) {
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(newStatus)) throw new Error('Invalid status');

    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) throw new Error('Testimonial not found');

    testimonial.status = newStatus;
    testimonial.reviewed_at = new Date();
    await testimonial.save();
    return testimonial;
  }

  async delete(id) {
    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) throw new Error('Testimonial not found');
    await testimonial.destroy();
    return true;
  }
}

module.exports = new TestimonialService();
