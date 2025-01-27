import { SelectHTMLAttributes } from "react";
import styles from "./select.module.css";

type SelectOption = {
  value: string;
  text: string;
};

type SelectProps = {
  options: SelectOption[];
  placeholder: string;
  name: string;
  className?: string;
  label?: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

export function Select({
  options,
  placeholder,
  name,
  label,
  className = "default",
  ...props
}: SelectProps) {
  return (
    <select
      defaultValue=""
      name={name}
      id={label}
      className={styles[className]}
      {...props}
    >
      <option value="" disabled={true}>
        {placeholder}
      </option>
      {options.map((option) => (
        <option value={option.value}>{option.text}</option>
      ))}
    </select>
  );
}
