import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { POSLayout } from "@/features/pos/components";
import {
  getPOSProducts,
  getPOSCustomers,
} from "@/features/pos/actions/pos-actions";

export default async function POSPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [products, customers] = await Promise.all([
    getPOSProducts(),
    getPOSCustomers(),
  ]);

  const posProducts = products.map(
    (p: (typeof products)[number]) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      sellingPrice: p.sellingPrice,
      tax: p.tax,
      discount: p.discount,
      quantity: p.quantity,
      images: p.images,
      category: p.category,
    })
  );

  return (
    <POSLayout
      products={posProducts}
      customers={customers}
      cashierId={session.user.id ?? ""}
    />
  );
}