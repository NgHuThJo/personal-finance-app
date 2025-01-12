import { MemoryRouter } from "react-router";
import { screen, render } from "@testing-library/react";
import { createTestTRPCandQueryClients } from "#frontend/test/mocks/react-query";
import { Pot } from "#frontend/features/pot/components/pot";

describe("pot", () => {
  it("should show data from API call", async () => {
    render(
      createTestTRPCandQueryClients(
        <MemoryRouter>
          <Pot />
        </MemoryRouter>,
      ),
    );

    expect(await screen.findByText("Loading...")).toBeInTheDocument();

    const name = await screen.findByText(/bills/i);
    const totalAmount = screen.getByText(/1000.00/i);
    const savedAmount = screen.getByText(/300.00/i);

    expect(name).toBeInTheDocument();
    expect(totalAmount).toBeInTheDocument();
    expect(savedAmount).toBeInTheDocument();
  });
});
