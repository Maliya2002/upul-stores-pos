import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface QuickStatItem {
  label: string;
  value: string;
}

interface QuickStatsBarProps {
  items: QuickStatItem[];
}

export function QuickStatsBar({ items }: QuickStatsBarProps) {
  return (
    <Card>
      <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {item.label}
            </p>
            <p className="text-lg font-bold">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}