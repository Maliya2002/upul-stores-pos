import { PageHeader } from "@/components/ui-custom";
import { CategoryForm } from "@/features/categories/components";
import { getParentCategories } from "@/features/categories/actions/category-actions";

export default async function AddCategoryPage() {
  const parents = await getParentCategories();

  return (
    <div className="space-y-6">
      <PageHeader title="Add Category" />
      <CategoryForm mode="create" parentCategories={parents} />
    </div>
  );
}