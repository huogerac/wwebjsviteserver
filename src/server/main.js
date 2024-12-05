// Vite + Express + SocketIO
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';

// WWebJS
import wwebjs from 'whatsapp-web.js';
const { Client, LocalAuth } = wwebjs

const pairingCodeEnabled = true;
let pairingCodeRequested = false;
let fone = ''
let clientReady = false;

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

// webjs

client.on('authenticated', () => {
  // socket.emit('authenticated', '--->Autenticado!');
  // socket.emit('message', '--->Autenticado!');
  console.log('--->Autenticado!');
});

client.on('auth_failure', function () {
  // socket.emit('message', '---> Falha autenticação');
  console.error('---> Falha autenticação');
});

// client.on('change_state', state => {
//   socket.emit('message', '---> change_state:' + state);
//   console.log('---> change_state:' + state);
// });

// Configuração WWebJS
client.once('ready', () => {
  console.log('ONCE READY ---> Web Client is ready!');
});

client.on('disconnected', (reason) => {
  //socket.emit('message', '---> disconnected:' + reason);
  console.log('---> disconnected:' + reason);
  clientReady = false;
  client.initialize();
});

client.initialize();


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
    socket.emit('message', 'Hello from server');

    // socket from client
    socket.on('message', (message) => {
      console.log('---> Recebeu msg do browser:', message);
      socket.emit('message', ' 2XXX ' + message);

    });
    socket.on("conectarFone", (message) => {
      console.log('conectarFone.message:', message)
      fone = message.fone

      // 5512991088998
      if (fone.length != 13 || !fone.startsWith("55")) {
        console.log('invalid fone!')
        socket.emit('message', 'invalid fone!');
        return
      }

      client.on('qr', async (qr) => {
        console.log('QR RECEIVED', qr);
        console.log('fone:', fone, ' pair:', pairingCodeEnabled, ' pair_req:', pairingCodeRequested)
  
        if (pairingCodeEnabled && !pairingCodeRequested && fone) {
          const pairingCode = await client.requestPairingCode(fone);
          pairingCodeRequested = true;
          console.log(' ==> Pairing code enabled, code: 👉' + pairingCode);
          socket.emit('message', 'PAIRING CODE: 👉' + pairingCode);
          socket.emit('pairingCode', pairingCode);
        } else {
          console.log('QR IGNORED')
        }
      });

    });

    client.on('ready', async () => {
      clientReady = true;
      console.log('ON READY ---> Web Client is ready!');

      // Retrieve the phone number
      const me = await client.getMe();
      currentPhoneNumber = me.id.user;
      console.log('Current phone number:', currentPhoneNumber);
      socket.emit('connectedFone', currentPhoneNumber);
    });

    client.on('message_create', async msg => {
      console.log('---> Nova mensagem', msg);
      if (msg.body !== "" && msg.body.indexOf("ping") != -1) {
        const msgReply = '👏 Obrigado pelo contato, logo irei responder...'
        msg.reply(msgReply)
        // client.sendMessage(message.from, 'pong');
        socket.emit('message', msgReply);
      } else if (msg.body !== "" && msg.body.indexOf("Obrigado pelo contato") == -1 && msg.body.indexOf("PONG") == -1) {
        const msgReply = '🏓 PONG!'
        msg.reply(msgReply)
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
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
