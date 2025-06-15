import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

app.get("/", (req, res) => {
  res.send("Home Page");
});

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log("A new user has connected from", ip);
  ws.send("Hello");

  ws.on("message", (message) => {
    const msg = message.toString();
    console.log(`Received- ${msg}`);

    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN && client !== ws) {
        client.send(`Broadcast from ${ip}: ${msg}`);
      }
    });

    ws.send("Yeah I got your message");
  });
});

server.listen(3000, () => {
  console.log("Server started at http://localhost:3000");
});
