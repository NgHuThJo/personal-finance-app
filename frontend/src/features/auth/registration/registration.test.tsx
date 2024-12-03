import { screen } from "@testing-library/react";
import { vi } from "vitest";
import { Registration } from "#frontend/features/auth/registration/registration";
import { renderWithQueryClient } from "#frontend/test/mocks/react-query";

vi.mock("#frontend/test/mocks/react-query");

test("renders Registration with mocked tRPC", () => {
  renderWithQueryClient(<Registration />);

  expect(screen.getByText(/welcome/i)).toBeInTheDocument();
});
