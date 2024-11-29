import styles from "./error.module.css";

type ErrorProps = {
  message: string;
};

export function FormError({ message }: ErrorProps) {
  return <p className={styles.error}>{message}</p>;
}
