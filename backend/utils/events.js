const socketManager = require('../socketManager');

function notifyUpdate(section) {
  try {
    const io = socketManager.getIO();
    if (io) {
      io.emit('content-updated', { section });
    }
  } catch (err) {
    console.error(`Socket emit error for ${section}:`, err);
  }
}

module.exports = { notifyUpdate };
