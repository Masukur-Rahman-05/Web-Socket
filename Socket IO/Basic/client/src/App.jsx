import Basic from "./components/Basic.jsx";
import { Broadcast } from "./components/Broadcast.jsx";
import { Crud } from "./components/Crud.jsx";
import { Namespace } from "./components/Namespace.jsx";

const App = () => {
  return (
    <>
      {/* <Basic /> */}
      {/* <Crud /> */}
      {/* <Broadcast /> */}
      <Namespace />
    </>
  );
};

export default App;

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
