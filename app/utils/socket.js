import { Server } from 'socket.io';

let io;

export const initIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connected', socket.id);

    socket.on('placeBid', (data) => {
      console.log('Bid received', data);
      io.emit('bidUpdated', data); // broadcast to all clients
    });

    socket.on('disconnect', () => console.log('❌ Client disconnected', socket.id));
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
