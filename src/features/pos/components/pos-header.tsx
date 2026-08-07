"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingBag,
  Pause,
  List,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "../store/cart-store";

interface POSHeaderProps {
  onHoldOrder: () => void;
  onShowHeld: () => void;
}

export function POSHeader({ onHoldOrder, onShowHeld }: POSHeaderProps) {
  const heldOrders = useCartStore((s) => s.heldOrders);
  const itemCount = useCartStore((s) => s.getItemCount());

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between gap-4 border-b bg-background px-4 py-3"
    >
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-purple-600">
            <ShoppingBag className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black leading-tight">POS</h1>
            <p className="text-[10px] text-muted-foreground">
              Point of Sale
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {itemCount} items in cart
        </Badge>

        <Button
          variant="outline"
          size="sm"
          onClick={onHoldOrder}
          className="text-xs"
        >
          <Pause className="mr-1.5 h-3.5 w-3.5" />
          Hold (F3)
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onShowHeld}
          className="text-xs relative"
        >
          <List className="mr-1.5 h-3.5 w-3.5" />
          Held Orders
          {heldOrders.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
              {heldOrders.length}
            </span>
          )}
        </Button>

        <div className="hidden md:flex items-center gap-1 text-[10px] text-muted-foreground border rounded-lg px-2 py-1">
          <Keyboard className="h-3 w-3" />
          F2 Sale · F3 Hold · F4 Pay
        </div>
      </div>
    </motion.header>
  );
}