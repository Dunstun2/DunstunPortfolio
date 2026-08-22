const fs = require('fs').promises;
const path = require('path');
const { Media } = require('../models');

class MediaService {
  async uploadMedia(file, altText, folder = '/') {
    if (!file) {
      throw new Error('No file provided');
    }

    const media = await Media.create({
      file_name: file.originalname || 'upload',
      file_path: file.path, // Cloudinary URL
      mime_type: file.mimetype,
      size_bytes: file.size,
      alt_text: altText || null,
      folder: folder || '/',
    });

    return media;
  }

  async getAllMedia(folder) {
    const whereClause = folder ? { folder } : {};
    return await Media.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
    });
  }

  async deleteMedia(id) {
    const media = await Media.findByPk(id);
    if (!media) {
      throw new Error('Media not found');
    }

    // We are using Cloudinary now, so we don't delete physical files from the local disk.
    // (Optional: Implement cloudinary.uploader.destroy if you want to delete from Cloudinary)

    // Delete from database
    await media.destroy();
    return true;
  }

  async getFolders() {
    const media = await Media.findAll({
      attributes: ['folder'],
      group: ['folder'],
    });
    return media.map((m) => m.folder).filter(Boolean);
  }

  async renameMedia(id, newName) {
    const media = await Media.findByPk(id);
    if (!media) throw new Error('Media not found');
    media.file_name = newName;
    await media.save();
    return media;
  }

  async moveMedia(id, newFolder) {
    const media = await Media.findByPk(id);
    if (!media) throw new Error('Media not found');
    media.folder = newFolder;
    await media.save();
    return media;
  }

  async deleteFolder(folder) {
    if (!folder || folder === '/') throw new Error('Cannot delete root folder');
    
    // Get all files in the folder
    const files = await Media.findAll({ where: { folder } });
    
    // Delete from DB (Physical files are on Cloudinary, not deleting them for now)
    
    // Delete from DB
    await Media.destroy({ where: { folder } });
    return true;
  }

  async copyMedia(id, targetFolder) {
    const media = await Media.findByPk(id);
    if (!media) throw new Error('Media not found');

    // Create new DB record pointing to the same Cloudinary URL
    const copy = await Media.create({
      file_name: media.file_name,
      file_path: media.file_path,
      mime_type: media.mime_type,
      size_bytes: media.size_bytes,
      alt_text: media.alt_text,
      folder: targetFolder,
    });

    return copy;
  }
}

module.exports = new MediaService();
