import { PropsWithChildren } from "react";
import { Logo } from "#frontend/components/ui/icon/icon";
import styles from "./layout.module.css";
import { image_authentication } from "#frontend/assets/resources/images";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className={styles.container}>
      <div className={styles["logo-container"]}>
        <Logo />
      </div>
      {/* <img src={image_authentication} alt="" /> */}
      <div className={styles["form-container"]}>{children}</div>
    </main>
  );
}
