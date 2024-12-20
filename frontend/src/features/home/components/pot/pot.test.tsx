import { MemoryRouter } from "react-router-dom";
import { screen, render } from "@testing-library/react";
import { Pot } from "#frontend/features/home/components/pot/pot";
import { createTestTRPCandQueryClients } from "#frontend/test/mocks/react-query";

describe("Pot", () => {
  beforeEach(() => {
    render(
      createTestTRPCandQueryClients(
        <MemoryRouter>
          <Pot />
        </MemoryRouter>,
      ),
    );
  });

  it("should show the total amount of pot money", async () => {
    expect(await screen.findByText(/Loading/i)).toBeInTheDocument();

    const totalMoney = await screen.findByText(/700.00/i);

    expect(totalMoney).toBeInTheDocument();
  });
});
