import { ChangeEvent, InputHTMLAttributes } from "react";

type SearchBarProps = InputHTMLAttributes<HTMLInputElement> & {
  filterFn: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function SearchBar({ filterFn, ...restProps }: SearchBarProps) {
  return (
    <input type="text" onChange={(event) => filterFn(event)} {...restProps} />
  );
}
