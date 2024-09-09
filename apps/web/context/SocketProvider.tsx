"use client";

import React, { useState, useCallback, useContext, useEffect } from "react";
import { io, Socket } from "socket.io-client";

// Interfaces
interface SocketContextProps {
  children?: React.ReactNode;
}

interface ISocketContext {
  sendMessage: (msg: string) => any;
  messages: string[];
}

// Create the context
const SocketContext = React.createContext<ISocketContext | null>(null);

// Hook to use the context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("Socket context is undefined.");
  return context;
};

// Socket Provider Component
export const SocketProvider: React.FC<SocketContextProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  // Send message function
  const sendMessage: ISocketContext["sendMessage"] = useCallback(
    (msg) => {
      console.log("Message sent:", msg);
      if (socket) {
        socket.emit("event:message", { message: msg }); // Use the correct structure
      }
    },
    [socket]
  );

  // Message received handler
  const onMessageRec = useCallback((msg: { message: string }) => {
    console.log("For server Message Record:", msg.message);
    setMessages((prev) => [...prev, msg.message]);
  }, []);

  // Set up the socket connection
  useEffect(() => {
    const _socket = io("http://localhost:8000"); // Server URL
    _socket.on("event:message", onMessageRec); // Listen for the same event name
    setSocket(_socket);

    return () => {
      _socket.off("event:message", onMessageRec); // Cleanup the listener
      _socket.disconnect();
    };
  }, [onMessageRec]);

  return (
    <SocketContext.Provider value={{ sendMessage, messages }}>
      {children}
    </SocketContext.Provider>
  );
};
