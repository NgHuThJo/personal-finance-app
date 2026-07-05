import styles from "./coldstart-message.module.css";

export function ColdStartMessage() {
  return (
    <div className={styles["page-loader"]}>
      <h1 className={styles["loading-title"]}>Starting the application</h1>
      <div>
        <p>This app is hosted on Microsoft Azure Cloud Platform.</p>
        <p>
          If the app hasn't been used recently, then the initial load may take
          up to 30 seconds while the server starts.
        </p>
        <p>Thank you for your patience.</p>
      </div>
    </div>
  );
}
