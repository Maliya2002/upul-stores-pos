"use client";

import { motion } from "framer-motion";
import { Package, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface POSProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  sellingPrice: number;
  tax: number;
  discount: number;
  quantity: number;
  images: string[];
  category: { name: string };
}

interface ProductGridProps {
  products: POSProduct[];
  onAddToCart: (product: POSProduct) => void;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Package className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm font-medium">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {products.map((product, i) => {
        const outOfStock = product.quantity <= 0;

        return (
          <motion.button
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
            whileHover={!outOfStock ? { scale: 1.03, y: -2 } : undefined}
            whileTap={!outOfStock ? { scale: 0.97 } : undefined}
            onClick={() => !outOfStock && onAddToCart(product)}
            disabled={outOfStock}
            className={`group relative flex flex-col rounded-2xl border bg-card p-3 text-left transition-all duration-200 ${
              outOfStock
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-lg hover:border-primary/30 cursor-pointer"
            }`}
          >
            {/* Image */}
            <div className="aspect-square rounded-xl bg-muted mb-2 flex items-center justify-center overflow-hidden">
              {product.images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                <Package className="h-8 w-8 text-muted-foreground/40" />
              )}
            </div>

            {/* Info */}
            <p className="text-xs font-bold truncate">{product.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {product.category.name}
            </p>

            <div className="flex items-center justify-between mt-2">
              <p className="text-sm font-black text-primary">
                {formatCurrency(product.sellingPrice)}
              </p>
              <Badge
                variant={outOfStock ? "destructive" : "secondary"}
                className="text-[9px] h-5"
              >
                {outOfStock ? "Out" : `${product.quantity}`}
              </Badge>
            </div>

            {/* Add overlay */}
            {!outOfStock && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg">
                  <Plus className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export type { POSProduct };