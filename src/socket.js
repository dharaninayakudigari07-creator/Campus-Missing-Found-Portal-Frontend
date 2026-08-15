import { io } from "socket.io-client";

const socket = io("https://campus-missing-found-portal-backend.onrender.com", {
    transports: ["websocket"],
    autoConnect: true,
});

export default socket;

