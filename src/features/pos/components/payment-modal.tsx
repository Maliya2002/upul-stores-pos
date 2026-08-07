"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote,
  CreditCard,
  Building,
  QrCode,
  Gift,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "../store/cart-store";
import { createOrderAction } from "../actions/pos-actions";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cashierId: string;
}

const paymentMethods = [
  { id: "CASH", label: "Cash", icon: Banknote, color: "bg-emerald-500" },
  { id: "CARD", label: "Card", icon: CreditCard, color: "bg-blue-500" },
  {
    id: "BANK_TRANSFER",
    label: "Bank",
    icon: Building,
    color: "bg-purple-500",
  },
  { id: "QR", label: "QR", icon: QrCode, color: "bg-cyan-500" },
  { id: "GIFT_CARD", label: "Gift", icon: Gift, color: "bg-pink-500" },
];

export function PaymentModal({
  open,
  onOpenChange,
  cashierId,
}: PaymentModalProps) {
  const [method, setMethod] = useState("CASH");
  const [paidAmount, setPaidAmount] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string;
    total: number;
    change: number;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const items = useCartStore((s) => s.items);
  const customerId = useCartStore((s) => s.customerId);
  const couponCode = useCartStore((s) => s.couponCode);
  const couponDiscount = useCartStore((s) => s.couponDiscount);
  const note = useCartStore((s) => s.note);
  const getGrandTotal = useCartStore((s) => s.getGrandTotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const total = getGrandTotal();
  const paid = parseFloat(paidAmount) || 0;
  const change = Math.max(0, paid - total);

  const quickAmounts = [
    Math.ceil(total / 100) * 100,
    Math.ceil(total / 500) * 500,
    Math.ceil(total / 1000) * 1000,
    5000,
    10000,
  ].filter((a, i, arr) => a >= total && arr.indexOf(a) === i);

  const handlePay = () => {
    if (method === "CASH" && paid < total) {
      toast.error("Insufficient amount.");
      return;
    }

    startTransition(async () => {
      const finalPaid = method === "CASH" ? paid : total;

      const result = await createOrderAction({
        items,
        customerId,
        cashierId,
        paymentMethod: method,
        paidAmount: finalPaid,
        couponCode,
        couponDiscount,
        note,
      });

      if (!result.success) {
        toast.error(result.error || "Payment failed.");
        return;
      }

      setIsSuccess(true);
      setOrderResult({
        orderNumber: result.orderNumber ?? "",
        total: result.total ?? total,
        change: result.changeAmount ?? 0,
      });

      clearCart();
    });
  };

  const handleClose = () => {
    setIsSuccess(false);
    setOrderResult(null);
    setPaidAmount("");
    setMethod("CASH");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {isSuccess && orderResult ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 mx-auto mb-6"
              >
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </motion.div>

              <h2 className="text-2xl font-black mb-1">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Order #{orderResult.orderNumber}
              </p>

              <div className="rounded-2xl border p-4 space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-bold">
                    {formatCurrency(orderResult.total)}
                  </span>
                </div>
                {orderResult.change > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Change</span>
                    <span className="font-bold">
                      {formatCurrency(orderResult.change)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                >
                  New Sale
                </Button>
                <Button className="flex-1" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="payment" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DialogHeader className="p-6 pb-4">
                <DialogTitle className="text-xl font-black">
                  Payment
                </DialogTitle>
              </DialogHeader>

              <div className="px-6 space-y-5 pb-6">
                {/* Total */}
                <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 text-center">
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Amount
                  </p>
                  <p className="text-4xl font-black text-primary">
                    {formatCurrency(total)}
                  </p>
                </div>

                {/* Methods */}
                <div>
                  <Label className="text-xs font-bold mb-2 block">
                    Payment Method
                  </Label>
                  <div className="grid grid-cols-5 gap-2">
                    {paymentMethods.map((pm) => (
                      <motion.button
                        key={pm.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMethod(pm.id)}
                        type="button"
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                          method === pm.id
                            ? "border-primary bg-primary/5 shadow-md"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${pm.color}`}
                        >
                          <pm.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-[10px] font-bold">
                          {pm.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Cash Amount */}
                {method === "CASH" && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-bold">
                        Amount Received
                      </Label>
                      <Input
                        type="number"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        placeholder="0.00"
                        className="h-12 text-lg font-bold rounded-xl mt-1"
                        autoFocus
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {quickAmounts.map((amt) => (
                        <Button
                          key={amt}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-lg text-xs"
                          onClick={() => setPaidAmount(String(amt))}
                        >
                          {formatCurrency(amt)}
                        </Button>
                      ))}
                    </div>

                    {paid > 0 && paid >= total && (
                      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                        <p className="text-xs text-emerald-600">Change</p>
                        <p className="text-xl font-black text-emerald-500">
                          {formatCurrency(change)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Pay Button */}
                <Button
                  onClick={handlePay}
                  disabled={
                    isPending || (method === "CASH" && paid < total)
                  }
                  className="w-full h-12 text-base font-bold rounded-xl shadow-lg"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Confirm Payment — ${formatCurrency(total)}`
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}