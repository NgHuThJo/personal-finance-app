import { ChangeEvent, InputHTMLAttributes } from "react";
import styles from "./search.module.css";

type SearchBarProps = InputHTMLAttributes<HTMLInputElement> & {
  filterFn: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function SearchBar({
  filterFn,
  className = "default",
  ...props
}: SearchBarProps) {
  return (
    <input
      type="text"
      className={styles[className]}
      onChange={(event) => filterFn(event)}
      {...props}
    />
  );
}
