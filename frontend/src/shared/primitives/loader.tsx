import styles from "./loader.module.css";

export function Loader() {
  return (
    <div className={styles["page-loader"]}>
      <h1 className={styles["loading-text"]}></h1>
    </div>
  );
}
