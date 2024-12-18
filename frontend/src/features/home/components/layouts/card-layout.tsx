import { ComponentPropsWithoutRef } from "react";
import styles from "./card-layout.module.css";

export function CardLayout({
  children,
  className = "default",
}: ComponentPropsWithoutRef<"div">) {
  return <div className={styles[className]}>{children}</div>;
}
