/*
  Warnings:

  - Added the required column `name` to the `Pot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pot" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "category" "Category" NOT NULL;
