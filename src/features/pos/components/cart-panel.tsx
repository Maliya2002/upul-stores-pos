"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { ShoppingCart, CreditCard, Trash2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "../store/cart-store";
import { CartItemCard } from "./cart-item";
import { CustomerSelect } from "./customer-select";
import { Input } from "@/components/ui/input";
import { applyCouponAction } from "../actions/pos-actions";

interface CartPanelProps {
  customers: {
    id: string;
    name: string;
    phone: string | null;
    loyaltyPoints: number;
  }[];
  onCheckout: () => void;
}

export function CartPanel({ customers, onCheckout }: CartPanelProps) {
  const items = useCartStore((s) => s.items);
  const customerId = useCartStore((s) => s.customerId);
  const customerName = useCartStore((s) => s.customerName);
  const couponCode = useCartStore((s) => s.couponCode);
  const setCoupon = useCartStore((s) => s.setCoupon);
  const clearCoupon = useCartStore((s) => s.clearCoupon);
  const [couponInput, setCouponInput] = useState("");
  const [couponPending, startCoupon] = useTransition();
  const setCustomer = useCartStore((s) => s.setCustomer);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getTaxTotal = useCartStore((s) => s.getTaxTotal);
  const getDiscountTotal = useCartStore((s) => s.getDiscountTotal);
  const getGrandTotal = useCartStore((s) => s.getGrandTotal);

  const subtotal = getSubtotal();
  const taxTotal = getTaxTotal();
  const discountTotal = getDiscountTotal();
  const grandTotal = getGrandTotal();

  return (
    <div className="flex h-full w-full min-h-0 flex-col border-l bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold">Cart</h2>
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            {items.length}
          </span>
        </div>

        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-destructive hover:bg-destructive/10"
            onClick={clearCart}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {/* Customer */}
      <div className="px-4 py-3 border-b">
        <CustomerSelect
          customers={customers}
          selectedId={customerId}
          selectedName={customerName}
          onSelect={setCustomer}
        />
      </div>

      {/* Items */}
      <ScrollArea className="flex-1 px-4 py-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Receipt className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Cart is empty</p>
            <p className="text-xs mt-1">Add products to start billing</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {items.map((item) => (
                <CartItemCard
                  key={item.productId}
                  item={item}
                  onUpdateQty={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      {/* Totals */}
      {items.length > 0 && (
        <div className="border-t px-4 py-4 space-y-3">
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const cartSnapshot = useCartStore.getState().items;
              startCoupon(async () => {
                const result = await applyCouponAction(couponInput, subtotal);
                if (useCartStore.getState().items !== cartSnapshot) {
                  toast.error("Cart changed. Apply the coupon again.");
                  return;
                }
                if (!result.success) {
                  toast.error(result.error);
                  return;
                }
                setCoupon(
                  couponInput.trim().toUpperCase(),
                  result.discount ?? 0,
                );
                toast.success(result.message);
              });
            }}
          >
            <Input
              aria-label="Coupon code"
              placeholder="Coupon code"
              value={couponInput}
              onChange={(event) => setCouponInput(event.target.value)}
            />
            <Button
              type="submit"
              variant="outline"
              disabled={couponPending || !couponInput.trim()}
            >
              Apply
            </Button>
          </form>
          {couponCode && (
            <div className="flex items-center justify-between text-sm">
              <span>Coupon: {couponCode}</span>
              <Button size="sm" variant="ghost" onClick={clearCoupon}>
                Remove
              </Button>
            </div>
          )}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(taxTotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-sm text-emerald-500">
                <span>Discount</span>
                <span>-{formatCurrency(discountTotal)}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-lg font-black">Total</span>
            <span className="text-2xl font-black text-primary">
              {formatCurrency(grandTotal)}
            </span>
          </div>

          <Button
            className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20"
            onClick={onCheckout}
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Pay {formatCurrency(grandTotal)} (F4)
          </Button>
        </div>
      )}
    </div>
  );
}
