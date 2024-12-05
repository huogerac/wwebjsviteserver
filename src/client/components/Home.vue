<script>
import { inject, ref, onMounted, onBeforeUnmount } from 'vue';

export default {
  setup() {
    const socket = inject('socket'); // Inject the global socket instance
    const messages = ref(['aa']);
    
    onMounted(() => {
      console.log('Client mounted');
      socket.on('message', (msg) => {
        messages.value.push(msg);
        console.log('Received message:', msg);
      });
    });

    onBeforeUnmount(() => {
      if (socket) {
        socket.disconnect();
      }
    });

    return {
      messages
    };
  }
};
</script>

<template>
  <div>
    <h1>Socket Messages</h1>
    <div class="card">
      <p>
        <input type="text" name="fone" value="55" placeholder="5512991000222">
      </p>
      <p>
        <button type="button" @click="">Conectar</button>
      </p>
      <p>
        <code v-for="message in messages" :key="message">{{ message }}</code>
      </p>
    </div>
  </div>
</template>

<style>
/* Add your styles here */
</style>
