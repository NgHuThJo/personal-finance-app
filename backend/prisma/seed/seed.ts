import { PrismaClient, Category } from "@prisma/client";
import { faker } from "@faker-js/faker";

// configuration
const prisma = new PrismaClient();
const maxUsers = 10;
const maxPots = 5;
const incomeOptions = {
  min: 2000,
  max: 10000,
  dec: 2,
};
const expenseOptions = {
  min: 1000,
  max: 2000,
  dec: 2,
};
const transactionAmount = {
  min: 10,
  max: 100,
  dec: 2,
};
const categories: Category[] = [
  "ENTERTAINMENT",
  "GROCERIES",
  "BILLS",
  "TRANSPORTATION",
  "GENERAL",
  "LIFESTYLE",
  "SHOPPING",
  "EDUCATION",
];

const createUser = () => {
  const sex = faker.person.sexType();
  const firstName = faker.person.firstName(sex);
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName }).toLowerCase();
  const password = faker.internet.password({ length: 8, memorable: true });

  return {
    firstName,
    lastName,
    email,
    password,
  };
};

const createAccount = () => {
  const income = faker.finance.amount(incomeOptions);
  const expense = faker.finance.amount(expenseOptions);

  return {
    income,
    expense,
  };
};

const createPot = () => {
  const name = faker.lorem.word();
  const totalAmount = faker.finance.amount({ min: 50, max: 200, dec: 2 });
  const savedAmount = "0.00";

  return {
    name,
    totalAmount,
    savedAmount,
  };
};

async function createSeedData() {
  const users = await Promise.all(
    Array.from({ length: maxUsers }, () =>
      prisma.user.create({
        data: {
          ...createUser(),
          balance: {
            create: {
              ...createAccount(),
            },
          },
        },
      }),
    ),
  );

  const potPromises = [];
  // iterate over all users and create pots
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < maxPots; j++) {
      potPromises.push(
        prisma.$transaction(async (tx) => {
          const pot = await tx.pot.create({
            data: {
              ...createPot(),
              user: {
                connect: {
                  id: users[i].id,
                },
              },
            },
          });

          await tx.account.update({
            where: {
              userId: users[i].id,
            },
            data: {
              income: {
                decrement: pot.totalAmount,
              },
            },
          });
        }),
      );
    }
  }

  for (let user of users) {
    const transactionPromises = users
      .filter((otherUser) => otherUser.id !== user.id)
      .map((recipient) =>
        prisma.$transaction(async (tx) => {
          const transaction = await tx.transaction.create({
            data: {
              sender: { connect: { id: user.id } },
              recipient: { connect: { id: recipient.id } },
              category:
                categories[Math.floor(Math.random() * categories.length)],
              transactionAmount: parseFloat(
                faker.finance.amount(transactionAmount),
              ),
            },
          });

          await tx.account.update({
            where: { id: user.id },
            data: { expense: { decrement: transaction.transactionAmount } },
          });

          await tx.account.update({
            where: { id: recipient.id },
            data: { income: { increment: transaction.transactionAmount } },
          });
        }),
      );

    await Promise.all(transactionPromises);
  }
}

createSeedData()
  .then(() => {
    console.log("Database seeded with data");
  })
  .catch((error) => {
    console.log(error);
  });
