import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui-custom";
import { CategoryForm } from "@/features/categories/components";
import {
  getCategoryById,
  getParentCategories,
} from "@/features/categories/actions/category-actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [category, parents] = await Promise.all([
    getCategoryById(id),
    getParentCategories(),
  ]);

  if (!category) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${category.name}`} />
      <CategoryForm
        mode="edit"
        categoryId={category.id}
        parentCategories={parents}
        initialData={{
          name: category.name,
          description: category.description ?? "",
          image: category.image ?? "",
          parentId: category.parentId ?? "",
          isActive: category.isActive,
        }}
      />
    </div>
  );
}