"use client";

import { NotificationInterface } from "@/features/foundations/notification/data/NotificationInterface";
import { rehydrate } from "@/jsonApi/Rehydrator";
import { Modules } from "@/modules/modules";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

type Socket = ReturnType<typeof io>;

interface UseSocketOptions {
  token: string;
}

export function useSocket({ token }: UseSocketOptions) {
  const errorCount = useRef(0);
  const shouldConnect = useRef(true);
  const hookInstanceId = useRef(Math.random().toString(36).substring(2, 11));

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [socketNotifications, setSocketNotifications] = useState<NotificationInterface[]>([]);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const globalSocketKey = `__socket_${process.env.NEXT_PUBLIC_API_URL?.replace(/[^a-zA-Z0-9]/g, "_")}`;

    if (typeof window !== "undefined") {
      const allSocketKeys = Object.keys(window).filter((key) => key.startsWith("__socket_"));

      const existingSocket = (window as any)[globalSocketKey];
      if (existingSocket) {
        if (existingSocket.connected) {
          // CRITICAL: Clear existing listeners to prevent accumulation
          existingSocket.removeAllListeners();

          socketRef.current = existingSocket;
          setSocket(existingSocket);
          setIsConnected(existingSocket.connected);
        } else {
          existingSocket.disconnect();
          delete (window as any)[globalSocketKey];
        }
      }
    }

    let currentSocket: any;
    const isReusing = socketRef.current && socketRef.current.connected;

    if (isReusing) {
      currentSocket = socketRef.current;
    } else {
      // React StrictMode protection: Prevent double-mounting issues
      if (!shouldConnect.current) {
        return;
      }
      shouldConnect.current = false;

      try {
        currentSocket = io(process.env.NEXT_PUBLIC_API_URL as string, {
          auth: { token },
          transports: ["websocket"],
          timeout: 20000,
        });

        if (typeof window !== "undefined") {
          if (currentSocket.id && currentSocket.id !== "undefined") {
            (window as any)[globalSocketKey] = currentSocket;
          }
        }

        socketRef.current = currentSocket;
        setSocket(currentSocket);
      } catch (error) {
        return () => {}; // Return empty cleanup function on error
      }
    }

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleMessage = (data: any) => {
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages, data];
        return newMessages;
      });
    };

    const handleNotification = (data: any) => {
      const notification = rehydrate(Modules.Notification, data) as NotificationInterface;
      if (notification) {
        setSocketNotifications((prev) => {
          const newNotifications = [...prev, notification];
          return newNotifications;
        });
      }
    };

    // Attach event listeners
    if (currentSocket) {
      currentSocket.on("connect", handleConnect);
      currentSocket.on("disconnect", handleDisconnect);
      currentSocket.on("message", handleMessage);
      currentSocket.on("notification", handleNotification);
    }

    return () => {
      shouldConnect.current = true;

      // In development, preserve socket in window for HMR but remove listeners
      if (currentSocket) {
        if (process.env.NODE_ENV === "development") {
          currentSocket.off("connect", handleConnect);
          currentSocket.off("disconnect", handleDisconnect);
          currentSocket.off("message", handleMessage);
          currentSocket.off("notification", handleNotification);
        } else {
          currentSocket.off("connect", handleConnect);
          currentSocket.off("disconnect", handleDisconnect);
          currentSocket.off("message", handleMessage);
          currentSocket.off("notification", handleNotification);

          currentSocket.disconnect();

          if (typeof window !== "undefined") {
            delete (window as any)[globalSocketKey];
          }
        }
      }
    };
  }, [token]);

  const sendMessage = (event: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  const removeMessage = (index: number) => {
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages];
      newMessages.splice(index, 1);
      return newMessages;
    });
  };

  const removeSocketNotification = (index: number) => {
    setSocketNotifications((prevNotifications) => {
      const newNotifications = [...prevNotifications];
      newNotifications.splice(index, 1);
      return newNotifications;
    });
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const clearSocketNotifications = () => {
    setSocketNotifications([]);
  };

  return {
    socket,
    isConnected,
    messages,
    socketNotifications,
    sendMessage,
    removeMessage,
    removeSocketNotification,
    clearMessages,
    clearSocketNotifications,
  };
}
