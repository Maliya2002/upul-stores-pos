import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-custom";
import { getSuppliers } from "@/features/suppliers/actions/supplier-actions";
import {
  SuppliersTable,
  type SupplierRow,
} from "@/features/suppliers/components";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  const rows: SupplierRow[] = suppliers.map(
    (s: (typeof suppliers)[number]) => ({
      id: s.id,
      name: s.name,
      phone: s.phone,
      company: s.company ?? "-",
      balance: s.balance,
      products: s._count.products,
      purchases: s._count.purchases,
      isActive: s.isActive,
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        badge={`${rows.length}`}
        description="Manage suppliers, payments and purchase history."
        actions={
          <Link href="/suppliers/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </Link>
        }
      />
      <Card>
        <CardContent className="p-5">
          <SuppliersTable data={rows} />
        </CardContent>
      </Card>
    </div>
  );
}