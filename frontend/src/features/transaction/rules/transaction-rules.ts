class TransactionRules {
  isUserSender(userId: number, senderId: number) {
    return userId === senderId;
  }
}

export const transactionRules = new TransactionRules();
