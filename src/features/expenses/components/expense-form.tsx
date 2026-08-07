"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSection } from "@/components/forms";
import { expenseSchema, type ExpenseFormInput, type ExpenseFormValues } from "../schemas/expense-schema";
import { createExpenseAction } from "../actions/expense-actions";

const categories = [
  { value: "SALARY", label: "💰 Salary" },
  { value: "ELECTRICITY", label: "⚡ Electricity" },
  { value: "TRANSPORT", label: "🚗 Transport" },
  { value: "RENT", label: "🏠 Rent" },
  { value: "INTERNET", label: "🌐 Internet" },
  { value: "MAINTENANCE", label: "🔧 Maintenance" },
  { value: "MARKETING", label: "📢 Marketing" },
  { value: "OTHER", label: "📋 Other" },
];

export function ExpenseForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { title: "", amount: 0, category: "OTHER", description: "" },
  });

  const categoryValue = (watch("category") ?? "OTHER") as string;

  const onSubmit = (values: ExpenseFormValues) => {
    startTransition(async () => {
      const result = await createExpenseAction(values);
      if (!result.success) { toast.error(result.error || "Failed."); return; }
      toast.success(result.message || "Success");
      router.push("/expenses");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection title="Expense Details">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label>Amount (Rs.)</Label>
            <Input type="number" step="0.01" {...register("amount")} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryValue} onValueChange={(v) => setValue("category", v as ExpenseFormValues["category"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={2} {...register("description")} />
          </div>
        </div>
      </FormSection>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Record Expense"}
        </Button>
      </div>
    </form>
  );
}