const showVideoService = require('../services/showVideo.service');

exports.getAll = async (req, res) => {
  try {
    const videos = await showVideoService.getAll();
    res.json({ data: videos });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getActive = async (req, res) => {
  try {
    const videos = await showVideoService.getActive();
    res.json({ data: videos });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const video = await showVideoService.getById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Not found' });
    res.json({ data: video });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.create = async (req, res) => {
  try {
    const video = await showVideoService.create(req.body);
    res.status(201).json({ data: video });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const video = await showVideoService.update(req.params.id, req.body);
    res.json({ data: video });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await showVideoService.delete(req.params.id);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.reorder = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    const videos = await showVideoService.reorder(orderedIds);
    res.json({ data: videos });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
