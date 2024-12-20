import { screen, render } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { Transaction } from "#frontend/features/transaction/components/transaction";
import { createTestTRPCandQueryClients } from "#frontend/test/mocks/react-query";
import { setScenario } from "#frontend/test/mocks/utils/scenario";

describe("Transaction", () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
    render(createTestTRPCandQueryClients(<Transaction />));
  });

  it("should show all transactions", async () => {
    const name = await screen.findByText("Jane Foe");
    const category = screen.getByText("Entertainment");
    const date = screen.getByText("1/1/2024");
    const amount = screen.getByText(/1000.00/i);

    expect(name).toBeInTheDocument();
    expect(category).toBeInTheDocument();
    expect(date).toBeInTheDocument();
    expect(amount).toBeInTheDocument();
  });

  it("should show message if data is empty", async () => {
    setScenario("noArrayData");
    const emptyDataMessage = await screen.findByText(/no transactions/i);

    expect(emptyDataMessage).toBeInTheDocument();
  });
});
