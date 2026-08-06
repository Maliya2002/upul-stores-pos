import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, ExportButton, PrintButton } from "@/components/ui-custom";
import { DataTable } from "@/components/tables";
import { getProducts } from "@/features/products/actions/product-actions";
import {
  getProductTableColumns,
  type ProductTableRow,
} from "@/features/products/components";
import { getStockState } from "@/features/products/utils/product-helpers";

export default async function ProductsPage() {
  const products = await getProducts();

  const rows: ProductTableRow[] = products.map((product: (typeof products)[number]) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    category: product.category.name,
    brand: product.brand?.name ?? "-",
    supplier: product.supplier?.name ?? "-",
    price: product.sellingPrice,
    quantity: product.quantity,
    minimumStock: product.minimumStock,
    stockStatus: getStockState(product.quantity, product.minimumStock),
    status: product.status,
  }));

  const columns = getProductTableColumns();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        badge={`${rows.length} Items`}
        description="Manage products, pricing, stock, barcode and product details."
        actions={
          <>
            <PrintButton />
            <ExportButton data={rows} filename="products-list" />
            <Link href="/products/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </>
        }
      />

      <Card>
        <CardContent className="p-5">
          <DataTable
            columns={columns}
            data={rows}
            searchKey="name"
            searchPlaceholder="Search products..."
            filterColumn="status"
            filterOptions={[
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
              { label: "Discontinued", value: "DISCONTINUED" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}