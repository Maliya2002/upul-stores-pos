CREATE TABLE "cash_shifts" (
  "id" TEXT NOT NULL,
  "cashierId" TEXT NOT NULL,
  "activeCashierId" TEXT,
  "requestKey" TEXT NOT NULL,
  "openingCash" DOUBLE PRECISION NOT NULL,
  "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closedAt" TIMESTAMP(3),
  "countedCash" DOUBLE PRECISION,
  "expectedCash" DOUBLE PRECISION,
  "variance" DOUBLE PRECISION,
  "closeNote" TEXT,
  "revision" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "cash_shifts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "cash_shifts_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "cash_shifts_activeCashierId_key" ON "cash_shifts"("activeCashierId");
CREATE UNIQUE INDEX "cash_shifts_requestKey_key" ON "cash_shifts"("requestKey");
CREATE INDEX "cash_shifts_cashierId_openedAt_idx" ON "cash_shifts"("cashierId", "openedAt");
CREATE TABLE "cash_movements" (
  "id" TEXT NOT NULL,
  "shiftId" TEXT NOT NULL,
  "requestKey" TEXT NOT NULL,
  "direction" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cash_movements_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "cash_movements_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "cash_shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "cash_movements_requestKey_key" ON "cash_movements"("requestKey");
CREATE INDEX "cash_movements_shiftId_idx" ON "cash_movements"("shiftId");
ALTER TABLE "orders" ADD COLUMN "shiftId" TEXT;
ALTER TABLE "refunds" ADD COLUMN "shiftId" TEXT;
CREATE INDEX "orders_shiftId_idx" ON "orders"("shiftId");
CREATE INDEX "refunds_shiftId_idx" ON "refunds"("shiftId");
ALTER TABLE "orders" ADD CONSTRAINT "orders_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "cash_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "cash_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
