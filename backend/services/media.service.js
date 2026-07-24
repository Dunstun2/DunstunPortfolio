const fs = require('fs').promises;
const path = require('path');
const { Media } = require('../models');

class MediaService {
  async uploadMedia(file, altText, folder = '/') {
    if (!file) {
      throw new Error('No file provided');
    }

    const media = await Media.create({
      file_name: file.originalname,
      file_path: `/uploads/${file.filename}`, // URL accessible path
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

    // Delete the physical file
    try {
      const physicalPath = path.join(__dirname, '..', '..', 'uploads', path.basename(media.file_path));
      await fs.unlink(physicalPath);
    } catch (err) {
      console.warn('Physical file not found or could not be deleted:', err.message);
      // We continue to delete from DB even if physical file is missing
    }

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
    
    // Delete physical files
    for (const file of files) {
      try {
        const physicalPath = path.join(__dirname, '..', '..', 'uploads', path.basename(file.file_path));
        await fs.unlink(physicalPath);
      } catch (err) {
        console.warn('Physical file not found or could not be deleted:', err.message);
      }
    }
    
    // Delete from DB
    await Media.destroy({ where: { folder } });
    return true;
  }

  async copyMedia(id, targetFolder) {
    const media = await Media.findByPk(id);
    if (!media) throw new Error('Media not found');

    // Copy physical file
    const originalPath = path.join(__dirname, '..', '..', 'uploads', path.basename(media.file_path));
    const ext = path.extname(media.file_path);
    const newFileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    const newPhysicalPath = path.join(__dirname, '..', '..', 'uploads', newFileName);

    try {
      await fs.copyFile(originalPath, newPhysicalPath);
    } catch (err) {
      throw new Error('Failed to copy physical file: ' + err.message);
    }

    // Get size of the new file
    const stat = await fs.stat(newPhysicalPath);

    // Create new DB record
    const copy = await Media.create({
      file_name: media.file_name,
      file_path: `/uploads/${newFileName}`,
      mime_type: media.mime_type,
      size_bytes: stat.size,
      alt_text: media.alt_text,
      folder: targetFolder,
    });

    return copy;
  }
}

module.exports = new MediaService();
