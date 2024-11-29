import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useWebSocket() {
  const [isSocketReady, setIsSocketReady] = useState(false);
  const socket = useRef<Socket | null>(null);

  const emit = useCallback(<T,>(event: string, data: T) => {
    socket.current?.emit(event, data);
  }, []);

  const on = useCallback(<T,>(event: string, callback: (data: T) => void) => {
    socket.current?.on(event, callback);
  }, []);

  const off = useCallback(<T,>(event: string, callback: (data: T) => void) => {
    socket.current?.off(event, callback);
  }, []);

  const cleanUpListeners = useCallback(() => {
    socket.current?.removeAllListeners();
  }, []);

  // Event Handlers
  const handleConnect = useCallback((userId: string) => {
    console.log("Connected to WebSocket server");
    socket.current?.emit("login", userId);
    setIsSocketReady(true);
  }, []);

  const handleDisconnect = useCallback(
    (reason: string) => {
      setIsSocketReady((prev) => {
        console.log("Disconnected from WebSocket server:", reason, prev);
        return !prev;
      });
      cleanUpListeners();
      socket.current = null;
    },
    [cleanUpListeners],
  );

  const handleReconnect = useCallback((attemptNumber: number) => {
    console.log(`Reconnected to WebSocket after ${attemptNumber} attempts`);
    setIsSocketReady(true);
  }, []);

  const handleConnectError = useCallback((error: Error) => {
    console.error("Connection error:", error.message);
  }, []);

  const handleLogin = useCallback((data: string) => {
    console.log("Login event received:", data);
  }, []);

  const handleLogout = useCallback((data: string) => {
    console.log("Logout event received:", data);
  }, []);

  // Core listeners for connection lifecycle and common events
  const attachCoreListeners = useCallback(
    (userId: string) => {
      if (!socket.current) {
        return;
      }

      socket.current?.on("connect", () => handleConnect(userId));
      socket.current?.on("disconnect", handleDisconnect);
      socket.current?.on("reconnect", handleReconnect);
      socket.current?.on("connect_error", handleConnectError);

      // Custom events
      socket.current?.on("login", handleLogin);
      socket.current?.on("logout", handleLogout);
    },
    [
      handleConnect,
      handleDisconnect,
      handleReconnect,
      handleConnectError,
      handleLogin,
      handleLogout,
    ],
  );

  // Manage the lifecycle of the socket and event listeners
  const connect = useCallback(
    (userId: string) => {
      if (socket.current) return;

      socket.current = io(import.meta.env.VITE_WEBSOCKET_URL, {
        reconnectionAttempts: 3,
      });

      // Attach core WebSocket event listeners
      attachCoreListeners(userId);
    },
    [attachCoreListeners],
  );

  const disconnect = useCallback((userId: string) => {
    if (!socket.current?.connected) return;

    // Emit logout and then disconnect
    socket.current.emit("logout", userId);
    socket.current.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [cleanUpListeners]);

  return { isSocketReady, connect, disconnect, emit, on, off };
}
