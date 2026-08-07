import { PageHeader } from "@/components/ui-custom";

export default function DamagedPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Damaged Items"
        description="Use Stock Out with 'DAMAGED' type to record damaged items."
      />
    </div>
  );
}