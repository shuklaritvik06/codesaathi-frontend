import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  forceNew: true,
  reconnectionAttempts: Infinity,
  timeout: 10000,
  transports: ["websocket"]
});
