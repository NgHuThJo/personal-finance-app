import { screen, render, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { mockGetHttpError } from "#frontend/test/mocks/node";
import { createTestTRPCandQueryClients } from "#frontend/test/mocks/react-query";
import { createTestRouter } from "#frontend/test/mocks/react-router";

describe("Home", () => {
  let user: UserEvent;
  let router: ReturnType<typeof createTestRouter>;

  beforeEach(() => {
    user = userEvent.setup();
    router = createTestRouter({ initialEntries: ["/app"] });
    render(createTestTRPCandQueryClients(router));
  });

  it("should fetch data and show it on screen", async () => {
    const balance = await screen.findByText(/3.00/i);
    const income = screen.getByText(/10.00/i);
    const expense = screen.getByText(/7.00/i);

    expect(balance).toHaveTextContent(/3.00/i);
    expect(income).toHaveTextContent(/10.00/i);
    expect(expense).toHaveTextContent(/7.00/i);
  });

  // it("should show default amount if fetch fails", async () => {
  //   mockGetHttpError(`${import.meta.env.VITE_API_URL}/account.getBalance`);

  //   const balance = await screen.findByText(/0.00/i);
  //   const income = screen.getByText(/0.00/i);
  //   const expense = screen.getByText(/0.00/i);

  //   expect(balance).toHaveTextContent(/0.00/i);
  //   expect(income).toHaveTextContent(/0.00/i);
  //   expect(expense).toHaveTextContent(/0.00/i);
  // });

  it("should log out user if they click the logout button", async () => {
    const logoutButton = await screen.findByRole("button", { name: /Logout/i });

    await user.click(logoutButton);

    expect(screen.queryByText(/Overview/i)).not.toBeInTheDocument();
  });
});
