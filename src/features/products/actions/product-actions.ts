"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  productSchema,
  type ProductFormValues,
} from "../schemas/product-schema";
import {
  buildProductSlug,
  normalizeOptionalString,
} from "../utils/product-helpers";

export async function getProductFormOptions() {
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

  return { categories, brands, suppliers };
}

export async function getProducts() {
  return prisma.product.findMany({
    include: {
      category: true,
      brand: true,
      supplier: true,
      variants: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      brand: true,
      supplier: true,
      variants: true,
      stockMovements: {
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
}

async function generateUniqueSlug(name: string, excludeId?: string) {
  const baseSlug = buildProductSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.product.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

function mapVariants(variants: ProductFormValues["variants"] = []) {
  return variants
    .filter((variant) => variant.name.trim() && variant.sku.trim())
    .map((variant) => ({
      name: variant.name.trim(),
      sku: variant.sku.trim(),
      barcode: normalizeOptionalString(variant.barcode),
      price: variant.price,
      quantity: variant.quantity,
      color: normalizeOptionalString(variant.color),
      size: normalizeOptionalString(variant.size),
      image: normalizeOptionalString(variant.image),
      isActive: variant.isActive,
    }));
}

export async function createProductAction(input: ProductFormValues) {
  const validated = productSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "Invalid product data.",
    };
  }

  const data = validated.data;

  try {
    const slug = await generateUniqueSlug(data.name);

    const product = await prisma.product.create({
      data: {
        name: data.name.trim(),
        slug,
        sku: data.sku.trim(),
        barcode: normalizeOptionalString(data.barcode),
        description: normalizeOptionalString(data.description),
        categoryId: data.categoryId,
        brandId: normalizeOptionalString(data.brandId),
        supplierId: normalizeOptionalString(data.supplierId),
        purchasePrice: data.purchasePrice,
        sellingPrice: data.sellingPrice,
        tax: data.tax,
        discount: data.discount,
        quantity: data.quantity,
        minimumStock: data.minimumStock,
        unit: data.unit.trim(),
        weight: data.weight ?? null,
        color: normalizeOptionalString(data.color),
        size: normalizeOptionalString(data.size),
        status: data.status,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        batchNumber: normalizeOptionalString(data.batchNumber),
        images: (data.images ?? []).filter((image) => image.trim().length > 0),
        hasVariants: data.hasVariants,
        isActive: data.isActive,
        variants:
          data.hasVariants && data.variants.length > 0
            ? {
                create: mapVariants(data.variants),
              }
            : undefined,
      },
    });

    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: "ADJUSTMENT",
        quantity: data.quantity,
        beforeQty: 0,
        afterQty: data.quantity,
        reference: "INITIAL_STOCK",
        notes: "Initial stock created during product creation",
      },
    });

    revalidatePath("/products");
    revalidatePath(`/products/${product.id}`);

    return {
      success: true,
      message: "Product created successfully.",
      productId: product.id,
    };
  } catch (error: unknown) {
    const prismaError = error as { code?: string };

    if (prismaError?.code === "P2002") {
      return {
        success: false,
        error: "SKU, barcode, or another unique field already exists.",
      };
    }

    return {
      success: false,
      error: "Failed to create product.",
    };
  }
}

export async function updateProductAction(
  id: string,
  input: ProductFormValues
) {
  const validated = productSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "Invalid product data.",
    };
  }

  const data = validated.data;

  try {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!existing) {
      return {
        success: false,
        error: "Product not found.",
      };
    }

    const slug =
      existing.name.trim() === data.name.trim()
        ? existing.slug
        : await generateUniqueSlug(data.name, id);

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: data.name.trim(),
          slug,
          sku: data.sku.trim(),
          barcode: normalizeOptionalString(data.barcode),
          description: normalizeOptionalString(data.description),
          categoryId: data.categoryId,
          brandId: normalizeOptionalString(data.brandId),
          supplierId: normalizeOptionalString(data.supplierId),
          purchasePrice: data.purchasePrice,
          sellingPrice: data.sellingPrice,
          tax: data.tax,
          discount: data.discount,
          quantity: data.quantity,
          minimumStock: data.minimumStock,
          unit: data.unit.trim(),
          weight: data.weight ?? null,
          color: normalizeOptionalString(data.color),
          size: normalizeOptionalString(data.size),
          status: data.status,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
          batchNumber: normalizeOptionalString(data.batchNumber),
          images: (data.images ?? []).filter((image) => image.trim().length > 0),
          hasVariants: data.hasVariants,
          isActive: data.isActive,
        },
      });

      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      if (data.hasVariants && data.variants.length > 0) {
        const variants = mapVariants(data.variants);

        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((variant) => ({
              ...variant,
              productId: id,
            })),
          });
        }
      }

      if (existing.quantity !== data.quantity) {
        await tx.stockMovement.create({
          data: {
            productId: id,
            type: "ADJUSTMENT",
            quantity: Math.abs(data.quantity - existing.quantity),
            beforeQty: existing.quantity,
            afterQty: data.quantity,
            reference: "MANUAL_UPDATE",
            notes: "Stock adjusted from product edit",
          },
        });
      }
    });

    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    revalidatePath(`/products/${id}/edit`);

    return {
      success: true,
      message: "Product updated successfully.",
      productId: id,
    };
  } catch (error: unknown) {
    const prismaError = error as { code?: string };

    if (prismaError?.code === "P2002") {
      return {
        success: false,
        error: "SKU, barcode, or another unique field already exists.",
      };
    }

    return {
      success: false,
      error: "Failed to update product.",
    };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!product) {
      return {
        success: false,
        error: "Product not found.",
      };
    }

    const [orderItemCount, purchaseItemCount] = await Promise.all([
      prisma.orderItem.count({ where: { productId: id } }),
      prisma.purchaseItem.count({ where: { productId: id } }),
    ]);

    if (orderItemCount > 0 || purchaseItemCount > 0) {
      return {
        success: false,
        error:
          "This product cannot be deleted because it is already used in sales or purchases.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.stockMovement.deleteMany({
        where: { productId: id },
      });

      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      await tx.product.delete({
        where: { id },
      });
    });

    revalidatePath("/products");

    return {
      success: true,
      message: `"${product.name}" deleted successfully.`,
    };
  } catch {
    return {
      success: false,
      error: "Failed to delete product.",
    };
  }
}