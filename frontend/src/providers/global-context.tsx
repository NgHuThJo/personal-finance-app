import { PropsWithChildren } from "react";
import { AuthStoreProvider } from "#frontend/providers/auth-context";

export function GlobalContext({ children }: PropsWithChildren) {
  return <AuthStoreProvider>{children}</AuthStoreProvider>;
}
