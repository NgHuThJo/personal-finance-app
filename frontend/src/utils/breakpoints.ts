type Breakpoint = "xs" | "s" | "m" | "l" | "xl";

export function getBreakpoints() {
  const breakpoints: Record<Breakpoint, string> = {
    xs: "480px",
    s: "768px",
    m: "1024px",
    l: "1440px",
    xl: "1920px",
  };

  return breakpoints;
}
