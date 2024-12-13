import { screen, render } from "@testing-library/react";
import { Balance } from "#frontend/features/home/components/balance/balance";
import { createTestTRPCandQueryClients } from "#frontend/test/mocks/react-query";

describe("Balance", () => {
  beforeEach(() => {
    render(createTestTRPCandQueryClients(<Balance />));
  });

  it("should fetch data and show it on screen", async () => {
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    const balance = await screen.findByText(/3.00/i);
    const income = screen.getByText(/10.00/i);
    const expense = screen.getByText(/7.00/i);

    expect(balance).toHaveTextContent(/3.00/i);
    expect(income).toHaveTextContent(/10.00/i);
    expect(expense).toHaveTextContent(/7.00/i);
  });
});
