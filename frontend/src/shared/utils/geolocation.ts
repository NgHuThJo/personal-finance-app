import { Logger } from "#frontend/shared/app/logging";

export function getCurrentPosition(
  successCallback: PositionCallback,
  errorCallback?: PositionErrorCallback,
  options?: PositionOptions,
) {
  navigator.geolocation.getCurrentPosition(
    successCallback,
    errorCallback ??
      ((error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED: {
            Logger.info("Permission denied:", error);
            break;
          }
          case error.POSITION_UNAVAILABLE: {
            Logger.info("Position unavailable:", error);
            break;
          }
          case error.TIMEOUT: {
            Logger.info("Request timed out:", error);
            break;
          }
        }
      }),
    options,
  );

  const watchId = navigator.geolocation.watchPosition(
    successCallback,
    (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED: {
          Logger.info("Permission denied:", error);
          break;
        }
        case error.POSITION_UNAVAILABLE: {
          Logger.info("Position unavailable:", error);
          break;
        }
        case error.TIMEOUT: {
          Logger.info("Request timed out:", error);
          break;
        }
      }
    },
    options,
  );

  return {
    clearWatch: () => {
      navigator.geolocation.clearWatch(watchId);
    },
  };
}
