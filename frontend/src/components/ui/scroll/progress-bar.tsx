import { useScroll } from "#frontend/hooks/use-scroll";
import styles from "./progress-bar.module.css";

export function ScrollProgressBar() {
  const { scrollPosition } = useScroll();

  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;
  const currentProgress =
    scrollHeight > clientHeight
      ? (scrollPosition[1] / (scrollHeight - clientHeight)) * 100
      : 0;

  return (
    <div className={styles.container}>
      <div
        className={styles["progress-bar"]}
        style={{ width: `${currentProgress}%` }}
      ></div>
    </div>
  );
}
