"use client";

import { motion } from "framer-motion";
import { TrendingUp, Target, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

interface PredictionCardProps {
  predictedRevenue: number;
  predictedOrders: number;
  confidence: number;
}

export function PredictionCard({
  predictedRevenue,
  predictedOrders,
  confidence,
}: PredictionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-purple-200/50 dark:border-purple-900/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            Next Week Prediction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-purple-500/10 p-4 text-center">
              <BarChart3 className="h-5 w-5 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-purple-600">
                {formatCurrency(predictedRevenue)}
              </p>
              <p className="text-xs text-muted-foreground">
                Predicted Revenue
              </p>
            </div>
            <div className="rounded-xl bg-blue-500/10 p-4 text-center">
              <Target className="h-5 w-5 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-blue-600">
                {predictedOrders}
              </p>
              <p className="text-xs text-muted-foreground">
                Predicted Orders
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Prediction Confidence
              </span>
              <span className="font-bold text-purple-500">
                {confidence}%
              </span>
            </div>
            <Progress value={confidence} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}