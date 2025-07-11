import express from "express";
import http from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";

const ENDPOINT = "http://localhost:5173";
const JWT_SECRET = "my_secret_key";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ENDPOINT,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ENDPOINT,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.post("/login", (req, res) => {
  const { username, role } = req.body;

  if (!username || !role)
    return res.status(400).json({ error: "Provide username and role" });

  const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: "1d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
  });
});

app.get("/check-auth", (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: "Authorization failed" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ success: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: "Authorization failed" });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Lax",
    secure: false, // should be true in production with HTTPS
  });
  res.json({ success: true, message: "Logged out" });
});

io.use((socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie;

  if (!cookieHeader) return next(new Error("No cookie Found"));

  const cookie = Object.fromEntries(
    cookieHeader.split("; ").map((c) => c.split("="))
  );

  const token = cookie.token;
  console.log("token", token);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});
io.on("connection", (socket) => {
  const { username } = socket.user;

  socket.on("joinRoom", (room) => {
    socket.join(room);
    socket.to(room).emit("systemMessage", `${username} joined the room`);
  });

  socket.on("sendMessage", ({ roomId, message }) => {
    io.to(roomId).emit("chatMessage", { username, message });
  });

  socket.on("disconnect", () => {
    console.log(`${username} disconnected`);
  });
});
server.listen(3000, () => {
  console.log("Server is Running on port 3000");
});

// import express from "express";
// import http from "http";
// import cors from "cors";
// import jwt from "jsonwebtoken";
// import { Server } from "socket.io";
// import cookieParser from "cookie-parser";

// const app = express();

// // Enable CORS with credentials
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// const JWT_SECRET = "your_secret_key";

// // ✅ Login route sets JWT as HttpOnly cookie
// app.post("/login", (req, res) => {
//   const { username, role } = req.body;
//   if (!username || !role)
//     return res.status(400).json({ error: "Missing data" });

//   const token = jwt.sign({ username, role }, JWT_SECRET, {
//     expiresIn: "1h",
//   });

//   res
//     .cookie("token", token, {
//       httpOnly: true,
//       sameSite: "Lax", // or "Strict"
//       secure: false, // set to true in production with HTTPS
//       maxAge: 60 * 60 * 1000, // 1 hour
//     })
//     .json({ success: true });
// });

// // ✅ Auth middleware for Socket.IO
// io.use((socket, next) => {
//   const cookieHeader = socket.handshake.headers.cookie;

//   console.log("cookieHeader", cookieHeader);

//   if (!cookieHeader) return next(new Error("No cookie found"));

//   // Parse cookie string into key-value object
//   const cookies = Object.fromEntries(
//     cookieHeader.split("; ").map((c) => c.split("="))
//   );

//   const token = cookies.token;
//   if (!token) return next(new Error("Token not found in cookie"));

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     socket.user = decoded;
//     next();
//   } catch (err) {
//     next(new Error("Invalid token"));
//   }
// });

// // ✅ Logout route clears the JWT cookie
// app.post("/logout", (req, res) => {
//   res.clearCookie("token", {
//     httpOnly: true,
//     sameSite: "Lax",
//     secure: false, // should be true in production with HTTPS
//   });
//   res.json({ success: true, message: "Logged out" });
// });

// // ✅ Check-auth route to validate cookie and return decoded token
// app.get("/check-auth", (req, res) => {
//   const token = req.cookies.token;
//   if (!token) return res.status(401).json({ error: "Not authenticated" });

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     res.json({ success: true, user: decoded });
//   } catch (err) {
//     res.status(401).json({ error: "Invalid token" });
//   }
// });

// // ✅ Socket connection logic
// io.on("connection", (socket) => {
//   const { username } = socket.user;

//   socket.on("joinRoom", (room) => {
//     socket.join(room);
//     socket.to(room).emit("systemMessage", `${username} joined the room`);
//   });

//   socket.on("sendMessage", ({ roomId, message }) => {
//     io.to(roomId).emit("chatMessage", { username, message });
//   });

//   socket.on("disconnect", () => {
//     console.log(`${username} disconnected`);
//   });
// });

// server.listen(3000, () => {
//   console.log("Server running on http://localhost:3000");
// });
