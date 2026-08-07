import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui-custom";
import {
  InvoiceView,
  RefundButton,
} from "@/features/sales/components";
import { getSaleById } from "@/features/sales/actions/sales-actions";

export default async function SaleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { id } = await params;
  const { print } = await searchParams;
  const sale = await getSaleById(id);

  if (!sale) notFound();

  const existingRefunds = sale.refunds.reduce(
    (sum, r) => sum + r.amount,
    0
  );

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
              />
            </>
          }
        />
      </div>

      <div className="max-w-3xl mx-auto" data-invoice-printable>
        <InvoiceView
          orderNumber={sale.orderNumber}
          createdAt={sale.createdAt}
          customerName={sale.customer?.name ?? null}
          cashierName={sale.cashier.name}
          items={sale.items.map(
            (item: (typeof sale.items)[number]) => ({
              name: item.name,
              sku: item.sku,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              tax: item.tax,
              total: item.total,
            })
          )}
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
    </div>
  );
}