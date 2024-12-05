<script>
import { inject, ref, onMounted, onBeforeUnmount } from 'vue';

export default {
  setup() {
    const socket = inject('socket'); // Inject the global socket instance
    const messages = ref([]);
    const title = ref('Oi WWebJS');
    const fone = ref('');
    const connected = ref(false);
    
    onMounted(() => {
      console.log('Client mounted');
      socket.on('message', (msg) => {
        messages.value.push(msg);
        console.log('Received message:', msg);
      });

      socket.on('connectedFone', (foneFromServer) => {
        console.log('Received foneFromServer:', foneFromServer);
        connected.value = true;
        fone.value = foneFromServer;
      });

    });

    onBeforeUnmount(() => {
      if (socket) {
        socket.disconnect();
      }
    });

    const enviarMensagem = () => {
      console.log("cheguei aqui 1")
      if (socket) {
        console.log("cheguei aqui 1")
        const message = 'Mensagem do cliente ----';
        socket.emit('message', message);
        console.log("cheguei aqui 1")
        console.log('Mensagem enviada:', message);
      }
    };

    const conectarFoneBtn = () => {
      if (socket) {
        const foneMessage = {"fone": fone.value}
        socket.emit('conectarFone', foneMessage);
        console.log("Enviando fone:", foneMessage)
      }
    };

    return {
      messages,
      title,
      enviarMensagem,
      fone,
      conectarFoneBtn,
      connected,
    };
  }
};
</script>

<template>
  <h1>{{ title }}</h1>
  <p>fone: {{ fone }}</p>

  <div class="card">
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

</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
