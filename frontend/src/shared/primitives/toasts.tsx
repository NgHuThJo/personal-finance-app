import styles from "./toasts.module.css";
import { useToasts } from "#frontend/shared/store/toast";

export function ToastContainer() {
  const toasts = useToasts();

  return (
    <ul>
      {toasts.map((toasts) => (
        <li className={styles["toast"]} key={toasts.id}>
          {toasts.message}
        </li>
      ))}
    </ul>
  );
}
