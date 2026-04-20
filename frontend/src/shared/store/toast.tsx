import { createContext, use, useState, type PropsWithChildren } from "react";
import { create, useStore, type StoreApi } from "zustand";

type ToastStore = {
  toasts: {
    message: string;
    id: string;
  }[];
  addToast: (message: string) => void;
  removeToast: (toastId: string) => void;
};

const ToastStoreContext = createContext<StoreApi<ToastStore> | null>(null);

const useToastStore = <T,>(selector: (state: ToastStore) => T) => {
  const store = use(ToastStoreContext);

  if (!store) {
    throw Error("ToastStoreProvider is null");
  }

  return useStore(store, selector);
};

export const useToasts = () => useToastStore((state) => state.toasts);

export function ToastStoreProvider({ children }: PropsWithChildren) {
  const [store] = useState(() =>
    create<ToastStore>()((set) => ({
      toasts: [],
      addToast: (message: string) => {
        const id = crypto.randomUUID();

        set((prev) => ({
          toasts: [
            ...prev.toasts,
            {
              message,
              id,
            },
          ],
        }));

        setTimeout(() => {
          set((prev) => ({
            toasts: prev.toasts.filter((t) => t.id !== id),
          }));
        });
      },
      removeToast: (toastId: string) => {
        set((prev) => ({
          toasts: prev.toasts.filter((t) => t.id !== toastId),
        }));
      },
    })),
  );

  return <ToastStoreContext value={store}>{children}</ToastStoreContext>;
}
