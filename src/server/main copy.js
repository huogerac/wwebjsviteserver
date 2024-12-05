import express from "express";
import ViteExpress from "vite-express";
import { createServer } from 'http';
import { Server } from 'socket.io';

// socketIo
//const socketIO = require('socket.io');
const app = express();
const httpserver = createServer(app);
const io = new Server(httpserver);


app.get("/hello", (req, res) => {
  res.send("Hello Vite + Vue!");
});

// socketIo
io.on('connection', function (socket) {
  socket.emit('message', 'Iniciado server');
  console.log('Iniciado server');

  client.on('conectar-fone', async (fone) => {
    console.log('conectar-fone', fone);
  });

  client.on('ready', () => {
    socket.emit('ready', 'server pronto! (ready)');
    socket.emit('message', 'server pronto! (message');
    console.log('SERVER ready');
  });

  client.on('change_state', state => {
    console.log('SERVER Status de conexão: ', state);
  });

  client.on('disconnected', (reason) => {
    socket.emit('message', 'SERVER Cliente desconectado!');
    console.log('SERVER Cliente desconectado', reason);
  });

});


ViteExpress.listen(app, 3000, () => {
    console.log("Server is listening on port 3000...")
  }
);
