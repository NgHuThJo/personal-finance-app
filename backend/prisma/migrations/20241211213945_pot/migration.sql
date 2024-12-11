-- CreateTable
CREATE TABLE "Pot" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "currentAmount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Pot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pot_userId_key" ON "Pot"("userId");

-- AddForeignKey
ALTER TABLE "Pot" ADD CONSTRAINT "Pot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
