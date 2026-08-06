"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import {
  categorySchema,
  type CategoryFormValues,
} from "../schemas/category-schema";

export async function getCategories() {
  return prisma.category.findMany({
    include: {
      parent: true,
      _count: { select: { products: true, children: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
      children: true,
      _count: { select: { products: true } },
    },
  });
}

export async function getParentCategories() {
  return prisma.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

async function generateSlug(name: string, excludeId?: string) {
  const base = slugify(name) || `cat-${Date.now()}`;
  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.category.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    });
    if (!existing) break;
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

export async function createCategoryAction(input: CategoryFormValues) {
  const validated = categorySchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message ?? "Invalid data" };
  }

  const data = validated.data;

  try {
    const slug = await generateSlug(data.name);

    await prisma.category.create({
      data: {
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || null,
        image: data.image?.trim() || null,
        parentId: data.parentId?.trim() || null,
        isActive: data.isActive,
      },
    });

    revalidatePath("/categories");
    return { success: true, message: "Category created successfully." };
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return { success: false, error: "Category name already exists." };
    }
    return { success: false, error: "Failed to create category." };
  }
}

export async function updateCategoryAction(id: string, input: CategoryFormValues) {
  const validated = categorySchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message ?? "Invalid data" };
  }

  const data = validated.data;

  try {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Category not found." };

    const slug =
      existing.name.trim() === data.name.trim()
        ? existing.slug
        : await generateSlug(data.name, id);

    await prisma.category.update({
      where: { id },
      data: {
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || null,
        image: data.image?.trim() || null,
        parentId: data.parentId?.trim() || null,
        isActive: data.isActive,
      },
    });

    revalidatePath("/categories");
    revalidatePath(`/categories/${id}`);
    return { success: true, message: "Category updated successfully." };
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return { success: false, error: "Category name already exists." };
    }
    return { success: false, error: "Failed to update category." };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });

    if (!category) return { success: false, error: "Category not found." };
    if (category._count.products > 0) {
      return { success: false, error: "Cannot delete: category has products." };
    }
    if (category._count.children > 0) {
      return { success: false, error: "Cannot delete: category has sub-categories." };
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/categories");
    return { success: true, message: `"${category.name}" deleted.` };
  } catch {
    return { success: false, error: "Failed to delete category." };
  }
}