const templateService = require('../services/template.service');
const settingService = require('../services/setting.service');
const { notifyUpdate } = require('../../../utils/events');

class TemplateController {
  async getAllTemplates(req, res) {
    try {
      const templates = await templateService.getAllTemplates();
      res.json({ success: true, data: templates });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async getTemplateBySlug(req, res) {
    try {
      const template = await templateService.getTemplateBySlug(req.params.slug);
      res.json({ success: true, data: template });
    } catch (e) {
      res.status(404).json({ success: false, message: e.message });
    }
  }

  async getActiveTemplate(req, res) {
    try {
      const settings = await settingService.getAllSettings();
      const template = await templateService.getActiveTemplate(settings);
      res.json({ success: true, data: template });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async createTemplate(req, res) {
    try {
      const template = await templateService.createTemplate(req.body);
      res.status(201).json({ success: true, data: template });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async updateTemplate(req, res) {
    try {
      const template = await templateService.updateTemplate(req.params.id, req.body);
      notifyUpdate('templates');
      res.json({ success: true, data: template });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async deleteTemplate(req, res) {
    try {
      const result = await templateService.deleteTemplate(req.params.id);
      res.json({ success: true, ...result });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
}

module.exports = new TemplateController();
