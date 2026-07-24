const certificationService = require('../services/certification.service');
const logger = require('../config/logger');

const certificationController = {
  // Create new certification
  async create(req, res, next) {
    try {
      const certification = await certificationService.create(req.body);
      logger.info(`Certification created: ${certification.id}`);
      res.status(201).json({ success: true, data: certification });
    } catch (error) {
      logger.error('Error creating certification:', error);
      next(error);
    }
  },

  // Get all certifications (admin)
  async getAll(req, res, next) {
    try {
      const result = await certificationService.getAll(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      logger.error('Error fetching certifications:', error);
      next(error);
    }
  },

  // Get published certifications (public)
  async getPublished(req, res, next) {
    try {
      const result = await certificationService.getPublished(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      logger.error('Error fetching published certifications:', error);
      next(error);
    }
  },

  // Get categories
  async getCategories(req, res, next) {
    try {
      const categories = await certificationService.getCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      logger.error('Error fetching categories:', error);
      next(error);
    }
  },

  // Get by ID
  async getById(req, res, next) {
    try {
      const certification = await certificationService.getById(req.params.id);
      res.json({ success: true, data: certification });
    } catch (error) {
      logger.error('Error fetching certification by ID:', error);
      next(error);
    }
  },

  // Get by slug
  async getBySlug(req, res, next) {
    try {
      const certification = await certificationService.getBySlug(req.params.slug);
      res.json({ success: true, data: certification });
    } catch (error) {
      logger.error('Error fetching certification by slug:', error);
      next(error);
    }
  },

  // Update certification
  async update(req, res, next) {
    try {
      const certification = await certificationService.update(req.params.id, req.body);
      logger.info(`Certification updated: ${certification.id}`);
      res.json({ success: true, data: certification });
    } catch (error) {
      logger.error('Error updating certification:', error);
      next(error);
    }
  },

  // Delete certification
  async delete(req, res, next) {
    try {
      const result = await certificationService.delete(req.params.id);
      logger.info(`Certification deleted: ${req.params.id}`);
      res.json({ success: true, ...result });
    } catch (error) {
      logger.error('Error deleting certification:', error);
      next(error);
    }
  },

  // Change status
  async changeStatus(req, res, next) {
    try {
      const certification = await certificationService.changeStatus(
        req.params.id,
        req.body.status
      );
      logger.info(`Certification status changed: ${certification.id} to ${req.body.status}`);
      res.json({ success: true, data: certification });
    } catch (error) {
      logger.error('Error changing certification status:', error);
      next(error);
    }
  },

  // Get featured certifications
  async getFeatured(req, res, next) {
    try {
      const certifications = await certificationService.getFeatured();
      res.json({ success: true, data: certifications });
    } catch (error) {
      logger.error('Error fetching featured certifications:', error);
      next(error);
    }
  },
};

module.exports = certificationController;
