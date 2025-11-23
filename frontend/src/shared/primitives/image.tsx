import styles from "./image.module.css";

type ImageProps = React.ComponentProps<"img">;

export function Image({ src, alt = "", className, ...props }: ImageProps) {
  return (
    <img src={src} alt={alt} className={styles[className ?? ""]} {...props} />
  );
}
