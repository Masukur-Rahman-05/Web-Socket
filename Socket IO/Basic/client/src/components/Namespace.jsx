import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000/chat", {
  autoConnect: false,
  reconnectionAttempts: 3,
  timeout: 5000,
});

export const Namespace = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const connectSocket = () => {
    socket.on("connect", () => {
      console.log("User Connect via client", socket.id);
    });

    socket.on("receive-message", (data) => {
      console.log(data);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Server");
    });
  };

  useEffect(() => {
    connectSocket();
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const payload = {
      id: socket.id,
      message: input,
      status: "pending",
    };

    setMessages((prev) => [...prev, payload]);

    socket.emit("send-message", payload);

    console.log(input);
    setInput("");
  };

  console.log(messages);
  return (
    <div className="w-screen h-screen bg-black flex flex-col items-center text-white pt-10">
      <div>Namespace</div>
      <form className="flex flex-col items-center gap-5">
        <input
          type="text"
          name="message"
          value={input}
          onChange={handleInput}
          className="border border-gray-300 w-[500px] rounded-md px-5 py-3"
        />
        <button
          type="submit"
          onClick={(e) => handleSubmit(e)}
          className="w-[100px] bg-blue-600 rounded-md px-5 py-3 cursor-pointer hover:bg-blue-700"
        >
          Send
        </button>
      </form>
      <div className="mt-10">
        {messages?.map((message, index) => (
          <div
            key={index}
            className="border border-gray-300 w-[500px] rounded-md px-5 py-3 mb-2"
          >
            {message.message}
          </div>
        ))}
      </div>
    </div>
  );
};
