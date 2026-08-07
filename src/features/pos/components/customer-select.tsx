"use client";

import { User, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  loyaltyPoints: number;
}

interface CustomerSelectProps {
  customers: Customer[];
  selectedId: string | null;
  selectedName: string | null;
  onSelect: (id: string | null, name: string | null) => void;
}

export function CustomerSelect({
  customers,
  selectedId,
  selectedName,
  onSelect,
}: CustomerSelectProps) {
  if (selectedId && selectedName) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold">{selectedName}</p>
            <Badge variant="outline" className="text-[10px]">
              Customer
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onSelect(null, null)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <Select
      value="walk-in"
      onValueChange={(v) => {
        if (v === "walk-in") {
          onSelect(null, null);
          return;
        }
        const customer = customers.find((c) => c.id === v);
        if (customer) onSelect(customer.id, customer.name);
      }}
    >
      <SelectTrigger className="rounded-xl">
        <SelectValue placeholder="Walk-in Customer" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="walk-in">Walk-in Customer</SelectItem>
        {customers.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
            {c.phone && (
              <span className="text-muted-foreground ml-2">
                ({c.phone})
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}