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
io.on("connection", () => {
  console.log("User Connect to default namespace ");
});

const chatNamespace = io.of("/chat");

chatNamespace.on("connection", (socket) => {
  console.log("New User Connected", socket.id);

  socket.on("send-message", (data) => {
    chatNamespace.emit("receive-message", data);
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
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
