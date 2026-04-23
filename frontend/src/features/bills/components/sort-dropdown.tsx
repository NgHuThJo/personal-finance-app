import { useNavigate } from "@tanstack/react-router";
import type { TransactionSortKey } from "#frontend/shared/client";
import { Button } from "#frontend/shared/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#frontend/shared/primitives/dropdown";
import type { KeyLabelOptions } from "#frontend/shared/types/miscellaneous";

type SortOptions = KeyLabelOptions<typeof _sortKeyMap>;

const _sortKeyMap = {
  AmountAsc: "Lowest",
  AmountDesc: "Highest",
  DateAsc: "Oldest",
  DateDesc: "Newest",
  NameAsc: "A to Z",
  NameDesc: "Z to A",
} as const;

const sortKeyArray: SortOptions[] = [
  {
    key: "AmountAsc",
    label: "Lowest",
  },
  {
    key: "AmountDesc",
    label: "Highest",
  },
  {
    key: "DateAsc",
    label: "Oldest",
  },
  {
    key: "DateDesc",
    label: "Newest",
  },
  {
    key: "NameAsc",
    label: "A to Z",
  },
  {
    key: "NameDesc",
    label: "Z to A",
  },
];

export function BillsSortDropdown() {
  const navigate = useNavigate();

  const handleSortChoice = (key: TransactionSortKey) => {
    return navigate({
      from: "/bills",
      to: ".",
      search: (prev) => ({
        ...prev,
        page: 1,
        sortKey: key,
      }),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Sort by</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {sortKeyArray.map(({ key, label }) => (
          <DropdownMenuItem onSelect={() => handleSortChoice(key)} key={key}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
