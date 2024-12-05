// server.js
import ViteExpress from "vite-express";
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// app.get('/', (req, res) => {
//   res.sendFile('/home/roger/coding/chatguru/whatsapp/wwebjsexpress/index.html');
// });

app.get("/hello", (req, res) => {
  res.send("Hello Vite + Vue!");
});

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.emit('message', 'Hello from server');
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// httpServer.listen(3000, () => {
//   console.log('Server is listening on port 3000');
// });

ViteExpress.config({
  middlewareMode: true,
  app,
});

httpServer.listen(3000, () => {
  console.log("Server is listening on port 3000...");
});


// import express from "express";
// import ViteExpress from "vite-express";
// import { createServer } from 'http';
// import { Server } from 'socket.io';

// const app = express();
// const httpserver = createServer(app);
// const io = new Server(httpserver);

// app.get("/hello", (req, res) => {
//   res.send("Hello Vite + Vue!");
// });

// app.get('/socket', (req, res) => {
//   res.sendFile('/home/roger/coding/chatguru/whatsapp/wwebjsexpress/index.html');
// });

// // Socket.IO setup
// io.on('connection', (socket) => {
//   console.log('A user connected');
//   socket.emit('message', 'Hello from server');
  
//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });

// io.on('connection', (socket) => {
//   socket.emit('message', 'Iniciado server');
//   console.log('Iniciado server');

//   socket.on('conectar-fone', async (fone) => {
//     console.log('conectar-fone', fone);
//   });

//   socket.on('ready', () => {
//     socket.emit('ready', 'server pronto! (ready)');
//     socket.emit('message', 'server pronto! (message)');
//     console.log('SERVER ready');
//   });

//   socket.on('change_state', (state) => {
//     console.log('SERVER Status de conexão: ', state);
//   });

//   socket.on('disconnected', (reason) => {
//     socket.emit('message', 'SERVER Cliente desconectado!');
//     console.log('SERVER Cliente desconectado', reason);
//   });
// });

// ViteExpress.listen(app, 3000, () => 
//   console.log("Server is listening on port 3000..."),
// );
