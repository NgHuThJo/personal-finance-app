import { screen, render, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { mockPostHttpError } from "#frontend/test/mocks/node";
import { createTestTRPCandQueryClients } from "#frontend/test/mocks/react-query";
import { createTestRouter } from "#frontend/test/mocks/react-router";

describe("Registration", () => {
  let user: UserEvent;
  let router: ReturnType<typeof createTestRouter>;

  beforeEach(() => {
    user = userEvent.setup();
    router = createTestRouter({ initialEntries: ["/register"] });
    render(createTestTRPCandQueryClients(router));
  });

  it("should submit form with success message", async () => {
    const firstName = screen.getByPlaceholderText("First Name");
    const lastName = screen.getByPlaceholderText("Last Name");
    const email = screen.getByPlaceholderText("Email");
    const password = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByText(/Create Account/i);

    await user.type(firstName, "John");
    await user.type(lastName, "Doe");
    await user.type(email, "JohnDoe@gmail.com");
    await user.type(password, "password");
    await user.click(submitButton);

    expect(screen.queryByText(/Registration successful/i)).toBeInTheDocument();
  });

  it("should show errors when submitting invalid input", async () => {
    const email = screen.getByPlaceholderText("Email");
    const submitButton = screen.getByText(/Create Account/i);

    await user.type(email, "JohnDoegmail.com");
    await user.click(submitButton);

    expect(screen.getByText(/Email address is invalid/i)).toBeInTheDocument();
  });

  it("should show error when fetch fails", async () => {
    mockPostHttpError(`${import.meta.env.VITE_API_URL}/user.registerUser`);

    const firstName = screen.getByPlaceholderText("First Name");
    const lastName = screen.getByPlaceholderText("Last Name");
    const email = screen.getByPlaceholderText("Email");
    const password = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByText(/Create Account/i);

    await user.type(firstName, "John");
    await user.type(lastName, "Doe");
    await user.type(email, "JohnDoe@gmail.com");
    await user.type(password, "password");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
    });
  });
});
