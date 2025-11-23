import { createContext, use, useState, type PropsWithChildren } from "react";
import { type StoreApi, create, useStore } from "zustand";

type UnitStoreProviderProps = PropsWithChildren;
type System = "metric" | "imperial";
type Units = {
  temperature: "°C" | "°F";
  wind_speed: "km/h" | "mp/h";
  precipitation: "mm" | "inch";
};
type ExtractMetric<U> = {
  [K in keyof U]: Extract<U[K], "°C" | "km/h" | "mm">;
};
type Metric = ExtractMetric<Units>;
type ExtractImperial<U> = {
  [K in keyof U]: Extract<U[K], "°F" | "mp/h" | "inch">;
};
type Imperial = ExtractImperial<Units>;

type UnitStore = {
  currentSystem: System;
  setCurrentSystem: (system: System) => void;
  currentUnits: Units;
  setCurrentUnits: (units: Partial<Units>) => void;
  setMetricUnits: () => void;
  setImperialUnits: () => void;
};

const metricUnits: Metric = {
  temperature: "°C",
  wind_speed: "km/h",
  precipitation: "mm",
};

const imperialUnits: Imperial = {
  temperature: "°F",
  wind_speed: "mp/h",
  precipitation: "inch",
};

const UnitContext = createContext<StoreApi<UnitStore> | null>(null);

export const useUnitStore = <T,>(selector: (state: UnitStore) => T) => {
  const store = use(UnitContext);

  if (!store) {
    throw new Error("Missing UnitProvider");
  }

  return useStore(store, selector);
};

export const useCurrentSystem = () =>
  useUnitStore((state) => state.currentSystem);
export const useCurrentUnits = () =>
  useUnitStore((state) => state.currentUnits);

export function UnitStoreProvider({ children }: UnitStoreProviderProps) {
  const [store] = useState(() =>
    create<UnitStore>()((set) => ({
      currentSystem: "metric",
      currentUnits: metricUnits,
      setCurrentSystem: (system) =>
        set(() => ({
          currentSystem: system,
        })),
      setCurrentUnits: (units) =>
        set(({ currentUnits }) => ({
          currentUnits: {
            ...currentUnits,
            ...units,
          },
        })),
      setMetricUnits: () =>
        set(() => ({
          currentUnits: metricUnits,
        })),
      setImperialUnits: () =>
        set(() => ({
          currentUnits: imperialUnits,
        })),
    })),
  );

  return <UnitContext value={store}>{children}</UnitContext>;
}
