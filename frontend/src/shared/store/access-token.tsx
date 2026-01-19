import { createContext, use, useState, type PropsWithChildren } from "react";
import { createStore, useStore } from "zustand";
import { type StoreApi } from "zustand";

type AccessTokenStore = {
  accessToken: string | null;
  setAcessToken: (newAccessToken: string) => void;
};

export const useAccessTokenStore = <T,>(
  selector: (state: AccessTokenStore) => T,
) => {
  const store = use(AccessTokenContext);

  if (store === null) {
    throw new Error("AccessTokenContext is not set");
  }

  return useStore(store, selector);
};

export const useAcceesToken = () => {
  useAccessTokenStore((state) => state.accessToken);
};

const AccessTokenContext = createContext<StoreApi<AccessTokenStore> | null>(
  null,
);

export function AccessTokenProvider({ children }: PropsWithChildren) {
  const [store] = useState(
    createStore<AccessTokenStore>((set) => ({
      accessToken: null,
      setAcessToken: (newAccessToken: string) =>
        set(() => ({
          accessToken: newAccessToken,
        })),
    })),
  );

  return <AccessTokenContext value={store}>{children}</AccessTokenContext>;
}
