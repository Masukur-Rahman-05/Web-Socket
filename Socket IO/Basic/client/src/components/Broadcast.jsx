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
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const payload = {
      id: socket.id,
      message: input,
      status: "pending",
    };

    setMessage((prev) => [...prev, payload]);

    socket.emit("send-message", payload, (response) => {
      setMessage((prev) => {
        return prev.map((user) => {
          if (user.id === response.id) {
            return {
              ...user,
              status: response.status,
            };
          } else {
            return user;
          }
        });
      });
    });
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
        <div className="w-[600px] h-[350px] border border-gray-300 p-10 overflow-y-auto">
          {message.map((item, index) => {
            const isMine = item.id === socket.id;
            return (
              <div
                key={index}
                className={`mb-4 ${isMine ? "text-right" : "text-left"}`}
              >
                <div
                  className={`inline-block max-w-[80%] px-4 py-2 rounded-xl text-white ${
                    isMine ? "bg-blue-500" : "bg-gray-700"
                  }`}
                >
                  {item.message}
                </div>
                {isMine && (
                  <div className="text-xs text-gray-400 mt-1">
                    {item.status === "pending" ? "Pending" : "Sent"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
