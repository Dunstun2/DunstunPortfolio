const socketIo = require('socket.io');

let io = null;

module.exports = {
  init: (server) => {
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['http://localhost:3000'];

    io = socketIo(server, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 30000,
      pingInterval: 15000,
      maxHttpBufferSize: 1e4, // Limit buffer size to 10KB
      perMessageDeflate: {
        threshold: 1024,
        chunkSize: 8,
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
      },
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        socket.removeAllListeners();
      });

      // Prevent memory leaks by clearing listeners on error
      socket.on('error', (error) => {
        console.error('Socket error:', error);
        socket.removeAllListeners();
      });
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
