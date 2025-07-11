import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:3000";

function PracticeJWT() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("candidate");
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [room] = useState("interview-room");
  const [loggedIn, setLoggedIn] = useState(false);

  // ✅ Reusable socket connection
  const connectSocket = () => {
    const newSocket = io(ENDPOINT, {
      withCredentials: true,
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    newSocket.on("connect", () => {
      setSocket(newSocket);
      setLoggedIn(true);
      newSocket.emit("joinRoom", room);
    });

    newSocket.on("systemMessage", (msg) => {
      setChat((prev) => [...prev, { system: true, message: msg }]);
    });

    newSocket.on("chatMessage", ({ username, message }) => {
      setChat((prev) => [...prev, { username, message }]);
    });

    newSocket.on("connect_error", () => {
      newSocket.disconnect();
    });
  };

  // ✅ Try auto-login on page load
  useEffect(() => {
    axios
      .get(`${ENDPOINT}/check-auth`, { withCredentials: true })
      .then(() => connectSocket())
      .catch((err) => {
        console.error("Check auth failed:", err.response?.data || err.message);
      });

    return () => {
      if (socket) socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async () => {
    try {
      await axios.post(
        `${ENDPOINT}/login`,
        { username, role },
        { withCredentials: true }
      );
      connectSocket();
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${ENDPOINT}/logout`, {}, { withCredentials: true });
      if (socket) socket.disconnect();
      setSocket(null);
      setChat([]);
      setLoggedIn(false);
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
  };

  const sendMessage = () => {
    if (socket && message.trim()) {
      socket.emit("sendMessage", { roomId: room, message });
      setMessage("");
    }
  };

  return (
    <div className="p-4 w-screen mx-auto font-sans min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
      {!loggedIn ? (
        <div className="w-2/4 space-y-4">
          <input
            className="border border-gray-700 bg-gray-800 text-white p-2 w-full rounded"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <select
            className="border border-gray-700 bg-gray-800 text-white p-2 w-full rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="candidate">Candidate</option>
            <option value="interviewer">Interviewer</option>
          </select>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 w-full rounded"
            onClick={login}
          >
            Login & Connect
          </button>
        </div>
      ) : (
        <div className="w-2/4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Chat Room</h2>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
              onClick={logout}
            >
              Logout
            </button>
          </div>
          <div className="border border-gray-700 bg-gray-800 p-4 h-64 overflow-y-auto rounded">
            {chat.map((msg, i) => (
              <div
                key={i}
                className={`mb-1 ${
                  msg.system ? "text-gray-400 italic" : "text-white"
                }`}
              >
                {msg.system ? (
                  msg.message
                ) : (
                  <>
                    <span className="text-blue-400 font-semibold">
                      {msg.username}:
                    </span>{" "}
                    {msg.message}
                  </>
                )}
              </div>
            ))}
          </div>
          <input
            className="border border-gray-700 bg-gray-800 text-white p-2 w-full rounded"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="bg-green-600 hover:bg-green-700 text-white p-2 w-full rounded"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}

export default PracticeJWT;
