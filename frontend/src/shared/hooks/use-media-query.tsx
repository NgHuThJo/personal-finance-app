import { useEffect, useState } from "react";

export function useMediaQuery(mediaQuery: string) {
  const [isMatch, setIsMatch] = useState(
    () => window.matchMedia(mediaQuery).matches,
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQuery);

    const eventListener = (event: MediaQueryListEvent) => {
      setIsMatch(event.matches);
    };

    mediaQueryList.addEventListener("change", eventListener);

    return () => {
      mediaQueryList.removeEventListener("change", eventListener);
    };
  }, [mediaQuery]);

  return { isMatch };
}
