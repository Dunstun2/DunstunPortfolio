const mediaService = require('../services/media.service');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class MediaController {
  async upload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const altText = req.body.alt_text || null;
      const folder = req.body.folder || '/';
      const media = await mediaService.uploadMedia(req.file, altText, folder);

      return res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: media,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const folder = req.query.folder;
      const mediaFiles = await mediaService.getAllMedia(folder);
      return res.status(200).json({
        success: true,
        data: mediaFiles,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await mediaService.deleteMedia(id);
      return res.status(200).json({
        success: true,
        message: 'Media deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getFolders(req, res) {
    try {
      const folders = await mediaService.getFolders();
      // Ensure root folder exists in the list
      if (!folders.includes('/')) folders.unshift('/');
      return res.status(200).json({ success: true, data: folders });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async rename(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name) return res.status(400).json({ success: false, message: 'New name is required' });
      const media = await mediaService.renameMedia(id, name);
      return res.status(200).json({ success: true, data: media });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async move(req, res) {
    try {
      const { id } = req.params;
      const { folder } = req.body;
      if (!folder) return res.status(400).json({ success: false, message: 'New folder is required' });
      const media = await mediaService.moveMedia(id, folder);
      return res.status(200).json({ success: true, data: media });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteFolder(req, res) {
    try {
      const { folder } = req.body;
      if (!folder) return res.status(400).json({ success: false, message: 'Folder path is required' });
      await mediaService.deleteFolder(folder);
      return res.status(200).json({ success: true, message: 'Folder deleted successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async copy(req, res) {
    try {
      const { id } = req.params;
      const { folder } = req.body;
      if (!folder) return res.status(400).json({ success: false, message: 'Target folder is required' });
      const media = await mediaService.copyMedia(id, folder);
      return res.status(201).json({ success: true, data: media });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async discover(req, res) {
    try {
      const page = Math.floor(Math.random() * 100) + 1;
      const response = await axios.get(`https://picsum.photos/v2/list?page=${page}&limit=5`);
      const images = response.data.map(img => ({
        id: img.id,
        author: img.author,
        url: img.download_url,
        thumbnail: `https://picsum.photos/id/${img.id}/400/250`
      }));
      return res.status(200).json({ success: true, data: images });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to discover images' });
    }
  }

  async downloadRemote(req, res) {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

      // Upload the URL directly to Cloudinary
      const { cloudinary } = require('../../../middleware/upload.middleware');
      const result = await cloudinary.uploader.upload(url, {
        folder: 'portfolio_uploads'
      });

      // Construct a fake multer file object to pass to mediaService
      const fileObj = {
        originalname: 'downloaded-background',
        mimetype: `image/${result.format}`,
        size: result.bytes,
        path: result.secure_url
      };

      const media = await mediaService.uploadMedia(fileObj, 'Downloaded background');

      return res.status(201).json({
        success: true,
        message: 'Image downloaded and saved successfully',
        data: media,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new MediaController();
