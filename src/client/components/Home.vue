<script>
import { inject, ref, onMounted, onBeforeUnmount } from 'vue';

export default {
  setup() {
    const socket = inject('socket'); // Inject the global socket instance
    const messages = ref([]);
    const title = ref('Oi WWebJS');
    const fone = ref('');
    const connected = ref(false);
    const loading = ref(true);
    
    const chatSelected = ref(0)
    const chats = ref([])
    const chatMessages = ref([])

    let newMessageTxt = ref('')

    onMounted(() => {
      console.log('Client mounted');

      socket.on('initialized', (msg) => {
        messages.value.push('initialized');
        loading.value = false;
        console.log('Received initialized:', msg);
      });

      socket.on('disconnected', (msg) => {
        messages.value.push('disconnected');
        loading.value = false;
        connected.value = false;
        console.log('Received initialized:', msg);
      });

      socket.on('new_message', (msg) => {
        //messages.value.push(msg);
        console.log('Received message:', msg);
        debugger
        for (const item of chats.value) {
          if (item.id == msg.from) {
            const newMsg = {
              id: msg.id._serialized,
              body: msg.body,
              type: msg.type,
              timestamp: msg.timestamp,
              from: msg.from,
              to: msg.to,
              fromMe: msg.fromMe,
              orderId: msg.orderId,
            }
            item.messages.push(newMsg)
          }
        }
      });

      socket.on('connectedFone', (currentPhoneNumber) => {
        console.log('Received currentPhoneNumber:', currentPhoneNumber);
        connected.value = true;
        loading.value = false;
        fone.value = currentPhoneNumber.phone;
      });

      socket.on('all_chats', (allChats) => {
        console.log('all_chats currentPhoneNumber');
        chats.value = allChats;
      });

      socket.on('server_message', (msg) => {
        console.log('Received msg:', msg);
        messages.value.push(msg);
      });

    });

    onBeforeUnmount(() => {
      if (socket) {
        socket.disconnect();
      }
    });



    const conectarFoneBtn = () => {
      if (socket) {
        const foneMessage = {"fone": fone.value}
        socket.emit('conectarFone', foneMessage);
        console.log("Enviando fone:", foneMessage)
      }
    };

    const selectChat = (messagesSel, chatId) => {
      console.log('selectedChat',messagesSel)
      chatMessages.value = messagesSel
      chatSelected.value = chatId
    }

    const enviarMensagem = () => {
      console.log("cheguei aqui 1")
      if (socket) {
        const message = {
          chatId: chatSelected.value,
          content: newMessageTxt.value
        }
        socket.emit('enviarMensagem', message);
      }
    }


    return {
      messages,
      title,
      enviarMensagem,
      fone,
      conectarFoneBtn,
      connected,
      loading,
      chats,
      chatMessages,
      selectChat,
      newMessageTxt,
      chatSelected,
    };
  }
};
</script>

<template>



  <div class="row">

    <div class="col">

      <h1>loading:{{ loading }}</h1>
      <div v-if="loading">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <h1>{{ title }}</h1>
      <p>fone: {{ fone }}</p>

      <div class="card" v-if="!loading">
        <button type="button" @click="enviarMensagem">Enviar</button>
        <p v-if="!connected">
          <label for="fone">Fone:</label>
          <input type="text" name="fone" id="fone" v-model="fone">
          <button type="button" @click="conectarFoneBtn">Conectar</button>
        </p>
        <p v-else>
          <label for="fone">Conectado</label>
          <input type="text" name="fone" id="fone" v-model="fone" readonly>
        </p>
        <p>
          <code v-for="message in messages" :key="message">🫸 {{ message }}</code>
        </p>
      </div>

    </div>
  

  </div> <!-- row -->

  <div class="row">
    <div class="col-4">
      <table class="table">
        <thead>
        </thead>
        <tbody>
          <tr v-for="chat in chats">
            <td @click="selectChat(chat.messages, chat.id)">{{ chat.name }}</td>
          </tr>
        </tbody>
      </table>

    </div>
    <div class="col-8">
      <table class="table">
        <tbody>
          <tr v-for="msg in chatMessages">
            <td>{{ msg.body }}</td>
          </tr>
        </tbody>
      </table>

      <div class="card">
        <div class="card-body">
          <input type="text" class="form-control" id="" placeholder="Mensagem..." v-model="newMessageTxt">
          <button type="button" class="btn btn-sm btn-outline-primary" @click="enviarMensagem">Enviar</button>
        </div>
      </div>

    </div>
  </div>  <!-- row -->



</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
