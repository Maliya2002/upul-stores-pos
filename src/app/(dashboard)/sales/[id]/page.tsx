import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui-custom";
import { InvoiceView, RefundButton } from "@/features/sales/components";
import { getSaleById } from "@/features/sales/actions/sales-actions";
import { getReceiptSettings } from "@/features/settings/actions/settings-actions";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function SaleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { id } = await params;
  const { print } = await searchParams;
  const [sale, receiptSettings] = await Promise.all([
    getSaleById(id),
    getReceiptSettings(),
  ]);

  if (!sale) notFound();

  const existingRefunds = sale.refunds.reduce((sum, r) => sum + r.amount, 0);

  const shouldAutoPrint = print === "1";

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader
          title={`Invoice #${sale.orderNumber}`}
          description="Sale details and invoice view"
          actions={
            <>
              <Link href="/sales">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>

              <RefundButton
                orderId={sale.id}
                orderTotal={sale.total}
                existingRefunds={existingRefunds}
                items={sale.items}
                hasLegacyRefund={sale.refunds.some(
                  (refund) => refund.items.length === 0,
                )}
                orderStatus={sale.orderStatus}
              />
            </>
          }
        />
      </div>

      <div className="max-w-3xl mx-auto" data-invoice-printable>
        <InvoiceView
          receiptSettings={receiptSettings}
          orderNumber={sale.orderNumber}
          createdAt={sale.createdAt}
          customerName={sale.customer?.name ?? null}
          cashierName={sale.cashier.name}
          items={sale.items.map((item: (typeof sale.items)[number]) => ({
            name: item.name,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            tax: item.tax,
            total: item.total,
          }))}
          subtotal={sale.subtotal}
          taxAmount={sale.taxAmount}
          discountAmount={sale.discountAmount}
          total={sale.total}
          paidAmount={sale.paidAmount}
          changeAmount={sale.changeAmount}
          paymentMethod={sale.paymentMethod}
          paymentStatus={sale.paymentStatus}
          orderStatus={sale.orderStatus}
          autoPrint={shouldAutoPrint}
        />
      </div>
      {sale.refunds.length > 0 && (
        <section className="max-w-3xl mx-auto rounded-xl border p-5 space-y-4">
          <h2 className="text-lg font-bold">Return history</h2>
          <p className="text-sm">
            Total refunded: {formatCurrency(existingRefunds)} · Net sale:{" "}
            {formatCurrency(sale.total - existingRefunds)}
          </p>
          {sale.refunds.map((refund) => (
            <article key={refund.id} className="border-t pt-3 space-y-1">
              <p className="font-semibold">
                {formatCurrency(refund.amount)} ·{" "}
                {refund.method ?? "Legacy refund"}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(refund.createdAt)} ·{" "}
                {refund.processedBy?.name ?? "Staff not recorded"}
              </p>
              <p className="text-sm">{refund.reason}</p>
              <ul className="text-sm space-y-1">
                {refund.items.map((item) => (
                  <li key={item.id}>
                    {item.orderItem.name} × {item.quantity} ·{" "}
                    {formatCurrency(item.amount)} ·{" "}
                    {item.restock ? "Returned to stock" : "Not restocked"}
                  </li>
                ))}
              </ul>
              {refund.items.length === 0 && (
                <p className="text-sm text-amber-600">
                  Older amount-only refund. Item quantities require
                  reconciliation.
                </p>
              )}
              <p className="text-xs text-muted-foreground break-all">
                Reference: {refund.id}
              </p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
