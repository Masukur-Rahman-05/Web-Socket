import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";

function App() {
  const [formData, setFormData] = useState({ message: "" });
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [unsentMessages, setUnsentMessages] = useState([]);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Initialize socket with production-ready config
  const initializeSocket = useCallback(() => {
    if (socketRef.current) return socketRef.current;

    const socket = io("http://localhost:3000", {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity, // Keep trying indefinitely
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 20000,
      forceNew: false,
    });

    // Connection successful
    socket.on("connect", () => {
      console.log("Connected to server", socket.id);
      setConnectionStatus("connected");

      // Send any queued messages
      if (unsentMessages.length > 0) {
        unsentMessages.forEach((msg) => {
          socket.emit("send-message", msg);
        });
        setUnsentMessages([]);
      }
    });

    // Connection lost
    socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      setConnectionStatus("disconnected");

      // Only show reconnecting if it's not intentional disconnect
      if (reason !== "io client disconnect") {
        setConnectionStatus("reconnecting");
      }
    });

    // Connection error
    socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
      setConnectionStatus("reconnecting");
    });

    // Reconnection attempts
    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
      setConnectionStatus("reconnecting");
    });

    // Successfully reconnected
    socket.on("reconnect", (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      setConnectionStatus("connected");
    });

    // Listen for incoming messages
    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, { ...data, type: "received" }]);
    });

    socketRef.current = socket;
    return socket;
  }, [unsentMessages]);

  // Smart connection management based on app state
  const handleConnection = useCallback(() => {
    const socket = initializeSocket();

    // Only connect if online and not already connected
    if (isOnline && !socket.connected) {
      socket.connect();
      setConnectionStatus("connecting");
    }
  }, [isOnline, initializeSocket]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionStatus("connecting");
      // Auto-reconnect when back online
      if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStatus("offline");
      // Don't disconnect socket - let it handle reconnection automatically
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle page visibility changes (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Tab became active - reconnect if needed
        if (isOnline && socketRef.current && !socketRef.current.connected) {
          socketRef.current.connect();
        }
      }
      // Note: We don't disconnect on hidden - let socket handle it naturally
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isOnline]);

  // Handle page unload (closing tab/browser)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socketRef.current) {
        // Gracefully disconnect before page unload
        socketRef.current.disconnect();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    handleConnection();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [handleConnection]);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.message.trim()) return;

    const messageData = {
      message: formData.message,
      timestamp: new Date().toISOString(),
      id: Date.now(),
    };

    // Add to messages immediately (optimistic update)
    setMessages((prev) => [...prev, { ...messageData, type: "sent" }]);

    if (socketRef.current && socketRef.current.connected) {
      // Send immediately if connected
      socketRef.current.emit("send-message", messageData);
    } else {
      // Queue for later if not connected
      setUnsentMessages((prev) => [...prev, messageData]);
    }

    setFormData({ message: "" });
  };

  const getStatusDisplay = () => {
    if (!isOnline) return { text: "No Internet", color: "text-red-400" };

    switch (connectionStatus) {
      case "connected":
        return { text: "Online", color: "text-green-400" };
      case "connecting":
        return { text: "Connecting...", color: "text-yellow-400" };
      case "reconnecting":
        return { text: "Reconnecting...", color: "text-yellow-400" };
      case "offline":
        return { text: "Offline", color: "text-red-400" };
      default:
        return { text: "Disconnected", color: "text-gray-400" };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="bg-black h-screen w-screen flex flex-col">
      {/* Header with status */}
      <div className="bg-gray-900 p-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">Chat App</h1>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${status.color.replace(
              "text-",
              "bg-"
            )}`}
          ></div>
          <span className={`text-sm ${status.color}`}>{status.text}</span>
          {unsentMessages.length > 0 && (
            <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
              {unsentMessages.length} pending
            </span>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`p-3 rounded-lg max-w-xs ${
              msg.type === "sent"
                ? "bg-blue-600 text-white ml-auto"
                : "bg-gray-700 text-white mr-auto"
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div>

      {/* Input area */}
      <form className="p-4 bg-gray-900 flex space-x-2" onSubmit={handleSubmit}>
        <input
          type="text"
          name="message"
          value={formData.message}
          onChange={handleInput}
          placeholder={
            isOnline ? "Type a message..." : "No internet connection"
          }
          disabled={!isOnline}
          className="flex-1 text-black px-4 py-2 rounded-lg disabled:bg-gray-300"
        />
        <button
          type="submit"
          disabled={!formData.message.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
