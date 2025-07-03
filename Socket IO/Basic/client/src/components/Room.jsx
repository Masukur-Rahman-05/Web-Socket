import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000/chat", {
  autoConnect: false,
  reconnectionAttempts: 3,
  timeout: 5000,
});

export const Room = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("dummyRoom");

  const connectSocket = () => {
    socket.on("connect", () => {
      console.log("User connected via Client", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from Server");
    });

    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
  };

  useEffect(() => {
    connectSocket();
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (room.trim()) {
      socket.emit("join-room", room);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      const payload = {
        id: socket.id,
        message: input,
        timestamp: Date.now(),
      };

      socket.emit("send-message", { room, payload });
      setInput("");
    } else {
      alert("Please enter a message");
    }
  };
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <div className="w-[800px] h-[600px] border border-gray-700 flex flex-col gap-5 p-5 rounded-md">
        <div className="text-center text-2xl">- Room Example -</div>

        <form className="flex items-center gap-3">
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter room name"
            className="flex-1 px-2 py-3 border border-gray-500 outline-gray-500 p-2 rounded-md "
          />
          <button
            onClick={(e) => handleJoin(e)}
            className="px-6 py-2 bg-blue-500 rounded-md"
          >
            Join
          </button>
        </form>
        <div className="w-full h-[350px] border border-gray-600 overflow-y-auto rounded-md">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No messages yet...</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="mb-2">
                <span className="text-blue-300 font-medium">{msg.id}</span>{" "}
                <span className="text-gray-500 text-sm">
                  ({new Date(msg.timestamp).toLocaleTimeString()})
                </span>
                : <span>{msg.message}</span>
              </div>
            ))
          )}
        </div>

        <form className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type message here"
            className="flex-1 px-2 py-3 border border-gray-500 outline-gray-500 p-2 rounded-md "
          />
          <button
            onClick={(e) => sendMessage(e)}
            className="px-6 py-2 bg-green-500 rounded-md"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

/*
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const ChatComponent = () => {
  const [room, setRoom] = useState("friends"); // Default room
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000/chat");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to /chat namespace");
      newSocket.emit("joinRoom", room);
    });

    newSocket.on("chatMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => newSocket.disconnect();
  }, []);

  const joinRoom = () => {
    if (room.trim() && socket) {
      setMessages([]);
      socket.emit("joinRoom", room);
    }
  };

  const sendMessage = () => {
    if (message.trim() && socket && room) {
      socket.emit("chatMessage", { room, message });
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-xl">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Chat Room: <span className="text-blue-400">{room}</span>
        </h2>

        <div className="flex items-center gap-3 mb-6">
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter room name"
            className="flex-1 px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-700"
          />
          <button
            onClick={joinRoom}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Join Room
          </button>
        </div>

        <div className="h-64 overflow-y-auto bg-gray-800 border border-gray-700 rounded p-4 mb-4">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No messages yet...</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="mb-2">
                <span className="text-blue-300 font-medium">{msg.user}</span>{" "}
                <span className="text-gray-500 text-sm">
                  ({new Date(msg.timestamp).toLocaleTimeString()})
                </span>
                : <span>{msg.message}</span>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1 px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-700"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;

*/
