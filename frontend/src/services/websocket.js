import { io } from "socket.io-client";

const socket = io("http://localhost:5000/dashboard", {
    autoConnect: false,
    transports: ["polling", "websocket"],
});

socket.on("connect", () => {
    console.log("✅ Socket Connected");
    console.log("Socket ID:", socket.id);
    console.log("Socket Namespace:", socket.nsp);
});

socket.on("disconnect", (reason) => {
    console.log("❌ Socket Disconnected:", reason);
});

socket.on("connect_error", (err) => {
    console.error("❌ Socket Connection Error:", err.message);
});

socket.io.on("reconnect", (attempt) => {
    console.log(`🔄 Reconnected after ${attempt} attempts`);
});

socket.io.on("reconnect_attempt", (attempt) => {
    console.log(`🔄 Reconnect attempt ${attempt}`);
});

socket.io.on("reconnect_error", (err) => {
    console.error("❌ Reconnect Error:", err);
});

export default socket;