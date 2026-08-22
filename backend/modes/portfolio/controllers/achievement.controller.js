const achievementService = require('../services/achievement.service');
const { notifyUpdate } = require('../../../utils/events');
const { asyncHandler } = require('../../../middleware/errorHandler.middleware');

class AchievementController {
  getAll = asyncHandler(async (req, res) => {
    const result = await achievementService.getAll(req.query);
    res.json(result);
  });

  getPublished = asyncHandler(async (req, res) => {
    const result = await achievementService.getPublished(req.query);
    res.json(result);
  });

  getBySlug = asyncHandler(async (req, res) => {
    const item = await achievementService.getBySlug(req.params.slug);
    res.json({ success: true, data: item });
  });

  getById = asyncHandler(async (req, res) => {
    const item = await achievementService.getById(req.params.id);
    res.json({ success: true, data: item });
  });

  create = asyncHandler(async (req, res) => {
    const data = await achievementService.create(req.body);
    notifyUpdate('achievements');
    res.status(201).json({ success: true, data });
  });

  update = asyncHandler(async (req, res) => {
    const data = await achievementService.update(req.params.id, req.body);
    notifyUpdate('achievements');
    res.json({ success: true, data });
  });

  changeStatus = asyncHandler(async (req, res) => {
    const data = await achievementService.changeStatus(req.params.id, req.body.status);
    notifyUpdate('achievements');
    res.json({ success: true, data });
  });

  delete = asyncHandler(async (req, res) => {
    await achievementService.delete(req.params.id);
    notifyUpdate('achievements');
    res.json({ success: true, message: 'Deleted' });
  });

  getCategories = asyncHandler(async (req, res) => {
    const categories = await achievementService.getCategories();
    res.json({ success: true, data: categories });
  });
}

module.exports = new AchievementController();
