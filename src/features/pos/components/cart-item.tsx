"use client";

import { motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { CartItem as CartItemType } from "../store/cart-store";

interface CartItemProps {
  item: CartItemType;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItemCard({
  item,
  onUpdateQty,
  onRemove,
}: CartItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 rounded-xl border p-3 hover:bg-muted/30 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(item.price)} × {item.quantity}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>

        <span className="w-8 text-center text-sm font-bold">
          {item.quantity}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
          disabled={item.quantity >= item.maxStock}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <p className="text-sm font-black w-20 text-right shrink-0">
        {formatCurrency(item.total)}
      </p>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10"
        onClick={() => onRemove(item.productId)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </motion.div>
  );
}