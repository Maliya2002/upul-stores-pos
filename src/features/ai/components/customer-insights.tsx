"use client";

import { motion } from "framer-motion";
import { Users, UserCheck, UserX, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

interface CustomerInsightsProps {
  total: number;
  active: number;
  atRisk: number;
  lost: number;
  avgSpend: number;
  retentionRate: string;
  topSpenders: { name: string; totalSpent: number }[];
}

export function CustomerInsights({
  total,
  active,
  atRisk,
  lost,
  avgSpend,
  retentionRate,
  topSpenders,
}: CustomerInsightsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-500" />
          Customer Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-3 text-center">
            <UserCheck className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
            <p className="text-xl font-black text-emerald-600">{active}</p>
            <p className="text-[10px] text-muted-foreground">Active</p>
          </div>
          <div className="rounded-xl bg-amber-500/10 p-3 text-center">
            <AlertCircle className="h-4 w-4 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-black text-amber-600">{atRisk}</p>
            <p className="text-[10px] text-muted-foreground">At Risk</p>
          </div>
          <div className="rounded-xl bg-red-500/10 p-3 text-center">
            <UserX className="h-4 w-4 text-red-500 mx-auto mb-1" />
            <p className="text-xl font-black text-red-600">{lost}</p>
            <p className="text-[10px] text-muted-foreground">Lost</p>
          </div>
          <div className="rounded-xl bg-blue-500/10 p-3 text-center">
            <p className="text-xl font-black text-blue-600">
              {formatCurrency(avgSpend)}
            </p>
            <p className="text-[10px] text-muted-foreground">Avg Spend</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Retention Rate</span>
            <span className="font-bold text-emerald-500">{retentionRate}%</span>
          </div>
          <Progress value={parseFloat(retentionRate)} className="h-2" />
        </div>

        {topSpenders.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Top Spenders
            </p>
            {topSpenders.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium">{c.name}</span>
                <span className="font-bold">{formatCurrency(c.totalSpent)}</span>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}