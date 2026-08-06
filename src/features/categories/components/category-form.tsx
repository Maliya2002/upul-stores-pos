"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSection } from "@/components/forms";

import {
  categorySchema,
  type CategoryFormInput,
  type CategoryFormValues,
} from "../schemas/category-schema";
import {
  createCategoryAction,
  updateCategoryAction,
} from "../actions/category-actions";

interface CategoryFormProps {
  mode: "create" | "edit";
  categoryId?: string;
  initialData?: {
    name: string;
    description?: string;
    image?: string;
    parentId?: string;
    isActive?: boolean;
  };
  parentCategories: { id: string; name: string }[];
}

export function CategoryForm({
  mode,
  categoryId,
  initialData,
  parentCategories,
}: CategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      image: initialData?.image ?? "",
      parentId: initialData?.parentId ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const isActive = Boolean(watch("isActive"));
  const parentValue = (watch("parentId") ?? "") as string;

  const onSubmit = (values: CategoryFormValues) => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCategoryAction(values)
          : await updateCategoryAction(categoryId || "", values);

      if (!result.success) {
        toast.error(result.error || "Something went wrong.");
        return;
      }

      toast.success(result.message || "Success");
      router.push("/categories");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection title="Category Details">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Category Name</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Parent Category</Label>
            <Select
              value={parentValue || "none"}
              onValueChange={(v) =>
                setValue("parentId", v === "none" ? "" : v ?? "")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="No parent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent (Top level)</SelectItem>
                {parentCategories
                  .filter((c) => c.id !== categoryId)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea rows={3} {...register("description")} />
          </div>

          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input placeholder="https://..." {...register("image")} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Visibility">
        <div className="flex items-center justify-between rounded-xl border p-4">
          <div>
            <p className="font-medium">Active Category</p>
            <p className="text-sm text-muted-foreground">
              Inactive categories are hidden from product forms
            </p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={(v) => setValue("isActive", v)}
          />
        </div>
      </FormSection>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "create" ? "Creating..." : "Updating..."}
            </>
          ) : mode === "create" ? (
            "Create Category"
          ) : (
            "Update Category"
          )}
        </Button>
      </div>
    </form>
  );
}