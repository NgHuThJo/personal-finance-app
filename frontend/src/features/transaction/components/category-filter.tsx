import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { clientWithAuth } from "#frontend/shared/api/client";
import type { Category } from "#frontend/shared/client";
import { getAllCategoriesOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import { Button } from "#frontend/shared/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#frontend/shared/primitives/dropdown";

type CategoryFilter = Category | "All Transactions";

export function CategoryFilter() {
  const navigate = useNavigate();
  const { data: categoryData } = useSuspenseQuery({
    ...getAllCategoriesOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
  });

  const handleCategoryChoice = (category: CategoryFilter) => {
    return navigate({
      from: "/transactions",
      to: ".",
      search: (prev) => ({
        ...prev,
        page: 1,
        category: category === "All Transactions" ? undefined : category,
      }),
    });
  };
  const extendedCategories: CategoryFilter[] = [
    "All Transactions",
    ...categoryData,
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Filter by category</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {extendedCategories.map((category) => (
          <DropdownMenuItem
            onSelect={() => handleCategoryChoice(category)}
            key={category}
          >
            {category}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
