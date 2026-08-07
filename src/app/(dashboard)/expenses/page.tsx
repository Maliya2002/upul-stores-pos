import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-custom";
import { getExpenses, getExpenseStats } from "@/features/expenses/actions/expense-actions";
import { ExpensesTable, type ExpenseRow } from "@/features/expenses/components";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { GradientCard } from "@/components/shared/gradient-card";
import { Wallet, TrendingDown } from "lucide-react";

export default async function ExpensesPage() {
  const [expenses, stats] = await Promise.all([getExpenses(), getExpenseStats()]);

  const rows: ExpenseRow[] = expenses.map((e: (typeof expenses)[number]) => ({
    id: e.id, title: e.title, amount: e.amount, category: e.category, createdAt: formatDateTime(e.createdAt),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Expenses" badge={`${rows.length}`} description="Track all business expenses."
        actions={<Link href="/expenses/add"><Button><Plus className="mr-2 h-4 w-4" />Add Expense</Button></Link>}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <GradientCard title="Total Expenses" value={formatCurrency(stats.total)} icon={Wallet} gradient="bg-red-500/10" iconColor="text-red-500" />
        <GradientCard title="Categories" value={String(stats.byCategory.length)} icon={TrendingDown} gradient="bg-purple-500/10" iconColor="text-purple-500" delay={0.1} />
      </div>
      <Card><CardContent className="p-5"><ExpensesTable data={rows} /></CardContent></Card>
    </div>
  );
}