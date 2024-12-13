import { screen, render } from "@testing-library/react";
import { Budget } from "#frontend/features/home/components/budget/budget";
import { createTestTRPCandQueryClients } from "#frontend/test/mocks/react-query";

describe("Budget", () => {
  beforeAll(() => {
    render(createTestTRPCandQueryClients(<Budget />));
  });

  it("should show data returned from the backend", async () => {
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    const maxBudget = await screen.findByText(/100/i);
    const spentMoney = screen.getByText(/70/i);

    expect(maxBudget).toBeInTheDocument();
    expect(spentMoney).toBeInTheDocument();
  });
});
