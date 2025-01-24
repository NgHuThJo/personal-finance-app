import { ComponentPropsWithRef } from "react";
import styles from "./skeleton.module.css";

type LoadingSkeletonProps = ComponentPropsWithRef<"div">;

// 8 spans
export function LoadingSkeleton({ ...props }: LoadingSkeletonProps) {
  return (
    <div className={styles.container} {...props}>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}
