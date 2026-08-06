"use client";

import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  BarChart3,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";

/* ── Mock Data ── */
const stats = [
  {
    title: "Today's Sales",
    value: 125750,
    change: 12.5,
    trend: "up" as const,
    icon: DollarSign,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    isCurrency: true,
  },
  {
    title: "Today's Orders",
    value: 48,
    change: 8.2,
    trend: "up" as const,
    icon: ShoppingCart,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    isCurrency: false,
  },
  {
    title: "Total Products",
    value: 1250,
    change: 2.4,
    trend: "up" as const,
    icon: Package,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
    isCurrency: false,
  },
  {
    title: "Total Customers",
    value: 892,
    change: 5.7,
    trend: "up" as const,
    icon: Users,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
    isCurrency: false,
  },
];

const recentSales = [
  { id: 1, customer: "Kamal Perera", amount: 4500, items: 3, time: "2 min ago" },
  { id: 2, customer: "Nimal Silva", amount: 12800, items: 7, time: "15 min ago" },
  { id: 3, customer: "Sunil Fernando", amount: 2350, items: 2, time: "32 min ago" },
  { id: 4, customer: "Amal Jayawardena", amount: 8900, items: 5, time: "1 hr ago" },
  { id: 5, customer: "Walk-in Customer", amount: 1500, items: 1, time: "2 hrs ago" },
];

const topProducts = [
  { name: "Milo 400g", sold: 145, revenue: 130500 },
  { name: "Anchor Milk 1L", sold: 120, revenue: 48000 },
  { name: "Sunlight Soap", sold: 98, revenue: 14700 },
  { name: "Red Rice 5kg", sold: 85, revenue: 63750 },
  { name: "Dettol 250ml", sold: 72, revenue: 43200 },
];

const lowStockItems = [
  { name: "Sugar 1kg", stock: 5, minimum: 20 },
  { name: "Tea 200g", stock: 3, minimum: 15 },
  { name: "Coconut Oil 500ml", stock: 8, minimum: 25 },
  { name: "Wheat Flour 1kg", stock: 2, minimum: 30 },
];

const quickActions = [
  { label: "New Sale", icon: ShoppingCart, color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20", shortcut: "F2" },
  { label: "Add Product", icon: Package, color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20", shortcut: "" },
  { label: "Reports", icon: BarChart3, color: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20", shortcut: "" },
  { label: "Activity", icon: Activity, color: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20", shortcut: "" },
];

/* ── Component ── */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Here&apos;s what&apos;s happening in your store today.
          </p>
        </div>
      </FadeIn>

      {/* Stats */}
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StaggerItem key={stat.title}>
            <Card className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">
                      {stat.isCurrency
                        ? formatCurrency(stat.value)
                        : formatNumber(stat.value)}
                    </p>
                  </div>
                  <div className={`rounded-xl p-2.5 ${stat.iconBg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {stat.trend === "up" ? (
                    <span className="flex items-center text-emerald-500 text-xs font-semibold">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      {stat.change}%
                    </span>
                  ) : (
                    <span className="flex items-center text-red-500 text-xs font-semibold">
                      <ArrowDownRight className="h-3.5 w-3.5" />
                      {stat.change}%
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    vs yesterday
                  </span>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Middle Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Chart Placeholder */}
        <FadeIn delay={0.15} className="lg:col-span-4">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">
                Sales Overview
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                This Week
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex h-70 items-center justify-center rounded-lg border border-dashed border-muted-foreground/20 bg-muted/20">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">Sales Chart</p>
                  <p className="text-xs opacity-70">
                    Coming in Phase 03
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Recent Sales */}
        <FadeIn delay={0.2} className="lg:col-span-3">
          <Card className="card-hover h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">
                Recent Sales
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7">
                View all
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSales.map((sale, i) => (
                  <motion.div
                    key={sale.id}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {sale.customer
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {sale.customer}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sale.items} items · {sale.time}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-500 shrink-0">
                      +{formatCurrency(sale.amount)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Products */}
        <FadeIn delay={0.25}>
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">
                Top Selling Products
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                This Week
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.map((product, i) => (
                  <motion.div
                    key={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.07 }}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.sold} units sold
                      </p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">
                      {formatCurrency(product.revenue)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Low Stock */}
        <FadeIn delay={0.3}>
          <Card className="card-hover border-orange-200 dark:border-orange-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Low Stock Alert
              </CardTitle>
              <Badge
                variant="destructive"
                className="text-xs"
              >
                {lowStockItems.length} items
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockItems.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 + i * 0.07 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        item.stock <= 3 ? "bg-red-500" : "bg-orange-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Min required: {item.minimum}
                      </p>
                    </div>
                    <Badge
                      variant={item.stock <= 3 ? "destructive" : "secondary"}
                      className="text-xs shrink-0"
                    >
                      {item.stock} left
                    </Badge>
                  </motion.div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 text-xs"
              >
                View All Low Stock Items
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Quick Actions */}
      <FadeIn delay={0.35}>
        <Card className="card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl p-4 transition-colors ${action.color}`}
                >
                  <action.icon className="h-6 w-6" />
                  <span className="text-xs font-semibold">{action.label}</span>
                  {action.shortcut && (
                    <kbd className="text-[10px] bg-background/50 px-1.5 py-0.5 rounded border border-current/20">
                      {action.shortcut}
                    </kbd>
                  )}
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}