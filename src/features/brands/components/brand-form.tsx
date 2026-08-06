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
import { FormSection } from "@/components/forms";

import {
  brandSchema,
  type BrandFormInput,
  type BrandFormValues,
} from "../schemas/brand-schema";
import {
  createBrandAction,
  updateBrandAction,
} from "../actions/brand-actions";

interface BrandFormProps {
  mode: "create" | "edit";
  brandId?: string;
  initialData?: {
    name: string;
    description?: string;
    logo?: string;
    isActive?: boolean;
  };
}

export function BrandForm({ mode, brandId, initialData }: BrandFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BrandFormInput, unknown, BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      logo: initialData?.logo ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const isActive = Boolean(watch("isActive"));

  const onSubmit = (values: BrandFormValues) => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createBrandAction(values)
          : await updateBrandAction(brandId || "", values);

      if (!result.success) {
        toast.error(result.error || "Something went wrong.");
        return;
      }

      toast.success(result.message || "Success");
      router.push("/brands");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection title="Brand Details">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Brand Name</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input placeholder="https://..." {...register("logo")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea rows={3} {...register("description")} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Visibility">
        <div className="flex items-center justify-between rounded-xl border p-4">
          <div>
            <p className="font-medium">Active Brand</p>
            <p className="text-sm text-muted-foreground">
              Inactive brands are hidden from product forms
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
            "Create Brand"
          ) : (
            "Update Brand"
          )}
        </Button>
      </div>
    </form>
  );
}