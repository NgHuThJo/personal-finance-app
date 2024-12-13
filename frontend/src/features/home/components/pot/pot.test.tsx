import { screen, render } from "@testing-library/react";
import { Pot } from "#frontend/features/home/components/pot/pot";
import { createTestTRPCandQueryClients } from "#frontend/test/mocks/react-query";

describe("Pot", () => {
  beforeEach(() => {
    render(createTestTRPCandQueryClients(<Pot />));
  });

  it("should show the total amount of pot money", async () => {
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    const totalMoney = await screen.findByText(/130.00/i);

    expect(totalMoney).toHaveTextContent(/130.00/i);
  });
});
