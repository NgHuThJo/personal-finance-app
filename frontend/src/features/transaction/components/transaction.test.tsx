import { screen, render, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { Transaction } from "#frontend/features/transaction/components/transaction";
import { createTestTRPCandQueryClients } from "#frontend/test/mocks/react-query";

describe("transaction", () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it("should show data from API call", async () => {
    render(createTestTRPCandQueryClients(<Transaction />));

    expect(await screen.findByText("Loading...")).toBeInTheDocument();

    const category_1 = await screen.findByRole("cell", {
      name: /entertainment/i,
    });
    const category_2 = screen.getByRole("cell", {
      name: /bills/i,
    });
    const transactionAmount_1 = screen.getByText(/1000.00/i);
    const transactionAmount_2 = screen.getByText(/500.00/i);

    expect(category_1).toBeInTheDocument();
    expect(transactionAmount_1).toBeInTheDocument();
    expect(category_2).toBeInTheDocument();
    expect(transactionAmount_2).toBeInTheDocument();
  });

  it("should filter data with category 'bills'", async () => {
    render(createTestTRPCandQueryClients(<Transaction />));

    const category_1 = await screen.findByRole("cell", {
      name: /entertainment/i,
    });
    const category_2 = screen.getByRole("cell", {
      name: /bills/i,
    });
    const transactionAmount_1 = screen.getByText(/1,000.00/i);
    const transactionAmount_2 = screen.getByText(/500.00/i);

    expect(category_1).toBeInTheDocument();
    expect(transactionAmount_1).toBeInTheDocument();
    expect(category_2).toBeInTheDocument();
    expect(transactionAmount_2).toBeInTheDocument();

    const select = await screen.findByTestId("filter-select");

    await user.selectOptions(select, "BILLS");

    expect(category_1).not.toBeInTheDocument();
    expect(transactionAmount_1).not.toBeInTheDocument();
  });

  it("should sort data by name in ascending order", async () => {
    render(createTestTRPCandQueryClients(<Transaction />));

    const category_1 = await screen.findByRole("cell", {
      name: /entertainment/i,
    });
    const category_2 = screen.getByRole("cell", {
      name: /bills/i,
    });
    const transactionAmount_1 = screen.getByText(/1,000.00/i);
    const transactionAmount_2 = screen.getByText(/500.00/i);

    expect(category_1).toBeInTheDocument();
    expect(transactionAmount_1).toBeInTheDocument();
    expect(category_2).toBeInTheDocument();
    expect(transactionAmount_2).toBeInTheDocument();

    const select = await screen.findByTestId("sort-select");

    await user.selectOptions(select, "A to Z");

    screen.debug();
    expect(category_1.compareDocumentPosition(category_2)).toBe(2);
  });

  it("should search for a subset of transactions and test if search is case-insensitive", async () => {
    render(createTestTRPCandQueryClients(<Transaction />));

    const name_1 = await screen.findByRole("cell", {
      name: /john/i,
    });
    const name_2 = screen.getByRole("cell", {
      name: /jane/i,
    });

    const search = await screen.findByPlaceholderText(/search/i);

    await user.type(search, "john");

    expect(name_1).toBeInTheDocument();
    expect(name_2).not.toBeInTheDocument();
  });

  it("should fill out transaction form and submit", async () => {
    render(createTestTRPCandQueryClients(<Transaction />));

    const openModalButton = await screen.findByText(/\+ add new transaction/i);

    await user.click(openModalButton);

    const name = screen.getByLabelText(/transaction name/i);
    const category = screen.getByLabelText(/category/i);
    const amount = screen.getByLabelText(/amount/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await user.type(name, "test");
    await user.selectOptions(category, "Bills");
    await user.type(amount, "2000");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/test/i)).toBeInTheDocument();
    });
  });
});
