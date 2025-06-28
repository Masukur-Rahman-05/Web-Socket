import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const socket = io("http://localhost:3000", {
  autoConnect: false,
  reconnectionAttempts: 3,
  timeout: 5000,
});

export const Crud = () => {
  const [formData, setFormData] = useState({ name: "", age: "", phone: "" });
  const [users, setUsers] = useState([]);
  const [isEdit, setIsEdit] = useState(false);

  const [isConnected, setIsConnected] = useState(false);

  //......................................Connection Logic.................................
  const connectSocket = () => {
    socket.on("connect", () => {
      console.log("User Connected via Client", socket.id);
      setIsConnected(true);
    });

    socket.on("connect-error", (error) => {
      console.log("Connection Error", error);
      setIsConnected(false);
    });

    socket.on("reconnect_failed", () => {
      console.log("Reconnection failed");
      setIsConnected(false);
      socket.disconnect();
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Server");
      setIsConnected(false);
    });

    socket.on("receive-message", (data) => {
      setUsers((prev) => {
        let index = prev.findIndex((user) => user.id === data.id);

        if (index !== -1) {
          let updateUsers = [...prev];
          updateUsers[index] = data;
          return updateUsers;
        }

        return [...prev, data];
      });
    });

    socket.on("user-deleted", (id) => {
      setUsers((prev) => {
        let index = prev.findIndex((user) => user.id === id);

        if (index !== -1) {
          let updateUsers = [...prev];
          updateUsers.splice(index, 1);
          return updateUsers;
        }

        return prev;
      });
    });
  };
  //..............................................UseEffect Logic.................................
  useEffect(() => {
    connectSocket();
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  //...............................Handle Form Logic.........................................
  const handleInput = (e) => {
    setFormData((prev) => ({
      ...prev,
      id: prev.id || uuidv4(),
      [e.target.name]: e.target.value,
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.age.trim() ||
      !formData.phone.trim()
    ) {
      alert("Please fill the all fields");
      return;
    }

    if (isEdit) {
      socket.emit("update-message", formData);
      setFormData({ name: "", age: "", phone: "" });
      setIsEdit(false);
      return;
    }
    socket.emit("send-message", formData);
    setFormData({ name: "", age: "", phone: "" });
  };

  //......................................................Edit Logic...............................

  const EditUser = (user) => {
    setIsEdit(true);
    setFormData(user);
  };

  //.......................................................Delete Logic...........................................

  const DeleteUser = (id) => {
    socket.emit("delete-message", id);
  };

  return (
    <div className="bg-black text-white w-screen h-screen flex justify-center items-center flex-col gap-10">
      {isConnected ? (
        <h2 className="text-green-500">Connected</h2>
      ) : (
        <h2 className="text-red-500">Not Connected</h2>
      )}
      <h2 className="text-3xl">Performing Crud Operation</h2>
      <form className=" flex flex-col gap-5 justify-center">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInput}
          placeholder="Enter Name"
          className="w-[400px] px-5 py-2 border border-white rounded-md"
        />
        <input
          type="text"
          name="age"
          value={formData.age}
          onChange={handleInput}
          placeholder="Enter Age"
          className="w-[400px] px-5 py-2 border border-white rounded-md"
        />
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleInput}
          placeholder="Enter Phone Number"
          className="w-[400px] px-5 py-2 border border-white rounded-md"
        />
        <button
          onClick={(e) => {
            handleSubmit(e);
          }}
          className="w-[100px] px-5 py-2 bg-blue-700 hover:bg-blue-900 rounded-md cursor-pointer"
        >
          {isEdit ? "Update" : "Send"}
        </button>
      </form>

      <div>
        {users.length > 0 && (
          <div className="w-[700px] border border-white text-white">
            <Table className="border border-white text-white">
              <TableHeader>
                <TableRow className="border-b border-white">
                  <TableHead className="w-[100px] border-r border-white">
                    Name
                  </TableHead>
                  <TableHead className="border-r border-white">Age</TableHead>
                  <TableHead className="border-r border-white">Phone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id} className="border-b border-white">
                    <TableCell className="font-medium border-r border-white">
                      {user.name}
                    </TableCell>
                    <TableCell className="border-r border-white">
                      {user.age}
                    </TableCell>
                    <TableCell className={"border-r border-white"}>
                      {user.phone}
                    </TableCell>
                    <TableCell className="w-[150px]">
                      <div className="flex justify-between gap-2">
                        <button
                          onClick={() => EditUser(user)}
                          className="bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded-md cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => DeleteUser(user.id)}
                          className="bg-red-500 hover:bg-red-700 px-3 py-1 rounded-md cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};
