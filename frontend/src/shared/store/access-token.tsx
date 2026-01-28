import { createStore } from "zustand";

type AccessTokenStore = {
  accessToken: string | null;
  setAcessToken: (newAccessToken: string) => void;
  logout: () => void;
};

export const accessTokenStore = createStore<AccessTokenStore>((set) => ({
  accessToken: null,
  setAcessToken: (newAccessToken: string) =>
    set(() => ({
      accessToken: newAccessToken,
    })),
  logout: () =>
    set(() => ({
      accessToken: null,
    })),
}));

export const useAccessToken = () => accessTokenStore.getState().accessToken;
