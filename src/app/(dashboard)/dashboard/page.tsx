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
  TrendingUp,
  Star,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations/fade-in";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/stagger-container";
import { GradientCard } from "@/components/shared/gradient-card";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { SalesOverviewChart } from "@/components/charts";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

const chartData = [
  { name: "Mon", sales: 12000, orders: 22 },
  { name: "Tue", sales: 18000, orders: 31 },
  { name: "Wed", sales: 16000, orders: 27 },
  { name: "Thu", sales: 24000, orders: 40 },
  { name: "Fri", sales: 21000, orders: 35 },
  { name: "Sat", sales: 28000, orders: 48 },
  { name: "Sun", sales: 19000, orders: 30 },
];

const recentSales = [
  { id: 1, customer: "Kamal Perera", amount: 4500, items: 3, time: "2 min ago", avatar: "KP" },
  { id: 2, customer: "Nimal Silva", amount: 12800, items: 7, time: "15 min ago", avatar: "NS" },
  { id: 3, customer: "Sunil Fernando", amount: 2350, items: 2, time: "32 min ago", avatar: "SF" },
  { id: 4, customer: "Amal Jayawardena", amount: 8900, items: 5, time: "1 hr ago", avatar: "AJ" },
  { id: 5, customer: "Walk-in Customer", amount: 1500, items: 1, time: "2 hrs ago", avatar: "WC" },
];

const topProducts = [
  { name: "Milo 400g", sold: 145, revenue: 130500, trend: 12 },
  { name: "Anchor Milk 1L", sold: 120, revenue: 48000, trend: 8 },
  { name: "Sunlight Soap", sold: 98, revenue: 14700, trend: -3 },
  { name: "Red Rice 5kg", sold: 85, revenue: 63750, trend: 15 },
  { name: "Dettol 250ml", sold: 72, revenue: 43200, trend: 5 },
];

const lowStockItems = [
  { name: "Sugar 1kg", stock: 5, minimum: 20, urgency: "critical" },
  { name: "Tea 200g", stock: 3, minimum: 15, urgency: "critical" },
  { name: "Coconut Oil 500ml", stock: 8, minimum: 25, urgency: "warning" },
  { name: "Wheat Flour 1kg", stock: 2, minimum: 30, urgency: "critical" },
];

const quickActions = [
  {
    label: "New Sale",
    icon: ShoppingCart,
    gradient: "bg-linear-to-br from-blue-500 to-blue-600",
    shortcut: "F2",
    href: "/pos",
  },
  {
    label: "Add Product",
    icon: Package,
    gradient: "bg-linear-to-br from-emerald-500 to-emerald-600",
    shortcut: "",
    href: "/products/add",
  },
  {
    label: "Reports",
    icon: BarChart3,
    gradient: "bg-linear-to-br from-purple-500 to-purple-600",
    shortcut: "",
    href: "/reports",
  },
  {
    label: "Activity",
    icon: Activity,
    gradient: "bg-linear-to-br from-orange-500 to-orange-600",
    shortcut: "",
    href: "/notifications",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 via-blue-700 to-purple-700 p-8 text-white">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-400/20 blur-3xl" />

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-300" />
                <span className="text-sm font-medium text-blue-100">
                  Dashboard Overview
                </span>
              </div>
              <h1 className="text-3xl font-black mb-1">
                Welcome back, Upul! 👋
              </h1>
              <p className="text-blue-100 text-sm max-w-lg">
                Here&apos;s what&apos;s happening in your store today. You have{" "}
                <span className="font-bold text-white">48 orders</span> and{" "}
                <span className="font-bold text-white">4 low stock alerts</span>.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-wrap gap-6 mt-6"
            >
              {[
                { label: "Today Revenue", value: "Rs. 125,750" },
                { label: "Profit Margin", value: "23.5%" },
                { label: "Active Customers", value: "892" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white/10 backdrop-blur-sm px-5 py-3"
                >
                  <p className="text-xs text-blue-200">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </FadeIn>

      {/* Stats Cards */}
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <GradientCard
            title="Today's Sales"
            value={
              <AnimatedCounter
                value={125750}
                prefix="Rs. "
                decimals={0}
              />
            }
            subtitle="↑ 12.5% from yesterday"
            icon={DollarSign}
            gradient="bg-blue-500/10"
            iconColor="text-blue-500"
            delay={0}
          />
        </StaggerItem>

        <StaggerItem>
          <GradientCard
            title="Today's Orders"
            value={<AnimatedCounter value={48} />}
            subtitle="↑ 8.2% from yesterday"
            icon={ShoppingCart}
            gradient="bg-emerald-500/10"
            iconColor="text-emerald-500"
            delay={0.1}
          />
        </StaggerItem>

        <StaggerItem>
          <GradientCard
            title="Total Products"
            value={<AnimatedCounter value={1250} />}
            subtitle="8 new this week"
            icon={Package}
            gradient="bg-purple-500/10"
            iconColor="text-purple-500"
            delay={0.2}
          />
        </StaggerItem>

        <StaggerItem>
          <GradientCard
            title="Total Customers"
            value={<AnimatedCounter value={892} />}
            subtitle="↑ 5.7% growth"
            icon={Users}
            gradient="bg-orange-500/10"
            iconColor="text-orange-500"
            delay={0.3}
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Charts & Recent Sales */}
      <div className="grid gap-6 lg:grid-cols-7">
        <FadeIn delay={0.15} className="lg:col-span-4">
          <SalesOverviewChart data={chartData} />
        </FadeIn>

        <FadeIn delay={0.2} className="lg:col-span-3">
          <GlassCard className="h-full" hover={false}>
            <SectionHeader title="Recent Sales" />

            <div className="mt-5 space-y-4">
              {recentSales.map((sale, i) => (
                <motion.div
                  key={sale.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="group flex items-center gap-3 rounded-xl p-2 -mx-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-purple-500 text-xs font-bold text-white shadow-md">
                    {sale.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {sale.customer}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sale.items} items · {sale.time}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-emerald-500">
                    +{formatCurrency(sale.amount)}
                  </span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </FadeIn>
      </div>

      {/* Top Products & Low Stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FadeIn delay={0.25}>
          <GlassCard hover={false}>
            <SectionHeader
              title="Top Selling Products"
              action={
                <Badge variant="outline" className="text-xs">
                  This Week
                </Badge>
              }
            />

            <div className="mt-5 space-y-3">
              {topProducts.map((product, i) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.07 }}
                  className="flex items-center gap-4 rounded-xl p-3 -mx-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-xs font-black text-white shadow-md">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.sold} units sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {formatCurrency(product.revenue)}
                    </p>
                    <p
                      className={`text-xs font-medium flex items-center justify-end gap-0.5 ${
                        product.trend > 0
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      {product.trend > 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {Math.abs(product.trend)}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={0.3}>
          <GlassCard hover={false} className="border-orange-200/50 dark:border-orange-900/30">
            <SectionHeader
              title="Low Stock Alert"
              action={
                <Badge variant="destructive" className="text-xs animate-pulse">
                  {lowStockItems.length} items
                </Badge>
              }
            />

            <div className="mt-5 space-y-3">
              {lowStockItems.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + i * 0.07 }}
                  className="flex items-center gap-4 rounded-xl p-3 -mx-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="relative">
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        item.urgency === "critical"
                          ? "text-red-500"
                          : "text-amber-500"
                      }`}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${
                        item.urgency === "critical"
                          ? "bg-red-500"
                          : "bg-amber-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Min required: {item.minimum}
                    </p>
                  </div>
                  <Badge
                    variant={
                      item.urgency === "critical"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-xs font-bold"
                  >
                    {item.stock} left
                  </Badge>
                </motion.div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-5 text-xs"
            >
              View All Low Stock Items →
            </Button>
          </GlassCard>
        </FadeIn>
      </div>

      {/* Quick Actions */}
      <FadeIn delay={0.35}>
        <GlassCard hover={false}>
          <SectionHeader
            title="Quick Actions"
            description="Keyboard shortcuts for faster operations"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
            {quickActions.map((action, i) => (
              <motion.a
                key={action.label}
                href={action.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/50 bg-card p-6 text-center transition-all duration-300 hover:shadow-lg hover:border-primary/30 overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "radial-gradient(circle at center, rgba(59,130,246,0.06), transparent 70%)",
                  }}
                />
                <div
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl ${action.gradient} shadow-lg`}
                >
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-bold">{action.label}</span>
                {action.shortcut && (
                  <kbd className="text-[10px] bg-muted px-2 py-1 rounded-md border font-mono">
                    {action.shortcut}
                  </kbd>
                )}
              </motion.a>
            ))}
          </div>
        </GlassCard>
      </FadeIn>
    </div>
  );
}