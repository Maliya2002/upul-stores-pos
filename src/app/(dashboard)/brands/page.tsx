import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-custom";
import { getBrands } from "@/features/brands/actions/brand-actions";
import {
  BrandsTable,
  type BrandRow,
} from "@/features/brands/components";

export default async function BrandsPage() {
  const brands = await getBrands();

  const rows: BrandRow[] = brands.map(
    (brand: (typeof brands)[number]) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      products: brand._count.products,
      isActive: brand.isActive,
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brands"
        badge={`${rows.length}`}
        description="Manage product brands."
        actions={
          <Link href="/brands/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Brand
            </Button>
          </Link>
        }
      />

      <Card>
        <CardContent className="p-5">
          <BrandsTable data={rows} />
        </CardContent>
      </Card>
    </div>
  );
}