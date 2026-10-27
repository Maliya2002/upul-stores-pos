-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "checkoutKey" TEXT,
ADD COLUMN     "requestHash" TEXT;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "netTotal" DOUBLE PRECISION,
ADD COLUMN     "unitCost" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "refunds" ADD COLUMN     "method" "PaymentMethod",
ADD COLUMN     "processedById" TEXT,
ADD COLUMN     "requestHash" TEXT,
ADD COLUMN     "requestKey" TEXT;

-- CreateTable
CREATE TABLE "refund_items" (
    "id" TEXT NOT NULL,
    "refundId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "restock" BOOLEAN NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "refund_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "refund_items_orderItemId_idx" ON "refund_items"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "refund_items_refundId_orderItemId_key" ON "refund_items"("refundId", "orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_checkoutKey_key" ON "orders"("checkoutKey");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_requestKey_key" ON "refunds"("requestKey");

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_items" ADD CONSTRAINT "refund_items_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "refunds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_items" ADD CONSTRAINT "refund_items_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
