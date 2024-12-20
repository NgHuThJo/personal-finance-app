import { MemoryRouter } from "react-router-dom";
import { screen, render } from "@testing-library/react";
import { Budget } from "#frontend/features/budget/components/budget";
import { createTestTRPCandQueryClients } from "#frontend/test/mocks/react-query";

describe("Budget", () => {
  beforeEach(() => {
    render(
      createTestTRPCandQueryClients(
        <MemoryRouter>
          <Budget />
        </MemoryRouter>,
      ),
    );
  });

  it("should show summary with data from backend", async () => {
    const bills = await screen.findByText("Bills");
    const maxAmount = screen.getByText(/100.00/);
    const spentAmount = screen.getByText(/70.00/);

    expect(bills).toBeInTheDocument();
    expect(maxAmount).toBeInTheDocument();
    expect(spentAmount).toBeInTheDocument();
  });
});
