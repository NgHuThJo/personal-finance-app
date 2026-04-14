import { useNavigate } from "@tanstack/react-router";
import { useDebouncedFunction } from "#frontend/shared/hooks/use-debounced-function";
import { Field } from "#frontend/shared/primitives/field";
import { Input } from "#frontend/shared/primitives/input";

export function TransactionSearchBar() {
  const navigate = useNavigate();

  const debounceSearch = useDebouncedFunction((search: string) => {
    navigate({
      from: "/transactions",
      to: ".",
      search: (prev) => ({
        ...prev,
        page: 1,
        searchQuery: search,
      }),
    });
  }, 1000);

  return (
    <Field variant="search">
      <Input
        type="text"
        placeholder="Search transactions..."
        onChange={(e) => debounceSearch(e.currentTarget.value)}
      />
    </Field>
  );
}
