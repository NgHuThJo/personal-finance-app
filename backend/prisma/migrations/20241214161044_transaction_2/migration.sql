/*
  Warnings:

  - Added the required column `transactionAmount` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "transactionAmount" DECIMAL(10,2) NOT NULL;
