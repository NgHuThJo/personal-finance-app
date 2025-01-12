import { Category } from "@prisma/client";
import { filterTransactions } from "#frontend/utils/sort/filter";

describe("filter transactions", () => {
  const data: { category: Category }[] = [
    {
      category: "BILLS",
    },
    {
      category: "ENTERTAINMENT",
    },
    {
      category: "GROCERIES",
    },
  ];

  it("should show all transactions", () => {
    const filteredData = filterTransactions(data, "ALL");

    expect(filteredData).toEqual(data);
  });

  it("should filter all transactions which are not of type 'bills'", () => {
    const filteredData = filterTransactions(data, "BILLS");

    expect(filteredData).toEqual([{ category: "BILLS" }]);
  });
});
