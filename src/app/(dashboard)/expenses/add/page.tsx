import { PageHeader } from "@/components/ui-custom";
import { ExpenseForm } from "@/features/expenses/components";

export default function AddExpensePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Add Expense" />
      <ExpenseForm />
    </div>
  );
}