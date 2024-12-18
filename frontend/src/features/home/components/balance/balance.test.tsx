import { screen, render } from "@testing-library/react";
import { Balance } from "#frontend/features/home/components/balance/balance";
import { createTestTRPCandQueryClients } from "#frontend/test/mocks/react-query";

describe("Balance", () => {
  beforeEach(() => {
    render(createTestTRPCandQueryClients(<Balance />));
  });

  it("should fetch data and show it on screen", async () => {
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    const balance = await screen.findByText(/700.00/i);
    const income = screen.getByText(/1000.00/i);
    const expense = screen.getByText(/300.00/i);

    expect(balance).toBeInTheDocument();
    expect(income).toBeInTheDocument();
    expect(expense).toBeInTheDocument();
  });
});
