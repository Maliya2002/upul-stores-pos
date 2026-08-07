import { PageHeader } from "@/components/ui-custom";

export default function AdjustmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Adjustments"
        description="Adjust stock levels manually. Use Stock In / Stock Out for now."
      />
    </div>
  );
}