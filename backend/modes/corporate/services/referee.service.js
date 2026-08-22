const { Referee } = require('../models');

class RefereeService {
  async getAll() {
    return await Referee.findAll({ order: [['order', 'ASC'], ['created_at', 'DESC']] });
  }

  async getPublished() {
    const referees = await Referee.findAll({
      where: { status: 'published' },
      order: [['order', 'ASC'], ['created_at', 'DESC']],
    });

    // Sanitize contact info based on privacy settings
    return referees.map(referee => {
      const plain = referee.toJSON();
      if (!plain.display_email) {
        delete plain.email;
      }
      if (!plain.display_phone) {
        delete plain.phone;
      }
      return plain;
    });
  }

  async getById(id) {
    return await Referee.findByPk(id);
  }

  async create(data) {
    return await Referee.create({
      ...data,
      status: data.status || 'draft',
      display_email: !!data.display_email,
      display_phone: !!data.display_phone,
    });
  }

  async update(id, data) {
    const referee = await Referee.findByPk(id);
    if (!referee) throw new Error('Referee not found');
    return await referee.update(data);
  }

  async changeStatus(id, newStatus) {
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(newStatus)) throw new Error('Invalid status');

    const referee = await Referee.findByPk(id);
    if (!referee) throw new Error('Referee not found');

    referee.status = newStatus;
    await referee.save();
    return referee;
  }

  async delete(id) {
    const referee = await Referee.findByPk(id);
    if (!referee) throw new Error('Referee not found');
    await referee.destroy();
    return true;
  }
}

module.exports = new RefereeService();
