import { PropsWithChildren } from "react";
import { WebSocketContextProvider } from "./websocket-context";

export function Context({ children }: PropsWithChildren) {
  return <WebSocketContextProvider>{children}</WebSocketContextProvider>;
}
