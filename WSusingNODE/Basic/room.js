import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const rooms = new Map();

const joiningRoom = (ws, roomName) => {
  if (rooms.has(roomName) && rooms.get(roomName).has(ws)) {
    ws.send("You are already in the room");
    return;
  }
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  rooms.get(roomName).add(ws);

  if (!ws.rooms) {
    ws.rooms = new Set();
  }
  ws.rooms.add(roomName);

  ws.send("Congrates! You have joined the room");
};

const leavingRoom = (ws, roomName) => {
  if (rooms.has(roomName)) {
    rooms.get(roomName).delete(ws);
  }

  if (ws.rooms.has(roomName)) {
    ws.rooms.delete(roomName);
  }
  ws.send("You left from the room");
};

const sendMessage = (roomName, sender, message) => {
  const clients = rooms.get(roomName);
  if (!clients) return;

  for (const client of clients) {
    if (client !== sender && client.readyState === client.OPEN) {
      client.send(message);
    }
  }
  console.log("Message sent");
};

app.get("/", (req, res) => {
  res.send("Welcome to Websocket practice ground");
});

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`New User Connected from ${ip}`);
  ws.send(
    `Welcome, Try these commands \n join:roomName \n leave:roomName \n msg:roomName|message`
  );

  ws.on("message", (data) => {
    const msg = data.toString().trim();

    if (msg.startsWith("join:")) {
      let room = msg.split(":")[1];
      joiningRoom(ws, room);
    } else if (msg.startsWith("leave:")) {
      let room = msg.split(":")[1];
      leavingRoom(ws, room);
    } else if (msg.startsWith("msg:")) {
      let [room, text] = msg.slice(4).split("|");
      sendMessage(room, ws, text);
    } else {
      ws.send("Invalid Command");
    }
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected:", ip);
    if (ws.rooms) {
      for (const room of ws.rooms) {
        rooms.get(room)?.delete(ws);
      }
    }
  });

  ws.on("error", (err) => {
    console.log("⚠️ WebSocket error:", err);
  });
});

server.listen(3000, () => {
  console.log("Server started at http://localhost:3000");
});
