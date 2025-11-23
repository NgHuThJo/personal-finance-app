import { createContext, use, useState, type PropsWithChildren } from "react";
import { create, useStore, type StoreApi } from "zustand";

type LocationStoreProviderProps = {
  latitude: number;
  longitude: number;
} & PropsWithChildren;

type LocationStore = {
  locationData: {
    latitude: number;
    longitude: number;
  };
  setLocationData: (latitude: number, longitude: number) => void;
};

const LocationStoreContext = createContext<StoreApi<LocationStore> | null>(
  null,
);

export const useLocationStore = <T,>(selector: (state: LocationStore) => T) => {
  const store = use(LocationStoreContext);

  if (!store) {
    throw Error("LocationStoreProvider is null");
  }

  return useStore(store, selector);
};

export const useLocationData = () =>
  useLocationStore((state) => state.locationData);

export function LocationStoreProvider({
  latitude,
  longitude,
  children,
}: LocationStoreProviderProps) {
  const [store] = useState(() =>
    create<LocationStore>()((set) => ({
      locationData: {
        latitude,
        longitude,
      },
      setLocationData: (latitude, longitude) =>
        set(() => ({
          locationData: {
            latitude,
            longitude,
          },
        })),
    })),
  );

  return <LocationStoreContext value={store}>{children}</LocationStoreContext>;
}
