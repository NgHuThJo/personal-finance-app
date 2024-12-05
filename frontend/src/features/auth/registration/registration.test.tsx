import { screen, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTestTRPCandQueryClients } from "#frontend/test/mocks/react-query";
import { createTestRouter } from "#frontend/test/mocks/react-router";

describe("Registration", () => {
  test("should submit form without errors", async () => {
    const user = userEvent.setup();
    const router = createTestRouter({ initialEntries: ["/register"] });
    render(createTestTRPCandQueryClients(router));

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

    expect(
      screen.queryByText(/Name must have at least one character/i),
    ).not.toBeInTheDocument();
  });

  // test("should show errors when submitting invalid input", async () => {
  //   const user = userEvent.setup();
  //   const router = createTestRouter({ initialEntries: ["/register"] });
  //   render(createTestTRPCandQueryClients(router));

  //   const email = screen.getByPlaceholderText("Email");
  //   const submitButton = screen.getByText(/Create Account/i);

  //   await user.type(email, "JohnDoegmail.com");
  //   await user.click(submitButton);

  //   await waitFor(() => {
  //     expect(screen.getByText(/Email address is invalid/i)).toBeInTheDocument();
  //   });
  // });
});
