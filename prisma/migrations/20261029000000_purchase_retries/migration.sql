ALTER TABLE "purchases" ADD COLUMN "requestKey" TEXT, ADD COLUMN "requestHash" TEXT;
CREATE UNIQUE INDEX "purchases_requestKey_key" ON "purchases"("requestKey");
