import { createStore, useStore } from "zustand";

type AccessTokenStore = {
  accessToken: string | null;
  setAccessToken: (newAccessToken: string | null) => void;
  logout: () => void;
};

export const accessTokenStore = createStore<AccessTokenStore>((set) => ({
  accessToken: null,
  setAccessToken: (newAccessToken) =>
    set(() => ({
      accessToken: newAccessToken,
    })),
  logout: () =>
    set(() => ({
      accessToken: null,
    })),
}));

export const useAccessToken = () =>
  useStore(accessTokenStore, (state) => state.accessToken);
