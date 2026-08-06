import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-custom";
import { getCategories } from "@/features/categories/actions/category-actions";
import {
  CategoriesTable,
  type CategoryRow,
} from "@/features/categories/components";

export default async function CategoriesPage() {
  const categories = await getCategories();

  const rows: CategoryRow[] = categories.map(
    (cat: (typeof categories)[number]) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parent: cat.parent?.name ?? "-",
      products: cat._count.products,
      children: cat._count.children,
      isActive: cat.isActive,
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        badge={`${rows.length}`}
        description="Manage product categories and sub-categories."
        actions={
          <Link href="/categories/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="p-5">
          <CategoriesTable data={rows} />
        </CardContent>
      </Card>
    </div>
  );
}