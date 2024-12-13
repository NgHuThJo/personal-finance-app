import { screen, render } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
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

  it("should log out user if they click the logout button", async () => {
    const logoutButton = await screen.findByRole("button", { name: /Logout/i });

    await user.click(logoutButton);

    expect(screen.queryByText(/Overview/i)).not.toBeInTheDocument();
  });
});
