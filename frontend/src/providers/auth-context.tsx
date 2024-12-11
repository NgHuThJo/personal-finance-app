import { createContext, PropsWithChildren, useContext, useState } from "react";
import { create, useStore, StoreApi } from "zustand";
import { persist } from "zustand/middleware";

type AuthStoreState = {
  userId: number;
  loginUser: (id: number) => void;
  logoutUser: () => void;
};

const AuthStoreContext = createContext<StoreApi<AuthStoreState> | null>(null);

export const useAuthStore = <T,>(selector: (state: AuthStoreState) => T) => {
  const store = useContext(AuthStoreContext);

  if (!store) {
    throw new Error("Missing AuthStoreProvider");
  }

  return useStore(store, selector);
};
export const useUserId = () => useAuthStore((state) => state.userId);

export function AuthStoreProvider({ children }: PropsWithChildren) {
  const [store] = useState(() =>
    create<AuthStoreState>()(
      persist(
        (set) => ({
          userId: (() => {
            const storedData = localStorage.getItem("user-id");

            if (storedData) {
              try {
                const parsedData = JSON.parse(storedData);

                return parsedData?.state?.userId || 0;
              } catch (error) {
                console.error("Error parsing localStorage:", error);
              }
            }

            return 0;
          })(),
          loginUser: (id: number) => set({ userId: id }),
          logoutUser: () => set({ userId: 0 }),
        }),
        {
          name: "user-id",
        },
      ),
    ),
  );

  return (
    <AuthStoreContext.Provider value={store}>
      {children}
    </AuthStoreContext.Provider>
  );
}
