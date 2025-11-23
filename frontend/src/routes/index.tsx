import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useEffect, useRef, useState } from "react";
import styles from "./index.module.css";
import { Board } from "#frontend/features/board/components/board";
import { BoardPlaceholder } from "#frontend/features/board/components/placeholder";
import { Header } from "#frontend/features/header/components/header";
import { NotFound } from "#frontend/features/not-found/components/not-found";
import { ErrorBoundary } from "#frontend/shared/app/error-boundary";
import { Logger } from "#frontend/shared/app/logging";
import { useLocationStore } from "#frontend/shared/store/location";
import { UnitStoreProvider } from "#frontend/shared/store/unit";
import { getCurrentPosition } from "#frontend/shared/utils/geolocation";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);
  const setLocationData = useLocationStore((state) => state.setLocationData);
  const lastPositionsRef = useRef<{
    latitude: number;
    longitude: number;
  }>({
    latitude: Infinity,
    longitude: Infinity,
  });

  useEffect(() => {
    const geoLocationHandler = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      Logger.info(
        "Latitude and longitude in index route useEffect",
        latitude,
        longitude,
      );

      if (
        latitude !== lastPositionsRef.current.latitude ||
        longitude !== lastPositionsRef.current.longitude
      ) {
        setLocationData(latitude, longitude);
      }

      lastPositionsRef.current.latitude = latitude;
      lastPositionsRef.current.longitude = longitude;
    };

    const watchObject = getCurrentPosition(geoLocationHandler, undefined);

    return () => {
      watchObject.clearWatch();
    };
  }, [setLocationData]);

  const handleRetry = () => {
    setErrorBoundaryKey((prev) => prev + 1);
  };

  return (
    <main className={styles.layout}>
      <ErrorBoundary
        fallback={<NotFound retry={handleRetry} key={errorBoundaryKey} />}
      >
        <UnitStoreProvider>
          <Header />
          <Suspense fallback={<BoardPlaceholder />}>
            <Board />
          </Suspense>
        </UnitStoreProvider>
      </ErrorBoundary>
    </main>
  );
}
