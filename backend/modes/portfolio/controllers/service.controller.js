const serviceService = require('../services/service.service');
const { notifyUpdate } = require('../../../utils/events');
const { asyncHandler } = require('../../../middleware/errorHandler.middleware');

class ServiceController {
  /**
   * Get all services (admin) with pagination
   */
  getAll = asyncHandler(async (req, res) => {
    const result = await serviceService.getAll(req.query);
    res.json(result);
  });

  /**
   * Get all published services (public)
   */
  getPublished = asyncHandler(async (req, res) => {
    const result = await serviceService.getPublished(req.query);
    res.json(result);
  });

  /**
   * Get featured services (homepage)
   */
  getFeatured = asyncHandler(async (req, res) => {
    const data = await serviceService.getFeatured();
    res.json({ success: true, data });
  });

  /**
   * Get single published service by slug
   */
  getPublishedBySlug = asyncHandler(async (req, res) => {
    const service = await serviceService.getPublishedBySlug(req.params.slug);
    res.json({ success: true, data: service });
  });

  /**
   * Get service by ID (admin)
   */
  getById = asyncHandler(async (req, res) => {
    const service = await serviceService.getById(req.params.id);
    res.json({ success: true, data: service });
  });

  /**
   * Create new service
   */
  create = asyncHandler(async (req, res) => {
    const data = await serviceService.create(req.body);
    notifyUpdate('services');
    res.status(201).json({ success: true, data });
  });

  /**
   * Update service
   */
  update = asyncHandler(async (req, res) => {
    const data = await serviceService.update(req.params.id, req.body);
    notifyUpdate('services');
    res.json({ success: true, data });
  });

  /**
   * Change service status
   */
  changeStatus = asyncHandler(async (req, res) => {
    const data = await serviceService.changeStatus(req.params.id, req.body.status);
    notifyUpdate('services');
    res.json({ success: true, data });
  });

  /**
   * Toggle featured status
   */
  toggleFeatured = asyncHandler(async (req, res) => {
    const data = await serviceService.toggleFeatured(req.params.id);
    notifyUpdate('services');
    res.json({ success: true, data });
  });

  /**
   * Delete service
   */
  delete = asyncHandler(async (req, res) => {
    await serviceService.delete(req.params.id);
    notifyUpdate('services');
    res.json({ success: true, message: 'Service deleted successfully' });
  });

  /**
   * Reorder services
   */
  reorder = asyncHandler(async (req, res) => {
    const result = await serviceService.reorder(req.body.order);
    notifyUpdate('services');
    res.json({ success: true, ...result });
  });
}

module.exports = new ServiceController();
