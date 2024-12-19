// Vite + Express + SocketIO
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';

// WPPConnect
import { create } from '@wppconnect-team/wppconnect';

// local
import { fetchChatsAndMessages } from './wppapi.js';

function startClient(client, socket) {

  console.log('Starting server...');
  //fetchChatsAndMessages(client)

  // Client
  client.onMessage((message) => {

    if (message.body !== "") {
      socket.emit('new_message', message);

      if (message.body === 'ping') {
        client
          .sendText(message.from, 'PONG')
          .then((result) => {
              console.log('Result: ', result); //return object success
          })
          .catch((erro) => {
              console.error('Error when sending: ', erro); //return object error
          });
      }
    }

  });

  client.onStateChange((status) => {
    console.log('=====> status change:', status)
  });

  console.log('Esperando para chamar')
  setTimeout(async () => {
    try {
      console.log('Getting chats....')
      //const chats = await client.getAllChats();
      const all_chats = await fetchChatsAndMessages(client)
      socket.emit('all_chats', all_chats);

    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  }, 20000)


  // SERVER
  socket.on('enviarMensagem', async (message) => {
    console.log('---> Recebeu msg do browser:');
    if (message) {
      const sendMessageResponse = await client.sendText(message.chatId, message.content);
      console.log('sendMessageResponse::::', sendMessageResponse)
    }
  });

  // client.listChats().then((response) => {
  //   console.log('Chats:', response);
  // })

}

const options = {
    session: 'sessionName',
    statusFind: (statusSession, session) => {
        //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
        console.log('Status Session: ', statusSession); 
        console.log('Session name: ', session);
    }
}


async function startServer() {
  console.log('iniciando server...')
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);

  // Crie o servidor Vite
  const vite = await createViteServer({
    server: { middlewareMode: 'true' }
  });

  // Use o middleware do Vite
  app.use(vite.middlewares);

  // Configuração do Socket.IO
  io.on('connection', (socket) => {

    console.log('iniciando socket...')
    console.log('A user connected');
    socket.emit('server_message', 'Hello from server');

    socket.on("conectarFone", (message) => {
      console.log('conectarFone.message:', message)
    });

    create(options).then((client) => {
      startClient(client, socket)
    }).catch((error) => {
      console.log(error)
    });

  });


  // Rota para servir a página inicial
  app.get('/', (req, res) => {
    res.sendFile('/home/roger/coding/chatguru/whatsapp/wwebjsexpress/index.html');
  });

  // Inicie o servidor
  httpServer.listen(3000, () => {
    console.log("Server is listening on port 3000...");
  });
}

startServer();
