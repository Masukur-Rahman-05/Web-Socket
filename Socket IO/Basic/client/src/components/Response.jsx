import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000/chat", {
  autoConnect: false,
  reconnectionAttempts: 3,
  timeout: 5000,
});

export const Response = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("demoRoom");
  const [isJoin, setJoin] = useState(false);

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

    socket.on("join-room", (data) => {
      setJoin(data);
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
      socket.emit("join-room", room, (response) => {
        console.log(response);

        if (response.status === true) {
          setJoin(true);
        } else {
          setJoin(false);
        }
      });
    }
  };

  const handleLeave = () => {
    if (room.trim()) {
      socket.emit("leave-room", room, (res) => {
        if (res.status === true) {
          setMessages([]);
          setJoin(false);
        } else {
          console.log(res.message);
        }
      });
    } else {
      alert("Please enter a room name");
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

      socket.emit("send-message", { room, payload }, (res) => {
        if (res.status === true) {
          setInput("");
        } else {
          console.log(res.message);
        }
      });
    } else {
      alert("Please enter a message");
    }
  };
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <div className="md:w-[800px] h-[700px] sm:w-[600px] border border-gray-700 flex flex-col gap-5 p-5 rounded-md">
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
            className="px-6 py-2 bg-blue-500 rounded-md cursor-pointer hover:bg-blue-600"
          >
            Join
          </button>
        </form>
        <div className="w-full flex justify-center">
          <button
            onClick={handleLeave}
            disabled={!isJoin}
            className={`px-5 py-2 bg-red-600 rounded-md ${
              isJoin ? "cursor-pointer" : "cursor-not-allowed bg-red-900"
            } `}
          >
            Leave
          </button>
        </div>
        <div className="w-full h-[350px] border border-gray-600 overflow-y-auto rounded-md p-3">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No messages yet...</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="mb-2 ">
                <span className={"text-blue-300 font-medium"}>
                  {msg.id === socket.id ? "You" : msg.id}
                </span>{" "}
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
