const settingService = require('../services/setting.service');
const { notifyUpdate } = require('../../../utils/events');


class SettingController {
  async getSettings(req, res) {
    try {
      const settings = await settingService.getAllSettings();
      res.json({ success: true, data: settings });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  async updateSettings(req, res) {
    try {
      const settings = await settingService.updateSettings(req.body);
      notifyUpdate('settings');
      res.json({ success: true, data: settings });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
}

module.exports = new SettingController();
