import { screen, render, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { mockHttpError } from "#frontend/test/mocks/node";
import { createTestTRPCandQueryClients } from "#frontend/test/mocks/react-query";
import { createTestRouter } from "#frontend/test/mocks/react-router";

describe("Login", () => {
  let user: UserEvent;
  let router: ReturnType<typeof createTestRouter>;

  beforeEach(() => {
    user = userEvent.setup();
    router = createTestRouter({ initialEntries: ["/"] });
    render(createTestTRPCandQueryClients(router));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should redirect to a different page after submitting valid login input", async () => {
    const email = screen.getByPlaceholderText(/Email/i);
    const password = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Login/i });

    await user.type(email, "JohnDoe@gmail.com");
    await user.type(password, "password");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: /Login/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("should show errors if submitting invalid input", async () => {
    const email = screen.getByPlaceholderText(/Email/i);
    const submitButton = screen.getByRole("button", { name: /Login/i });
    expect(submitButton).toBeInTheDocument();

    await user.type(email, "JohnDoegmail.com");
    await user.click(submitButton);

    expect(screen.getByText(/Email address is invalid/i)).toBeInTheDocument();
  });

  it("should show error if fetch fails", async () => {
    mockHttpError(`${import.meta.env.VITE_API_URL}/auth.loginUser`, "post");

    const email = screen.getByPlaceholderText(/Email/i);
    const password = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Login/i });

    await user.type(email, "JohnDoe@gmail.com");
    await user.type(password, "password");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
    });
  });
});
