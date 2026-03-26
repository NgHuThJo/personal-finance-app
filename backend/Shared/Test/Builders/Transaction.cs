using backend.Src.Models;

namespace backend.Shared.Test;

public static class TransactionBuilder
{
    public static TestState WithTransaction(
        this TestState state,
        Action<Transaction> configure
    )
    {
        if (state.UserList.Count < 2)
        {
            throw new InvalidOperationException(
                "Transaction cannot be created, less than 2 users"
            );
        }

        var transaction = TransactionFaker
            .TransactionFakerForTesting()
            .Generate();
        var random = new Random();
        var userListLength = state.UserList.Count;
        int senderId = random.Next(userListLength);
        int recipientId;

        do
        {
            recipientId = random.Next(userListLength);
        } while (senderId == recipientId);

        transaction.Sender = state.UserList[senderId];
        transaction.Recipient = state.UserList[recipientId];

        configure(transaction);

        state.Context.Add(transaction);

        return state;
    }

    public static TestState WithManyTransactions(
        this TestState state,
        Action<Transaction> configure,
        int count
    )
    {
        if (state.UserList.Count < 2)
        {
            throw new InvalidOperationException(
                "Transaction cannot be created, less than 2 users"
            );
        }
        List<Transaction> transactionList = [];

        for (int i = 0; i < count; i++)
        {
            var transaction = TransactionFaker
                .TransactionFakerForTesting()
                .Generate();
            var random = new Random();
            var userListLength = state.UserList.Count;
            int senderId = random.Next(userListLength);
            int recipientId;

            do
            {
                recipientId = random.Next(userListLength);
            } while (senderId == recipientId);

            transaction.Sender = state.UserList[senderId];
            transaction.Recipient = state.UserList[recipientId];

            configure(transaction);

            transactionList.Add(transaction);
        }

        state.Context.AddRange(transactionList);

        return state;
    }
}
