"use client";

import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Tip {
  tip: string;
  type: "increase" | "reduce" | "action";
  impact: "high" | "medium" | "low";
}

interface ProfitTipsProps {
  tips: Tip[];
}

const typeIcons = {
  increase: TrendingUp,
  reduce: TrendingDown,
  action: Zap,
};

const impactColors = {
  high: "bg-red-500/10 text-red-600 border-red-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

export function ProfitTips({ tips }: ProfitTipsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          AI Profit Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tips.map((tip, i) => {
            const Icon = typeIcons[tip.type];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 rounded-xl border p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{tip.tip}</p>
                </div>
                <Badge variant="outline" className={impactColors[tip.impact]}>
                  {tip.impact}
                </Badge>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}