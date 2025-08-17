import { io } from 'socket.io-client';

const socket = io(import.meta.env.SOCKET || 'http://localhost:5000', {
  withCredentials: true
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from WebSocket server');
});

export default socket;
