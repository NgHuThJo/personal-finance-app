/*
  Warnings:

  - You are about to alter the column `income` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `expense` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "income" DROP DEFAULT,
ALTER COLUMN "income" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "expense" DROP DEFAULT,
ALTER COLUMN "expense" SET DATA TYPE DECIMAL(10,2);
