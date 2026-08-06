"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { brandSchema, type BrandFormValues } from "../schemas/brand-schema";

export async function getBrands() {
  return prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getBrandById(id: string) {
  return prisma.brand.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
}

async function generateSlug(name: string, excludeId?: string) {
  const base = slugify(name) || `brand-${Date.now()}`;
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.brand.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    });
    if (!existing) break;
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

export async function createBrandAction(input: BrandFormValues) {
  const validated = brandSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message ?? "Invalid data" };
  }

  const data = validated.data;

  try {
    const slug = await generateSlug(data.name);

    await prisma.brand.create({
      data: {
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || null,
        logo: data.logo?.trim() || null,
        isActive: data.isActive,
      },
    });

    revalidatePath("/brands");
    return { success: true, message: "Brand created successfully." };
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return { success: false, error: "Brand name already exists." };
    }
    return { success: false, error: "Failed to create brand." };
  }
}

export async function updateBrandAction(id: string, input: BrandFormValues) {
  const validated = brandSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message ?? "Invalid data" };
  }

  const data = validated.data;

  try {
    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Brand not found." };

    const slug =
      existing.name.trim() === data.name.trim()
        ? existing.slug
        : await generateSlug(data.name, id);

    await prisma.brand.update({
      where: { id },
      data: {
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || null,
        logo: data.logo?.trim() || null,
        isActive: data.isActive,
      },
    });

    revalidatePath("/brands");
    revalidatePath(`/brands/${id}`);
    return { success: true, message: "Brand updated successfully." };
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return { success: false, error: "Brand name already exists." };
    }
    return { success: false, error: "Failed to update brand." };
  }
}

export async function deleteBrandAction(id: string) {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!brand) return { success: false, error: "Brand not found." };
    if (brand._count.products > 0) {
      return { success: false, error: "Cannot delete: brand has products." };
    }

    await prisma.brand.delete({ where: { id } });
    revalidatePath("/brands");
    return { success: true, message: `"${brand.name}" deleted.` };
  } catch {
    return { success: false, error: "Failed to delete brand." };
  }
}