import type { PropsWithChildren } from "react";
import styles from "./card.module.css";

export function BottomCardLayout({ children }: PropsWithChildren) {
  return <div className={styles.layout}>{children}</div>;
}
