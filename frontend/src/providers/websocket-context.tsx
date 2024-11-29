import { createContext, PropsWithChildren, useMemo } from "react";
import { useContextWrapper } from "#frontend/utils/context";
import { useWebSocket } from "#frontend/hooks/use-websocket";

type WebSocketContextType = {
  isSocketReady: boolean;
} | null;

type WebSocketContextApiType = {
  connect: (userId: string) => void;
  disconnect: (userId: string) => void;
  emit: <T>(event: string, data: T) => void;
  subscribe: <T>(event: string, callback: (data: T) => void) => () => void;
} | null;

const WebSocketContext = createContext<WebSocketContextType>(null);
const WebSocketContextApi = createContext<WebSocketContextApiType>(null);

export const useWebSocketContext = () =>
  useContextWrapper(WebSocketContext, "WebSocketContext is null");
export const useWebSocketContextApi = () =>
  useContextWrapper(WebSocketContextApi, "WebSocketContextApi is null");

export function WebSocketContextProvider({ children }: PropsWithChildren) {
  const {
    isSocketReady,
    connect: connectWebSocket,
    disconnect: disconnectWebSocket,
    emit: emitWebSocketEvent,
    on,
    off,
  } = useWebSocket();

  const contextValue = useMemo(() => ({ isSocketReady }), [isSocketReady]);

  const api = useMemo(() => {
    const connect = (userId: string) => {
      connectWebSocket(userId);
    };
    const disconnect = (userId: string) => {
      disconnectWebSocket(userId);
    };
    const emit = <T,>(event: string, data: T) => {
      emitWebSocketEvent(event, data);
    };
    const subscribe = <T,>(event: string, callback: (data: T) => void) => {
      on(event, callback);

      return () => off(event, callback);
    };

    return { connect, disconnect, emit, subscribe };
  }, [connectWebSocket, disconnectWebSocket, emitWebSocketEvent, off, on]);

  return (
    <WebSocketContextApi.Provider value={api}>
      <WebSocketContext.Provider value={contextValue}>
        {children}
      </WebSocketContext.Provider>
    </WebSocketContextApi.Provider>
  );
}
