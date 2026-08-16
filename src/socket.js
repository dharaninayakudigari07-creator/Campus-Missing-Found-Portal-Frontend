import { io } from "socket.io-client";
import { BACKEND_URL } from "./config";

const socket = io(
  import.meta.env.VITE_SOCKET_URL || BACKEND_URL,
  {
    transports: ["websocket"],
    autoConnect: true,
  }
);

export default socket;
