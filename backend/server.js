require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // ✅ wrap app in http server

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const matchRoutes = require("./routes/match");
app.use("/api/match", matchRoutes);

const chatRoutes = require("./routes/chat");
app.use("/api/chat", chatRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

// ✅ Socket.io real-time chat
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins with their userId
  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("User joined:", userId);
  });

  // Send message in real-time
  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", {
        sender: senderId,
        message,
        createdAt: new Date()
      });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    Object.keys(onlineUsers).forEach(userId => {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
      }
    });
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Affinity Hub API Running");
});

// ✅ Use server.listen instead of app.listen
server.listen(5000, () => {
  console.log("Server running on port 5000");
});