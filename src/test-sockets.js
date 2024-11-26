const io = require("socket.io-client");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzNjNTZiYzgxNGJlZmRmOTlmMGUxZGQiLCJpYXQiOjE3MzIwMjQwNzgsImV4cCI6MTczMjAyNzY3OH0.gl55A1PBIczulAvKEEEzwPdmiZKi-fVkgyPzssYfxAg"; 
const serverUrl = "http://localhost:3000";

// Connect to the WebSocket server with the token in the headers
const socket = io(serverUrl, {
  auth: {
    token: `Bearer ${token}`,
  },
});

socket.on("connect", () => {
  console.log("Connected to the WebSocket server");

  // Send a message to a private user
  console.log("Sending a private message...");
  socket.emit("sendMessage", {
    content: "Hello, this is a test message!",
    sender: "user1",
    receiver: "user2",
  });

  // Send a message to a channel
  console.log("Sending a channel message...");
  socket.emit("sendMessage", {
    content: "Hello, channel!",
    sender: "user1",
    channelId: "12345",
  });

  // Join a channel to listen for messages
  console.log("Joining channel 12345...");
  socket.emit("joinChannel", { channelId: "12345" });
});

// Listen for new private messages
socket.on("newPrivateMessage", (data) => {
  console.log("New private message received:");
  console.log(data);
});

// Listen for new channel messages
socket.on("newChannelMessage", (data) => {
  console.log("New channel message received:");
  console.log(data);
});

// Handle connection errors
socket.on("connect_error", (error) => {
  console.error("Connection error:", error.message);
});

// Handle server-disconnected event
socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket server");
});
