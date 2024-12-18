import { MemoryRouter } from "react-router-dom";
import { screen, render } from "@testing-library/react";
import { Budget } from "#frontend/features/home/components/budget/budget";
import { createTestTRPCandQueryClients } from "#frontend/test/mocks/react-query";
import { mockHttpError } from "#frontend/test/mocks/node";

describe("Budget", () => {
  it("should show data returned from the backend", async () => {
    render(
      createTestTRPCandQueryClients(
        <MemoryRouter>
          <Budget />
        </MemoryRouter>,
      ),
    );

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    const maxBudget = await screen.findByText(/120.00/i);
    const spentMoney = screen.getByText(/80.00/i);

    expect(maxBudget).toBeInTheDocument();
    expect(spentMoney).toBeInTheDocument();
  });

  it("should show error if server call fails", async () => {
    mockHttpError(
      `${import.meta.env.VITE_API_URL}/budget.getAllBudgets`,
      "get",
    );
    render(
      createTestTRPCandQueryClients(
        <MemoryRouter>
          <Budget />
        </MemoryRouter>,
      ),
    );

    const error = await screen.findByText(/Failed to fetch/i);

    expect(error).toBeInTheDocument();
  });
});
