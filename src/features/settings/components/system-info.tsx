"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Database, Code, Package } from "lucide-react";

interface SystemInfoProps {
  info: {
    users: number;
    products: number;
    customers: number;
    orders: number;
    categories: number;
    brands: number;
    suppliers: number;
    expenses: number;
    stockMovements: number;
    appVersion: string;
    framework: string;
    database: string;
    orm: string;
  };
}

export function SystemInfo({ info }: SystemInfoProps) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Monitor className="h-4 w-4 text-blue-500" />
              Application
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <InfoItem label="Version" value={info.appVersion} icon="🏷️" />
              <InfoItem label="Framework" value={info.framework} icon="⚡" />
              <InfoItem label="Database" value={info.database} icon="🗄️" />
              <InfoItem label="ORM" value={info.orm} icon="🔗" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-500" />
              Database Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
              <StatItem label="Users" value={info.users} />
              <StatItem label="Products" value={info.products} />
              <StatItem label="Customers" value={info.customers} />
              <StatItem label="Orders" value={info.orders} />
              <StatItem label="Categories" value={info.categories} />
              <StatItem label="Brands" value={info.brands} />
              <StatItem label="Suppliers" value={info.suppliers} />
              <StatItem label="Expenses" value={info.expenses} />
              <StatItem label="Stock Movements" value={info.stockMovements} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-lg mb-1">{icon}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-bold mt-0.5">{value}</p>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-muted/30 p-4 text-center">
      <p className="text-2xl font-black text-primary">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}