import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/ui-custom";
import { ProductForm } from "@/features/products/components";

export default async function AddProductPage() {
  const [categories, brands, suppliers] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Product"
        description="Create a new product with pricing, stock, images and variants."
      />

      <ProductForm
        mode="create"
        categories={categories}
        brands={brands}
        suppliers={suppliers}
      />
    </div>
  );
}