import { io } from "socket.io-client";

const socket = io("http://localhost:5000/dashboard", {
    transports: ["websocket"],
    autoConnect: false,
});

socket.on("connect", () => {
    console.log("✅ Socket Connected");
    console.log("Socket ID:", socket.id);
});

socket.io.on("reconnect", (attempt) => {
    console.log(`Reconnected after ${attempt} attempts`);
});

socket.io.on("reconnect_attempt", (attempt) => {
    console.log(`Reconnect attempt ${attempt}`);
});

socket.io.on("reconnect_error", (err) => {
    console.error("Reconnect Error", err);
});

socket.on("disconnect", (reason) => {
    console.log("❌ Socket Disconnected:", reason);
});

socket.on("connect_error", (err) => {
    console.error("❌ Socket Connection Error:", err.message);
});

socket.on("dashboard_update", (data) => {
    console.log("Dashboard Update:", data);
});

socket.on("new_alert", (data) => {
    console.log("New Alert:", data);
});

socket.on("live_frame", (data) => {
    console.log("Frame received:", data.camera_id);
});

socket.on("processing_complete", (data) => {
    console.log("Processing Complete:", data.camera_id);
});

export default socket;