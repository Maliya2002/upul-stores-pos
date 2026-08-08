"use client";

import { motion } from "framer-motion";
import { Flame, Minus, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DemandItem {
  name: string;
  category: string;
  totalSold: number;
}

interface DemandForecastProps {
  highDemand: DemandItem[];
  mediumDemand: DemandItem[];
  lowDemand: DemandItem[];
}

export function DemandForecast({
  highDemand,
  mediumDemand,
  lowDemand,
}: DemandForecastProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          Demand Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Section title="🔥 High Demand" items={highDemand} color="text-red-500" />
        <Section title="➡️ Medium Demand" items={mediumDemand} color="text-amber-500" />
        <Section title="⬇️ Low Demand" items={lowDemand} color="text-blue-500" />
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  items,
  color,
}: {
  title: string;
  items: DemandItem[];
  color: string;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className={`text-xs font-bold mb-2 ${color}`}>{title}</p>
      <div className="space-y-1.5">
        {items.slice(0, 4).map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center justify-between text-sm rounded-lg px-3 py-2 hover:bg-muted/40 transition-colors"
          >
            <div>
              <span className="font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                ({item.category})
              </span>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {item.totalSold} sold
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  );
}