import { MemoryRouter } from "react-router";
import { screen, render } from "@testing-library/react";
import { Transaction } from "#frontend/features/home/components/transaction/transaction";
import { createTestTRPCandQueryClients } from "#frontend/test/mocks/react-query";
import { mockHttpError, server } from "#frontend/test/mocks/node";
import { http, HttpResponse } from "msw";

describe("Transaction", () => {
  it("should show data returned from API call", async () => {
    render(
      createTestTRPCandQueryClients(
        <MemoryRouter>
          <Transaction />
        </MemoryRouter>,
      ),
    );
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    const senderName = await screen.findByText(/John Doe/i);
    const transactionAmount = screen.getByText(/1000.00/i);

    expect(senderName).toBeInTheDocument();
    expect(transactionAmount).toBeInTheDocument();
  });

  it("should show certain message if there are not transactions", async () => {
    server.use(
      http.get(
        `${import.meta.env.VITE_API_URL}/transaction.getAllTransactions`,
        () => {
          const mockResponse = {
            result: {
              data: [],
              error: null,
            },
          };

          return HttpResponse.json(mockResponse);
        },
      ),
    );
    render(
      createTestTRPCandQueryClients(
        <MemoryRouter>
          <Transaction />
        </MemoryRouter>,
      ),
    );

    const noDataMessage = await screen.findByText(/No transactions/i);
    expect(noDataMessage).toBeInTheDocument();
  });
});
