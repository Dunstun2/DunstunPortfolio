const socketIo = require('socket.io');

let io = null;

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      cors: {
        origin: '*', // Adjust in production
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      }
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      console.warn('Socket.io is not initialized yet!');
    }
    return io;
  }
};
