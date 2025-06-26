import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  autoConnect: false,
  reconnectionAttempts: 3,
  timeout: 5000,
});
const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [formData, setFormData] = useState({ message: "" });

  const connectSocket = () => {
    socket.on("connect", () => {
      console.log("User Connected via Client", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Server");
      setIsConnected(false);
    });

    socket.on("connect-error", (error) => {
      console.log("Connection failed", error);
      setIsConnected(false);
    });

    socket.on("reconnect_failed", () => {
      console.log("Reconnection failed");
      setIsConnected(false);
      socket.disconnect();
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    try {
      e.preventDefault();
      if (isConnected) {
        socket.emit("send-message", formData);
        setFormData({ message: "" });
        console.log("Message sent");
      } else {
        alert("Not connected to server");
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="bg-black text-white h-screen w-screen flex flex-col items-center justify-center space-y-4">
      {isConnected ? (
        <h1 className="text-green-500">Connected</h1>
      ) : (
        <h1 className="text-red-500">Disconnected</h1>
      )}
      <h2 className="text-3xl">Type message here</h2>
      <form className="space-x-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="message"
          value={formData.message}
          onChange={handleInput}
          placeholder="Enter message"
          className="px-5 py-3 w-[300px] rounded-md border border-white"
        />
        <button
          type="submit"
          className="bg-blue-700 hover:bg-blue-600 w-[100px] h-[40px] rounded-md"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default App;

// import { useEffect, useState } from "react";
// import { io } from "socket.io-client";

// // Create socket with LIMITED reconnection attempts
// const socket = io("http://localhost:3000", {
//   autoConnect: false,
//   reconnectionAttempts: 3, // Only try 3 times, then stop
//   timeout: 5000, // Wait only 5 seconds for connection
// });
// function App() {
//   const [formData, setFormData] = useState({
//     message: "",
//   });

//   const [isConnected, setIsConnected] = useState(false);

//   const connectSocket = () => {
//     socket.on("connect", () => {
//       console.log("User Connected via client", socket.id);
//       setIsConnected(true);
//     });

//     socket.on("disconnect", () => {
//       console.log("Disconnected from server");
//       setIsConnected(false);
//     });

//     // This is the KEY part - when connection fails completely
//     socket.on("connect_error", (error) => {
//       console.log("Connection failed:", error.message);
//       setIsConnected(false);
//     });

//     // This stops trying after all attempts fail
//     socket.on("reconnect_failed", () => {
//       console.log("Gave up trying to reconnect");
//       setIsConnected(false);
//       // This completely stops the socket from trying again
//       socket.disconnect();
//     });
//   };

//   const handleInput = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // Only send if connected
//     if (isConnected) {
//       socket.emit("send-message", formData);
//       setFormData({ message: "" });
//       console.log("Message sent");
//     } else {
//       alert("Not connected to server!");
//     }
//   };

//   useEffect(() => {
//     connectSocket();
//     socket.connect(); // Start connection

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   return (
//     <div className="bg-black h-screen w-screen flex flex-col items-center justify-center">
//       {/* Simple connection status */}
//       <div className="mb-4">
//         {isConnected ? (
//           <div className="text-green-400 text-sm">✅ Connected to server</div>
//         ) : (
//           <div className="text-red-400 text-sm">❌ Not connected to server</div>
//         )}
//       </div>

//       <h2 className="text-3xl text-white font-bold">Write Message Here</h2>

//       <form className="text-white mt-[30px] space-x-5" onSubmit={handleSubmit}>
//         <input
//           type="text"
//           name="message"
//           value={formData.message}
//           onChange={handleInput}
//           placeholder="Enter your message"
//           className="text-black border border-white px-5 py-3 rounded-[10px]"
//         />
//         <button
//           className={`px-3 py-2 rounded-[10px] cursor-pointer ${
//             isConnected
//               ? "bg-blue-700 hover:bg-blue-600"
//               : "bg-gray-500 cursor-not-allowed"
//           }`}
//           disabled={!isConnected}
//         >
//           Send
//         </button>
//       </form>
//     </div>
//   );
// }

// export default App;

/*
✅ Common (Client & Server)
Event Name	Description
connect       =	Fired when a connection is successfully established.
disconnect       =	Fired when the client is disconnected.
connect_error       =	Fired when the connection fails (e.g., server is down, CORS error).
connect_timeout       =	Fired when the connection times out.
error       =	Fired when there's a general error.
reconnect       =	Fired after a successful reconnection. ⚠️ Only in v2; removed in v3+.
reconnect_attempt       =	Fired when a reconnection attempt is made.
reconnect_error       =	Fired when a reconnection attempt fails.
reconnect_failed       =	Fired when all reconnection attempts have failed.
ping       =	Emitted before a ping is sent to the server.
pong       =	Emitted when a pong is received from the server (with latency info).
*/
