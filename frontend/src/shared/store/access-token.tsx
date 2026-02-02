import { createStore } from "zustand";

type AccessTokenStore = {
  accessToken: string | null;
  setAccessToken: (newAccessToken: string) => void;
  logout: () => void;
};

export const accessTokenStore = createStore<AccessTokenStore>((set) => ({
  accessToken: null,
  setAccessToken: (newAccessToken: string) =>
    set(() => ({
      accessToken: newAccessToken,
    })),
  logout: () =>
    set(() => ({
      accessToken: null,
    })),
}));

export const useAccessToken = () => accessTokenStore.getState().accessToken;
