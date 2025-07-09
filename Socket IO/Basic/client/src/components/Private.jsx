// src/DM.jsx
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export default function Private() {
  const [myId, setMyId] = useState("");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [friend, setFriend] = useState("");
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    if (!joined) return;

    socket.emit("join", { id: myId });
    socket.on("users", (userList) => {
      setUsers(userList);
      console.log(userList);
    });
    socket.on("private-message", (m) => {
      setMsgs((p) => [...p, m]);
    });

    return () => socket.off(); // clean up listeners
  }, [joined, myId]);

  useEffect(() => endRef.current?.scrollIntoView(), [msgs]);
  useEffect(() => {
    console.log(msgs);
  }, [msgs]);

  const send = () => {
    if (draft.trim() && friend) {
      socket.emit("private-message", { to: friend, message: draft });
      setDraft("");
    }
  };

  return !joined ? (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <div>
        <input
          placeholder="Your name"
          className="bg-gray-700 p-2 rounded"
          value={myId}
          onChange={(e) => setMyId(e.target.value)}
        />
        <button
          onClick={() => myId && setJoined(true)}
          className="ml-2 bg-blue-600 px-4 py-2 rounded"
        >
          Join
        </button>
      </div>
    </div>
  ) : (
    <div className="h-screen flex bg-gray-900 text-white">
      {/* Users */}

      <aside className="w-56 border-r border-gray-800 p-4 space-y-2">
        <div>
          {users
            .filter((user) => user.id === myId)
            .map((user) => (
              <div
                key={user.id}
                className="font-bold text-green-500 tracking-widest"
              >
                {user.id}
              </div>
            ))}
        </div>
        {users
          .filter((u) => u.id !== myId)
          .map((u) => (
            <div
              key={u.id}
              onClick={() => {
                setFriend(u.id);
                setMsgs([]);
              }}
              className={`p-2 rounded cursor-pointer ${
                friend === u.id ? "bg-blue-700" : "hover:bg-gray-800"
              }`}
            >
              {u.id}
            </div>
          ))}
      </aside>

      {/* Chat */}
      <main className="flex-1 flex flex-col">
        {!friend ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Pick a user to chat
          </div>
        ) : (
          <>
            <div className="p-3 border-b border-gray-800">
              Chat with {friend}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs
                .filter(
                  (m) =>
                    (m.from === myId && m.to === friend) ||
                    (m.from === friend && m.to === myId)
                )
                .map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-xs px-3 py-2 rounded ${
                      m.from === myId ? "bg-blue-600 ml-auto" : "bg-gray-800"
                    }`}
                  >
                    <div className="text-xs font-semibold">
                      {m.from === myId ? "You" : m.from}
                    </div>
                    <div>{m.message}</div>
                    <div className="text-[10px] opacity-70">
                      {new Date(m.ts).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              <div ref={endRef} />
            </div>

            <div className="border-t border-gray-800 p-3 flex gap-2">
              <input
                className="flex-1 bg-gray-800 p-2 rounded"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Message"
              />
              <button
                disabled={!draft.trim()}
                onClick={send}
                className="bg-green-600 px-4 py-2 rounded disabled:bg-gray-600"
              >
                Send
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
