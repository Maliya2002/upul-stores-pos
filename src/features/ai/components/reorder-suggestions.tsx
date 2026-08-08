"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Suggestion {
  productName: string;
  currentStock: number;
  suggestedQty: number;
  urgency: "critical" | "high" | "medium";
  reason: string;
}

interface ReorderSuggestionsProps {
  suggestions: Suggestion[];
}

const urgencyColors = {
  critical: "bg-red-500/10 text-red-600 border-red-500/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

export function ReorderSuggestions({
  suggestions,
}: ReorderSuggestionsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-orange-500" />
          Smart Reorder Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            All products are well stocked! 🎉
          </p>
        ) : (
          <div className="space-y-3">
            {suggestions.slice(0, 8).map((item, i) => (
              <motion.div
                key={item.productName}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold">{item.productName}</p>
                      <Badge
                        variant="outline"
                        className={urgencyColors[item.urgency]}
                      >
                        {item.urgency}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.reason}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      Stock: {item.currentStock}
                    </p>
                    <p className="text-sm font-bold text-primary">
                      Order: {item.suggestedQty}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}