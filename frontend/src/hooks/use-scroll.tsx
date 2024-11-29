import { useEffect, useState } from "react";

export function useScroll() {
  const [scrollPosition, setScrollPosition] = useState([
    window.scrollX,
    window.scrollY,
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition([window.scrollX, window.scrollY]);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return { scrollPosition, setScrollPosition };
}
