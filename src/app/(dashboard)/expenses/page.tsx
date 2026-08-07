import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-custom";
import {
  getExpenses,
  getExpenseStats,
} from "@/features/expenses/actions/expense-actions";
import {
  ExpensesTable,
  ExpenseStatsCards,
  type ExpenseRow,
} from "@/features/expenses/components";
import { formatDateTime } from "@/lib/utils";

export default async function ExpensesPage() {
  const [expenses, stats] = await Promise.all([
    getExpenses(),
    getExpenseStats(),
  ]);

  const rows: ExpenseRow[] = expenses.map((e: (typeof expenses)[number]) => ({
    id: e.id,
    title: e.title,
    amount: e.amount,
    category: e.category,
    createdAt: formatDateTime(e.createdAt),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        badge={`${rows.length}`}
        description="Track all business expenses."
        actions={
          <Link href="/expenses/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </Link>
        }
      />

      <ExpenseStatsCards
        total={stats.total}
        categoryCount={stats.byCategory.length}
      />

      <Card>
        <CardContent className="p-5">
          <ExpensesTable data={rows} />
        </CardContent>
      </Card>
    </div>
  );
}