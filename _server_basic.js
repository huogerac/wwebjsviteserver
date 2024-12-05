// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.get('/', (req, res) => {
  res.sendFile('/home/roger/coding/chatguru/whatsapp/wwebjsexpress/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.emit('message', 'Hello from server');
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

httpServer.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
