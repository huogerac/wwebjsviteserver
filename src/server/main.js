// Vite + Express + SocketIO
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';

import wwebjs from 'whatsapp-web.js';

// Local DB
let phone = {}

// WWebJS
const { Client, LocalAuth } = wwebjs
const pairingCodeEnabled = true;
let pairingCodeRequested = false;
let fone = ''
let clientReady = false;
let currentPhoneNumber = {}

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'huogerac-zap' }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});




async function getChats() {
  try {
    const response = []
    const chats = await client.getChats();

    for (const item of chats) {
      console.log('====>', item)
      const _chatId = item.id._serialized
      console.log('obtendo chats:', _chatId)
      const _chat = await client.getChatById(_chatId);
      let _newChat = {
        id: _chatId,
        name: _chat.name,
        isGroup: _chat.isGroup,
        isReadOnly: _chat.isReadOnly,
        unreadCount: _chat.unreadCount,
        timestamp: _chat.timestamp,
        archived: _chat.archived,
        pinned: _chat.pinned,
        isMuted: _chat.isMuted,
        muteExpiration: _chat.muteExpiration,
        messages: []
      }
      const _messages = await _chat.fetchMessages({ limit: 10 });
      for (const _msg of _messages) {
        const newMsg = {
          id: _msg.id._serialized,
          body: _msg.body,
          type: _msg.type,
          timestamp: _msg.timestamp,
          from: _msg.from,
          to: _msg.to,
          fromMe: _msg.fromMe,
          orderId: _msg.orderId,
        }
        _newChat.messages.push(newMsg)
      }
      response.push(_newChat)
    };

    console.log('-----------------chats:', response)
    return response
  } catch(err) {
    console.log('error:', err)
  }
}




async function startServer() {
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

    console.log('A user connected');
    socket.emit('server_message', 'Hello from server');

    // ----- WWEBJS
    client.on('authenticated', () => {
      // socket.emit('authenticated', '--->Autenticado!');
      socket.emit('server_message', 'authenticated');
      console.log('--->Autenticado!');
    });

    client.on('auth_failure', function () {
      socket.emit('server_message', 'auth_failure');
      console.error('---> Falha autenticação');
    });

    client.on('change_state', state => {
      socket.emit('server_message', 'change_state:' + state);
      console.log('---> change_state:' + state);
    });

    // Configuração WWebJS
    // client.once('ready', (details) => {
    //   console.log('ONCE READY [1] ---> Web Client is ready!', details);
    //   socket.emit('server_message', 'ready');
    // });

    client.on('ready', async () => {
      clientReady = true;
      console.log('ON READY ---> Web Client is ready!');
    
      // Retrieve the phone number
      // const me = await client.getMe();
      //console.log("info:", client.info)
      console.log("info:")
      currentPhoneNumber = {
        pushname: client.info.pushname,
        phone: client.info.wid.user,
      }
      console.log("currentPhoneNumber:", currentPhoneNumber)
      socket.emit('connectedFone', currentPhoneNumber);
    
      const _all_chats = await getChats();
      socket.emit('all_chats', _all_chats);
    
    });
    
    client.on('disconnected', (reason) => {
      //socket.emit('message', '---> disconnected:' + reason);
      console.log('---> disconnected:' + reason);
      socket.emit('server_message', {});
      clientReady = false;
      client.initialize();
    });

    // socket from client
    socket.on('message', (message) => {
      console.log('---> Recebeu msg do browser:', message);
      socket.emit('message', ' 2XXX ' + message);

    });

    socket.on('enviarMensagem', async (message) => {
      console.log('---> Recebeu msg do browser:', message);
      if (message && message.content) {
        const sendMessageResponse = await client.sendMessage(message.chatId, message.content);
        console.log('sendMessageResponse::::', sendMessageResponse)
      }
    });

    socket.on("conectarFone", (message) => {
      console.log('conectarFone.message:', message)
      fone = message.fone

      if (fone.length != 13 || !fone.startsWith("55")) {
        console.log('invalid fone!')
        socket.emit('server_message', 'invalid fone!');
        return
      }

      client.on('qr', async (qr) => {
        console.log('QR RECEIVED', qr);
        console.log('fone:', fone, ' pair:', pairingCodeEnabled, ' pair_req:', pairingCodeRequested)
  
        if (pairingCodeEnabled && !pairingCodeRequested && fone) {
          const pairingCode = await client.requestPairingCode(fone);
          pairingCodeRequested = true;
          console.log(' ==> Pairing code enabled, code: 👉' + pairingCode);
          socket.emit('server_message', 'PAIRING CODE: 👉' + pairingCode);
          socket.emit('pairingCode', pairingCode);
        } else {
          console.log('QR IGNORED')
        }
      });

    });

    client.on('message_create', async msg => {
      console.log('---> Nova mensagem', msg);

      if (msg.body !== "") {
        socket.emit('new_message', msg);

        if (msg.body.indexOf("ping") != -1) {
          const msgReply = '🏓 PONG!'
          msg.reply(msgReply)
        } 
      }

    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });




  });

  // WWebJS
  client.initialize();

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
