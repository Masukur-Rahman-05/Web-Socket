import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  autoConnect: false,
  reconnectionAttempts: 3,
  timeout: 5000,
});

export const Broadcast = () => {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState([]);

  const connectSocket = () => {
    socket.on("connect", () => {
      console.log("User Connect via client", socket.id);
    });

    socket.on("receive-message", (data) => {
      setMessage((prev) => [...prev, data]);
    });
  };

  console.log(message);

  const handleInput = (e) => {
    setInput(e.target.value);
    console.log(input);
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const payload = {
      id: socket.id,
      message: input,
    };

    setMessage((prev) => [...prev, payload]);

    socket.emit("send-message", payload);
    setInput("");
  };

  useEffect(() => {
    connectSocket();
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <div className="w-screen h-screen bg-black text-white flex items-center flex-col gap-10  pt-[100px]">
      <h2 className="text-3xl text-gray-300">Broadcasting Message</h2>
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

      {message.length > 0 && (
        <div className="w-[600px] h-[300px] border border-gray-300 p-10 overflow-y-auto">
          {message.map((item, index) => {
            let isMine = item.id === socket.id;
            return (
              <div
                key={index}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-xl text-white ${
                    isMine ? "bg-blue-500 text-right" : "bg-gray-700 text-left"
                  }`}
                >
                  {item.message}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
