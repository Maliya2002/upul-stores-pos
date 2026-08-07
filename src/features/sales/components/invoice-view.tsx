"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Printer, Download, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui-custom";
import { siteConfig } from "@/config/site";

interface InvoiceItem {
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

interface InvoiceViewProps {
  orderNumber: string;
  createdAt: Date;
  customerName: string | null;
  cashierName: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  autoPrint?: boolean;
}

export function InvoiceView({
  orderNumber,
  createdAt,
  customerName,
  cashierName,
  items,
  subtotal,
  taxAmount,
  discountAmount,
  total,
  paidAmount,
  changeAmount,
  paymentMethod,
  paymentStatus,
  orderStatus,
  autoPrint = false,
}: InvoiceViewProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const hasPrinted = useRef(false);

  useEffect(() => {
    if (autoPrint && !hasPrinted.current) {
      hasPrinted.current = true;
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [autoPrint]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Print Buttons — Hidden when printing */}
      <div className="flex gap-3 mb-4 print:hidden">
        <Button onClick={handlePrint} className="flex-1">
          <Printer className="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
      </div>

      {/* Invoice Card */}
      <Card className="overflow-hidden print:shadow-none print:border-0" ref={invoiceRef}>
        {/* ─── Invoice Header ─── */}
        <div className="bg-linear-to-br from-blue-600 via-indigo-700 to-purple-800 p-8 text-white print:bg-white print:text-black print:p-6 print:border-b-2 print:border-black">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 print:bg-gray-100 print:border">
                <ShoppingBag className="h-7 w-7 text-white print:text-black" />
              </div>
              <div>
                <h2 className="text-2xl font-black">{siteConfig.name}</h2>
                <p className="text-blue-100 text-xs print:text-gray-500">
                  {siteConfig.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-black tracking-wider">INVOICE</h3>
              <p className="text-blue-100 print:text-gray-500 text-sm font-mono mt-1">
                #{orderNumber}
              </p>
            </div>
          </div>

          <div className="mt-6 text-xs text-blue-100 print:text-gray-500">
            <p>{siteConfig.contact.address}</p>
            <p>
              Tel: {siteConfig.contact.phone} · Email:{" "}
              {siteConfig.contact.email}
            </p>
          </div>
        </div>

        <CardContent className="p-6 print:p-4">
          {/* ─── Invoice Meta ─── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-xl bg-muted/30 print:bg-gray-50 print:rounded-none print:border">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Invoice Date
              </p>
              <p className="text-sm font-bold mt-0.5">
                {formatDateTime(createdAt)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Customer
              </p>
              <p className="text-sm font-bold mt-0.5">
                {customerName ?? "Walk-in Customer"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Cashier
              </p>
              <p className="text-sm font-bold mt-0.5">{cashierName}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Payment
              </p>
              <p className="text-sm font-bold mt-0.5">{paymentMethod}</p>
            </div>
          </div>

          {/* Status — Screen only */}
          <div className="flex gap-2 mb-4 print:hidden">
            <StatusBadge status={orderStatus} />
            <StatusBadge status={paymentStatus} />
          </div>

          {/* ─── Items Table ─── */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-foreground/10 print:border-black/20">
                  <th className="pb-3 text-left font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    #
                  </th>
                  <th className="pb-3 text-left font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Item
                  </th>
                  <th className="pb-3 text-center font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Qty
                  </th>
                  <th className="pb-3 text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Unit Price
                  </th>
                  <th className="pb-3 text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Disc %
                  </th>
                  <th className="pb-3 text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-3 text-muted-foreground">{i + 1}</td>
                    <td className="py-3">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {item.sku}
                      </p>
                    </td>
                    <td className="py-3 text-center font-medium">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 text-right">
                      {item.discount > 0 ? `${item.discount}%` : "-"}
                    </td>
                    <td className="py-3 text-right font-bold">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ─── Totals ─── */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              {taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">
                    {formatCurrency(taxAmount)}
                  </span>
                </div>
              )}

              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span className="font-medium">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}

              <Separator className="print:border-black/20" />

              <div className="flex justify-between text-xl font-black py-1">
                <span>TOTAL</span>
                <span className="text-primary print:text-black">
                  {formatCurrency(total)}
                </span>
              </div>

              <Separator className="print:border-black/20" />

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-bold">
                  {formatCurrency(paidAmount)}
                </span>
              </div>

              {changeAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600 font-medium">Change</span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(changeAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ─── Footer ─── */}
          <Separator className="my-6 print:border-black/10" />

          <div className="text-center space-y-2">
            <p className="text-sm font-bold">
              Thank you for shopping at {siteConfig.name}! 🎉
            </p>
            <p className="text-xs text-muted-foreground">
              {siteConfig.contact.address}
            </p>
            <p className="text-xs text-muted-foreground">
              Tel: {siteConfig.contact.phone} · {siteConfig.contact.email}
            </p>
            <p className="text-[10px] text-muted-foreground mt-3 print:mt-4">
              This is a computer generated invoice. No signature required.
            </p>
            <p className="text-[10px] text-muted-foreground">
              Powered by {siteConfig.name} Smart POS v{siteConfig.version}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ─── Print Styles ─── */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          [data-invoice-printable],
          [data-invoice-printable] * {
            visibility: visible;
          }

          .print\\:hidden {
            display: none !important;
          }

          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </motion.div>
  );
}