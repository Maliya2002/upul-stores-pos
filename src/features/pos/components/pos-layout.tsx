"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useCartStore } from "../store/cart-store";
import { useBarcodeScanner } from "../hooks/use-barcode-scanner";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { POSHeader } from "./pos-header";
import { ProductSearch } from "./product-search";
import { ProductGrid, type POSProduct } from "./product-grid";
import { CartPanel } from "./cart-panel";
import { PaymentModal } from "./payment-modal";
import { HeldOrders } from "./held-orders";

interface POSLayoutProps {
  products: POSProduct[];
  customers: {
    id: string;
    name: string;
    phone: string | null;
    loyaltyPoints: number;
  }[];
  cashierId: string;
}

export function POSLayout({
  products,
  customers,
  cashierId,
}: POSLayoutProps) {
  const [search, setSearch] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [heldOpen, setHeldOpen] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const holdOrder = useCartStore((s) => s.holdOrder);
  const items = useCartStore((s) => s.items);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search))
  );

  const handleAddToCart = useCallback(
    (product: POSProduct) => {
      if (product.quantity <= 0) {
        toast.error("Product is out of stock.");
        return;
      }

      addItem({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.sellingPrice,
        quantity: 1,
        discount: product.discount,
        tax: product.tax,
        maxStock: product.quantity,
      });

      toast.success(`${product.name} added to cart`);
    },
    [addItem]
  );

  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      const product = products.find(
        (p) => p.barcode === barcode || p.sku === barcode
      );

      if (product) {
        handleAddToCart(product);
      } else {
        toast.error(`Product not found: ${barcode}`);
      }
    },
    [products, handleAddToCart]
  );

  useBarcodeScanner({ onScan: handleBarcodeScan });

  useKeyboardShortcut([
    {
      key: "F3",
      callback: () => {
        if (items.length > 0) {
          holdOrder();
          toast.success("Order held!");
        }
      },
    },
    {
      key: "F4",
      callback: () => {
        if (items.length > 0) setPaymentOpen(true);
      },
    },
  ]);

  return (
    <div className="flex h-screen flex-col bg-background">
      <POSHeader
        onHoldOrder={() => {
          if (items.length > 0) {
            holdOrder();
            toast.success("Order held!");
          }
        }}
        onShowHeld={() => setHeldOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left — Products */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b">
            <ProductSearch value={search} onChange={setSearch} />
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <ProductGrid
              products={filteredProducts}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>

        {/* Right — Cart */}
        <div className="w-95 xl:w-105 shrink-0 hidden md:flex">
          <CartPanel
            customers={customers}
            onCheckout={() => setPaymentOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        cashierId={cashierId}
      />
      <HeldOrders open={heldOpen} onOpenChange={setHeldOpen} />
    </div>
  );
}