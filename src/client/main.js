import "./style.css";

import { createApp } from "vue";

import App from "./App.vue";

import socket from "./socket";

// createApp(App).mount("#app");

const app = createApp(App);
app.provide('socket', socket);
app.mount("#app");
