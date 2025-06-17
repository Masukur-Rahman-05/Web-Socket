import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

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

  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
    console.log("Pong Received- User is active");
  });

  ws.on("message", (message) => {
    const msg = message.toString();
    console.log(`Received- ${msg}`);

    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN && client !== ws) {
        client.send(`Broadcast from ${ip}: ${msg}`);
      }
    });

    ws.send("Yeah I got your message");

    ws.on("error", (error) => {
      console.log("Client error Occurred", error);
    });
  });

  ws.on("close", (code, reason) => {
    console.log(`Connection closed with code ${code} and reason ${reason}`);
  });
});

//Ping-Pong Logic

const isActive = () => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log("No ping Received- Terminating connection");
      client.terminate();
    }

    ws.isAlive = false;
    console.log("Sending Ping");
    ws.ping();
  });
};

setInterval(isActive, 5000);

wss.on("error", (error) => {
  console.log("Server Error occurred", error);
});

server.listen(3000, () => {
  console.log("Server started at http://localhost:3000");
});

/*

ws.CONNECTING -	0	= Still establishing connection
ws.OPEN	- 1	= Connection is open (✅ can send data)
ws.CLOSING -	2	= Connection is closing
ws.CLOSED -	3	= Connection is closed
*/

/*
In WebSocket (ws library), each connected client is represented by a WebSocket 
object (ws), and all active clients are stored in wss.clients.

JavaScript compares objects by reference — so client === ws checks if 
they're the exact same object in memory.

The condition client.readyState === ws.OPEN && client !== ws ensures 
the server broadcasts only to connected clients, excluding the sender.

This is the core logic behind implementing real-time group messaging or 
broadcasting.

*/
