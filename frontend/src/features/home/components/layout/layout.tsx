import { PropsWithChildren } from "react";
import { Navigation } from "#frontend/components/ui/navigation/navigation";
import styles from "./layout.module.css";

export function HomeLayout({ children }: PropsWithChildren) {
  return (
    <div className={styles.container}>
      {/* <Navigation /> */}
      {children}
    </div>
  );
}
