import { MemoryRouter } from "react-router";
import { screen, render } from "@testing-library/react";
import { createTestTRPCandQueryClients } from "#frontend/test/mocks/react-query";
import { Pot } from "#frontend/features/pot/components/pot";

describe("Pot", () => {
  it("should show summary with data from backend", async () => {
    render(
      createTestTRPCandQueryClients(
        <MemoryRouter>
          <Pot />
        </MemoryRouter>,
      ),
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    const savedAmount = await screen.findByText(/300.00/);
    const category = screen.getByText(/bills/i);
    const target = screen.getByText(/1000.00/);

    expect(savedAmount).toBeInTheDocument();
    expect(target).toBeInTheDocument();
    expect(category).toBeInTheDocument();
  });
});
