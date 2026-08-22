const projectService = require('../services/project.service');
const { notifyUpdate } = require('../../../utils/events');
const { asyncHandler } = require('../../../middleware/errorHandler.middleware');

class ProjectController {
  getAll = asyncHandler(async (req, res) => {
    const result = await projectService.getAll(req.query);
    res.json(result);
  });

  getPublished = asyncHandler(async (req, res) => {
    const result = await projectService.getPublished(req.query);
    res.json(result);
  });

  getRecent = asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 3;
    const data = await projectService.getRecentPublished(limit);
    res.json({ success: true, data });
  });

  getPublishedBySlug = asyncHandler(async (req, res) => {
    const project = await projectService.getPublishedBySlug(req.params.slug);
    res.json({ success: true, data: project });
  });

  create = asyncHandler(async (req, res) => {
    const data = await projectService.create(req.body);
    notifyUpdate('projects');
    res.status(201).json({ success: true, data });
  });

  update = asyncHandler(async (req, res) => {
    const data = await projectService.update(req.params.id, req.body);
    notifyUpdate('projects');
    res.json({ success: true, data });
  });

  changeStatus = asyncHandler(async (req, res) => {
    const data = await projectService.changeStatus(req.params.id, req.body.status);
    notifyUpdate('projects');
    res.json({ success: true, data });
  });

  delete = asyncHandler(async (req, res) => {
    await projectService.delete(req.params.id);
    notifyUpdate('projects');
    res.json({ success: true, message: 'Deleted' });
  });
}

module.exports = new ProjectController();
