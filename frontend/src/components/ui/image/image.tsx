import { ComponentPropsWithRef } from "react";
import styles from "./image.module.css";

type ImageProps = ComponentPropsWithRef<"img">;

export function Image({
  alt,
  className = "default",
  src,
  ...restProps
}: ImageProps) {
  return (
    <img alt={alt} className={styles[className]} src={src} {...restProps} />
  );
}
