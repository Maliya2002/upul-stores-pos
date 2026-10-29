ALTER TABLE "supplier_payments" ADD COLUMN "requestKey" TEXT, ADD COLUMN "requestHash" TEXT, ADD COLUMN "purchaseId" TEXT;
CREATE UNIQUE INDEX "supplier_payments_requestKey_key" ON "supplier_payments"("requestKey");
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
