require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const { ExpressPeerServer } = require('peer');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// ✅ PeerJS server
const peerServer = ExpressPeerServer(server, { debug: true });
app.use('/peerjs', peerServer);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const matchRoutes = require("./routes/match");
app.use("/api/match", matchRoutes);

const chatRoutes = require("./routes/chat");
app.use("/api/chat", chatRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("User joined:", userId);
  });

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

  // ✅ Call signaling
  socket.on("callUser", ({ callerId, receiverId, callerPeerId, callType }) => {
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("incomingCall", {
        callerId,
        callerPeerId,
        callType
      });
    }
  });

  socket.on("acceptCall", ({ callerId, receiverPeerId }) => {
    const callerSocket = onlineUsers[callerId];
    if (callerSocket) {
      io.to(callerSocket).emit("callAccepted", { receiverPeerId });
    }
  });

  socket.on("rejectCall", ({ callerId }) => {
    const callerSocket = onlineUsers[callerId];
    if (callerSocket) {
      io.to(callerSocket).emit("callRejected");
    }
  });

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

server.listen(5000, () => {
  console.log("Server running on port 5000");
});