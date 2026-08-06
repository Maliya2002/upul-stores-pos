import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui-custom";
import { ProductForm } from "@/features/products/components";
import {
  getProductById,
  getProductFormOptions,
} from "@/features/products/actions/product-actions";
import { formatDateForInput } from "@/features/products/utils/product-helpers";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, options] = await Promise.all([
    getProductById(id),
    getProductFormOptions(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${product.name}`}
        description="Update product details, price, stock, images and variants."
      />

      <ProductForm
        mode="edit"
        productId={product.id}
        categories={options.categories}
        brands={options.brands}
        suppliers={options.suppliers}
        initialData={{
          id: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          description: product.description,
          categoryId: product.categoryId,
          brandId: product.brandId,
          supplierId: product.supplierId,
          purchasePrice: product.purchasePrice,
          sellingPrice: product.sellingPrice,
          tax: product.tax,
          discount: product.discount,
          quantity: product.quantity,
          minimumStock: product.minimumStock,
          unit: product.unit,
          weight: product.weight,
          color: product.color,
          size: product.size,
          status: product.status,
          expiryDate: formatDateForInput(product.expiryDate),
          batchNumber: product.batchNumber,
          images: product.images,
          hasVariants: product.hasVariants,
          isActive: product.isActive,
          variants: product.variants.map(
            (variant: (typeof product.variants)[number]) => ({
              name: variant.name,
              sku: variant.sku,
              barcode: variant.barcode ?? "",
              price: variant.price,
              quantity: variant.quantity,
              color: variant.color ?? "",
              size: variant.size ?? "",
              image: variant.image ?? "",
              isActive: variant.isActive,
            })
          ),
        }}
      />
    </div>
  );
}