// index.js
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// ──────────────────────────────────────────────
// Socket.IO setup
// ──────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Simple HTTP route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// ──────────────────────────────────────────────
// Default namespace ("/")
// ──────────────────────────────────────────────
io.on("connection", () => {
  console.log("User connected to default namespace");
});

// ──────────────────────────────────────────────
// /chat namespace with room logic
// ──────────────────────────────────────────────
const chatNamespace = io.of("/chat");

chatNamespace.on("connection", (socket) => {
  console.log("User connected to /chat:", socket.id);

  // Join a room
  socket.on("join-room", (roomName) => {
    if (!roomName) return;

    // leave previous rooms (except the socket’s own room)
    socket.rooms.forEach((room) => {
      if (room !== socket.id) socket.leave(room);
    });

    socket.join(roomName);
    console.log(`${socket.id} joined room ${roomName}`);

    // Optional system‑message announcing the join
    chatNamespace.to(roomName).emit("receive-message", {
      id: "System",
      message: `${socket.id} joined`,
      timestamp: Date.now(),
    });
  });

  // Incoming chat message → broadcast to the specific room
  socket.on("send-message", ({ room, payload }) => {
    console.log("Message received:", payload);

    const data = {
      id: payload.id,
      message: payload.message,
      timestamp: Date.now(),
    };

    chatNamespace.to(room).emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ──────────────────────────────────────────────
// Start server
// ──────────────────────────────────────────────
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

//......................This Section is for Basic.jsx and Crud.jsx...............................
/*
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

let users = [];

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  socket.on("send-message", (data) => {
    users.push(data);
    console.log("Users", users);
    socket.emit("receive-message", data);
  });
  socket.on("update-message", (data) => {
    let index = users.findIndex((user) => user.id === data.id);
    if (index !== -1) {
      users[index] = data;
      console.log("Users", users);
      socket.emit("receive-message", data);
    }
  });

  socket.on("delete-message", (id) => {
    let index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
      users.splice(index, 1);
      console.log("Users", users);
      socket.emit("user-deleted", id);
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
*/

//......................This Section is for Broadcast.jsx...............................
/*
let users = [];

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  socket.on("send-message", (data, callback) => {
    let payload = {
      ...data,
      status: "sent",
    };

    callback(payload);
    users.push(data);
    console.log("Users", users);
    socket.broadcast.emit("receive-message", payload);
  });
});
*/
