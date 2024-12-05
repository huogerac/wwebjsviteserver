import "./style.css";

import { createApp } from "vue";

import App from "./App.vue";

import socket from "./socket";
const app = createApp(App);
app.provide('socket', socket);
app.mount("#app");
