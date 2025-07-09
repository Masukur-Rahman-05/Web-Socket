//.............................This section is for PrivateNew.jsx Component.............................

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

// Simple HTTP route
app.get("/", (req, res) => {
  res.send("Hello World");
});

let Users = new Map();

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  socket.on("joinUser", ({ myId, socketId }, callback) => {
    Users.set(myId, socketId);

    let id = [...Users.keys()].find((id) => id === myId);

    io.emit("joinUser", { id });
    console.log(Users);
    callback({ status: true });
  });

  socket.on("private-message", ({ to, message }) => {
    let from = [...Users].find(([_, id]) => id === socket.id)?.[0];

    if (!from || !to || to === from || !message?.trim()) return;

    let target = Users.get(to);

    let payload = {
      from,
      to,
      message,
      ts: Date.now(),
    };

    console.log(payload);
    io.to(target).emit("private-message", payload);

    socket.emit("private-message", payload);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
