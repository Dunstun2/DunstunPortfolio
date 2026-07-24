const { Hero, SocialAccount } = require('../models');

class HeroService {
  async getAll() {
    return await Hero.findAll({ order: [['updated_at', 'DESC']] });
  }

  async getPublished() {
    // Single-hero pattern: get the one that is published and active
    return await Hero.findOne({ 
      where: { status: 'published', is_active: true },
      order: [['published_at', 'DESC']]
    });
  }

  async getPublishedWithSocials() {
    const hero = await this.getPublished();
    if (!hero) return null;

    let socials = [];
    if (hero.show_social_links) {
      socials = await SocialAccount.findAll({ order: [['created_at', 'ASC']] });
    }

    return {
      ...hero.toJSON(),
      social_links: socials,
    };
  }

  async getById(id) {
    return await Hero.findByPk(id);
  }

  /**
   * Single-instance create:
   * If a hero already exists, update the existing one instead of creating a new one.
   * This enforces the "only one hero" rule at the service layer.
   */
  async createOrUpdate(data) {
    const existing = await Hero.findOne({ order: [['created_at', 'ASC']] });

    if (existing) {
      // Update and publish the existing hero
      const { status, published_at, ...updateData } = data;
      return await existing.update({
        ...updateData,
        status: 'published',
        is_active: true,
        published_at: existing.published_at || new Date(),
      });
    }

    // No hero exists yet — create one and publish it immediately
    return await Hero.create({
      ...data,
      status: 'published',
      is_active: true,
      published_at: new Date(),
    });
  }

  async update(id, data) {
    const hero = await Hero.findByPk(id);
    if (!hero) throw new Error('Hero not found');
    
    // Strip status/publish metadata from regular updates; those are managed by changeStatus
    const { status, published_at, ...updateData } = data;
    
    // Allow is_active to be set explicitly if provided
    if (data.is_active !== undefined) {
      updateData.is_active = data.is_active;
    }

    return await hero.update(updateData);
  }

  async changeStatus(id, newStatus) {
    const validStatuses = ['draft', 'published', 'scheduled', 'archived'];
    if (!validStatuses.includes(newStatus)) throw new Error('Invalid status');

    const hero = await Hero.findByPk(id);
    if (!hero) throw new Error('Hero not found');

    if (newStatus === 'published') {
      hero.published_at = new Date();
      hero.is_active = true;
    } else {
      // If un-publishing, deactivate it
      hero.is_active = false;
    }

    hero.status = newStatus;
    await hero.save();
    return hero;
  }

  async setActive(id, isActive) {
    const hero = await Hero.findByPk(id);
    if (!hero) throw new Error('Hero not found');

    if (isActive) {
      // Deactivate all others first
      await Hero.update({ is_active: false }, { where: { is_active: true } });
    }

    hero.is_active = isActive;
    await hero.save();
    return hero;
  }

  async delete(id) {
    const hero = await Hero.findByPk(id);
    if (!hero) throw new Error('Hero not found');
    await hero.destroy();
    return true;
  }
}

module.exports = new HeroService();
