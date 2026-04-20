import styles from "./skeleton.module.css";

type SkeletonProps = {
  width?: number;
  height?: number;
};

export function Skeleton({ width, height }: SkeletonProps) {
  return (
    <div
      className={styles.skeleton}
      style={{
        ...(width != undefined
          ? { "--width-skeleton": `${width?.toString()}px` }
          : {}),
        ...(height != undefined
          ? { "--height-skeleton": `${height?.toString()}px` }
          : {}),
      }}
    ></div>
  );
}
