import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000", {
  autoConnect: false,
  reconnectionAttempts: 3,
  timeout: 5000,
});

export const PrivateNew = () => {
  const [myId, setMyId] = useState("");
  const [friendId, setFriendId] = useState("");
  const [users, setUsers] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  const msgRef = useRef(null);

  const socketId = socket.id;

  const connectSocket = () => {
    socket.on("connect", () => {
      console.log("User Connected via Client", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Server");
    });

    socket.on("private-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("joinUser", (data) => {
      setUsers((prev) => [...prev, data]);
    });
  };

  const JoinUser = (e) => {
    e.preventDefault();

    if (myId.trim()) {
      socket.emit("joinUser", { myId, socketId }, (res) => {
        if (res.status === true) {
          setIsJoined(true);
        }
      });
    }
  };

  const addFriend = (id) => {
    setFriendId(id);
  };

  useEffect(() => {
    connectSocket();
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    console.log("Users", users);
    console.log("Friend", friendId);
    console.log("Messages", messages);
  }, [users, friendId, messages]);

  const sendMessage = (e) => {
    e.preventDefault();

    if (friendId.trim() && draft.trim()) {
      console.log({ to: friendId, message: draft });
      socket.emit("private-message", { to: friendId, message: draft });
      setDraft("");
    } else {
      alert("Please select a friend");
    }
  };

  return (
    <div className="h-screen bg-gray-800 text-white p-4">
      {!isJoined ? (
        <div className="w-full h-full flex justify-center items-center gap-5">
          <input
            type="text"
            value={myId}
            onChange={(e) => setMyId(e.target.value)}
            placeholder="Enter a Username"
            className="border border-gray-300 w-[300px] px-4 py-3 rounded-md"
          />
          <button
            onClick={(e) => JoinUser(e)}
            className="bg-blue-700 px-6 py-3 rounded-md hover:bg-blue-800 cursor-pointer"
          >
            Join
          </button>
        </div>
      ) : (
        <div className="w-full h-full flex ">
          <div className="w-1/7 p-3  border-r border-gray=700">
            {users
              .filter((user) => user.id === myId)
              .map((user) => (
                <div className="w-full bg-green-800 px-2 py-2 rounded-md mb-5">
                  {user.id} - (You)
                </div>
              ))}
            {users
              .filter((user) => user.id !== myId)
              .map((user, index) => (
                <div
                  onClick={() => addFriend(user.id)}
                  key={index}
                  className="w-full bg-blue-800 px-2 py-2 rounded-md mb-3 cursor-pointer"
                >
                  {user.id}
                </div>
              ))}
          </div>
          <div className="flex flex-1 flex-col p-4">
            <div className="text-xl font-bold tracking-widest mb-5">
              Chat with {friendId}
            </div>

            {/*.........................................Message.............................................*/}
            <div className="w-full h-[400px] overflow-y-auto space-y-3">
              {messages
                .filter((msg) => {
                  return (
                    (msg.from === myId && msg.to === friendId) ||
                    (msg.from === friendId && msg.to === myId)
                  );
                })
                .map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.from === myId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`${
                        msg.from === myId
                          ? "bg-green-800"
                          : "border border-gray-700"
                      } w-fit max-w-[500px] px-4 py-2 rounded-md`}
                    >
                      <div>{msg.message}</div>
                      <div className="text-xs text-gray-500 text-right">
                        {new Date(msg.ts).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="w-full fixed bottom-5 space-x-2 ">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Enter Your Message"
                className="w-4/6 border-2 border-gray-600 px-3 py-2 rounded-md"
              />
              <button
                onClick={(e) => sendMessage(e)}
                className="w-1/7 bg-blue-800 px-4 py-2 rounded-md hover:bg-blue-900 cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
