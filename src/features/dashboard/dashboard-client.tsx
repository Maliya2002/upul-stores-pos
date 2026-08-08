"use client";

import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Activity,
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
import { StatusBadge, CurrencyDisplay } from "@/components/ui-custom";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

interface DashboardData {
  todayRevenue: number;
  todayOrders: number;
  weekRevenue: number;
  monthRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
  topProducts: { name: string; sold: number; revenue: number }[];
  lowStockItems: { name: string; stock: number; minimum: number }[];
  monthlySales: { name: string; sales: number; orders: number }[];
}

interface DashboardClientProps {
  data: DashboardData;
  userName: string;
}

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
    icon: Activity,
    gradient: "bg-linear-to-br from-purple-500 to-purple-600",
    shortcut: "",
    href: "/reports",
  },
  {
    label: "AI Insights",
    icon: Zap,
    gradient: "bg-linear-to-br from-orange-500 to-orange-600",
    shortcut: "",
    href: "/ai-insights",
  },
];

export function DashboardClient({ data, userName }: DashboardClientProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 via-blue-700 to-purple-700 p-8 text-white">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-400/20 blur-3xl" />

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-300" />
                <span className="text-sm font-medium text-blue-100">
                  Dashboard Overview
                </span>
              </div>
              <h1 className="text-3xl font-black mb-1">
                Welcome back, {userName}! 👋
              </h1>
              <p className="text-blue-100 text-sm max-w-lg">
                You have{" "}
                <span className="font-bold text-white">
                  {data.todayOrders} orders
                </span>{" "}
                today and{" "}
                <span className="font-bold text-white">
                  {data.lowStockItems.length} low stock alerts
                </span>
                .
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-6 mt-6"
            >
              {[
                {
                  label: "Today Revenue",
                  value: formatCurrency(data.todayRevenue),
                },
                {
                  label: "Weekly Revenue",
                  value: formatCurrency(data.weekRevenue),
                },
                {
                  label: "Monthly Revenue",
                  value: formatCurrency(data.monthRevenue),
                },
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

      {/* Stats */}
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <GradientCard
            title="Today's Sales"
            value={
              <AnimatedCounter value={data.todayRevenue} prefix="Rs. " />
            }
            subtitle={`${data.todayOrders} orders`}
            icon={DollarSign}
            gradient="bg-blue-500/10"
            iconColor="text-blue-500"
          />
        </StaggerItem>
        <StaggerItem>
          <GradientCard
            title="Today's Orders"
            value={<AnimatedCounter value={data.todayOrders} />}
            icon={ShoppingCart}
            gradient="bg-emerald-500/10"
            iconColor="text-emerald-500"
            delay={0.1}
          />
        </StaggerItem>
        <StaggerItem>
          <GradientCard
            title="Total Products"
            value={<AnimatedCounter value={data.totalProducts} />}
            icon={Package}
            gradient="bg-purple-500/10"
            iconColor="text-purple-500"
            delay={0.2}
          />
        </StaggerItem>
        <StaggerItem>
          <GradientCard
            title="Total Customers"
            value={<AnimatedCounter value={data.totalCustomers} />}
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
          <SalesOverviewChart data={data.monthlySales} />
        </FadeIn>

        <FadeIn delay={0.2} className="lg:col-span-3">
          <GlassCard className="h-full" hover={false}>
            <SectionHeader title="Recent Sales" />
            <div className="mt-5 space-y-4">
              {data.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No sales yet. Start selling! 🚀
                </p>
              ) : (
                data.recentOrders.map((sale, i) => (
                  <motion.div
                    key={sale.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="group flex items-center gap-3 rounded-xl p-2 -mx-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-purple-500 text-xs font-bold text-white shadow-md">
                      {sale.customer
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {sale.customer}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{sale.orderNumber}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-500">
                      +{formatCurrency(sale.total)}
                    </span>
                  </motion.div>
                ))
              )}
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
                  All Time
                </Badge>
              }
            />
            <div className="mt-5 space-y-3">
              {data.topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No sales data yet.
                </p>
              ) : (
                data.topProducts.map((product, i) => (
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
                    <span className="text-sm font-bold">
                      {formatCurrency(product.revenue)}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </GlassCard>
        </FadeIn>

        <FadeIn delay={0.3}>
          <GlassCard
            hover={false}
            className="border-orange-200/50 dark:border-orange-900/30"
          >
            <SectionHeader
              title="Low Stock Alert"
              action={
                data.lowStockItems.length > 0 ? (
                  <Badge
                    variant="destructive"
                    className="text-xs animate-pulse"
                  >
                    {data.lowStockItems.length} items
                  </Badge>
                ) : null
              }
            />
            <div className="mt-5 space-y-3">
              {data.lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  All products well stocked! 🎉
                </p>
              ) : (
                data.lowStockItems.slice(0, 6).map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 + i * 0.07 }}
                    className="flex items-center gap-4 rounded-xl p-3 -mx-3 hover:bg-muted/50 transition-colors"
                  >
                    <AlertTriangle
                      className={`h-5 w-5 shrink-0 ${
                        item.stock === 0 ? "text-red-500" : "text-amber-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Min: {item.minimum}
                      </p>
                    </div>
                    <Badge
                      variant={
                        item.stock === 0 ? "destructive" : "secondary"
                      }
                      className="text-xs font-bold"
                    >
                      {item.stock} left
                    </Badge>
                  </motion.div>
                ))
              )}
              {data.lowStockItems.length > 0 && (
                <Link href="/inventory">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs mt-2"
                  >
                    View All →
                  </Button>
                </Link>
              )}
            </div>
          </GlassCard>
        </FadeIn>
      </div>

      {/* Quick Actions */}
      <FadeIn delay={0.35}>
        <GlassCard hover={false}>
          <SectionHeader title="Quick Actions" />
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
                className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card p-6 text-center transition-all duration-300 hover:shadow-lg hover:border-primary/30 overflow-hidden"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${action.gradient} shadow-lg`}
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