import styles from "./placeholder.module.css";
import { icon_dropdown } from "#frontend/assets/images";
import { Image } from "#frontend/shared/primitives/image";

const currentLabels = ["Feels Like", "Humidity", "Wind", "Precipitation"];

export function BoardPlaceholder() {
  return (
    <div className={styles.layout}>
      <div className={styles.current}>
        <div className={styles["current-top"]}>
          <p>Loading</p>
        </div>
        <ul className={styles["current-bottom"]}>
          {currentLabels.map((label, index) => (
            <li key={index}>
              <h3>{label}</h3>
              <span>-</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.daily}>
        <h2>Daily forecast</h2>
        <ul>
          {[...Array(8)].map((_, index) => (
            <li key={index}></li>
          ))}
        </ul>
      </div>
      <div className={styles.hourly}>
        <div className={styles["hourly-top"]}>
          <h2>Hourly forecast</h2>
          <div className={styles["dropdown-box"]}>
            <span>-</span>
            <Image src={icon_dropdown}></Image>
          </div>
        </div>
        <ul className={styles["hourly-bottom"]}>
          {[...Array(8)].map((_, index) => (
            <li className={styles["list-item"]} key={index}></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
