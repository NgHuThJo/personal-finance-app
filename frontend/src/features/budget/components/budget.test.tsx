import { screen, render } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { Budget } from "#frontend/features/budget/components/budget";
import { createTestTRPCandQueryClients } from "#frontend/test/mocks/react-query";

describe("Budget", () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it("should show summary with data from backend", async () => {
    render(createTestTRPCandQueryClients(<Budget />));

    const bills = await screen.findByText(/bills/i);
    const maxAmount = screen.getByText(/100.00/);
    const spentAmount = screen.getByText(/70.00/);

    expect(bills).toBeInTheDocument();
    expect(maxAmount).toBeInTheDocument();
    expect(spentAmount).toBeInTheDocument();
  });

  it("should fill out dialog form and submit successfully", async () => {
    render(createTestTRPCandQueryClients(<Budget />));

    const dialogButton = await screen.findByText(/add new budget/i);

    await user.click(dialogButton);

    const category = screen.getByLabelText(/category/i);
    const maximumSpent = screen.getByLabelText(/maximum spent/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    await userEvent.selectOptions(category, "bills");
    await userEvent.type(maximumSpent, "200");
    await userEvent.click(submitButton);

    expect(screen.findByText(/budget added successfully/i)).toBeInTheDocument();
  });
});
