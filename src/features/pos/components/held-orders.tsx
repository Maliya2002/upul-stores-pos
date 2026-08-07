"use client";

import { motion } from "framer-motion";
import { Clock, Play, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "../store/cart-store";

interface HeldOrdersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HeldOrders({ open, onOpenChange }: HeldOrdersProps) {
  const heldOrders = useCartStore((s) => s.heldOrders);
  const resumeOrder = useCartStore((s) => s.resumeOrder);
  const removeHeldOrder = useCartStore((s) => s.removeHeldOrder);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-black flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Held Orders ({heldOrders.length})
          </DialogTitle>
        </DialogHeader>

        {heldOrders.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No held orders</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {heldOrders.map((order, i) => {
              const total = order.items.reduce(
                (sum, item) => sum + item.total,
                0
              );

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">
                        {order.customerName ?? "Walk-in Customer"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} items ·{" "}
                        {new Date(order.heldAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge className="font-bold">
                      {formatCurrency(total)}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => {
                        resumeOrder(order.id);
                        onOpenChange(false);
                      }}
                    >
                      <Play className="mr-1 h-3 w-3" />
                      Resume
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs"
                      onClick={() => removeHeldOrder(order.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}