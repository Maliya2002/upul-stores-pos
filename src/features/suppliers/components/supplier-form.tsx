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
  supplierSchema,
  type SupplierFormInput,
  type SupplierFormValues,
} from "../schemas/supplier-schema";
import {
  createSupplierAction,
  updateSupplierAction,
} from "../actions/supplier-actions";

interface SupplierFormProps {
  mode: "create" | "edit";
  supplierId?: string;
  initialData?: {
    name: string;
    email?: string;
    phone: string;
    address?: string;
    company?: string;
    taxNumber?: string;
    isActive?: boolean;
  };
}

export function SupplierForm({
  mode,
  supplierId,
  initialData,
}: SupplierFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SupplierFormInput, unknown, SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      address: initialData?.address ?? "",
      company: initialData?.company ?? "",
      taxNumber: initialData?.taxNumber ?? "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const isActive = Boolean(watch("isActive"));

  const onSubmit = (values: SupplierFormValues) => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createSupplierAction(values)
          : await updateSupplierAction(supplierId || "", values);

      if (!result.success) {
        toast.error(result.error || "Something went wrong.");
        return;
      }

      toast.success(result.message || "Success");

      const newId =
        "supplierId" in result
          ? (result as { supplierId?: string }).supplierId
          : null;

      const redirectPath =
        newId ? `/suppliers/${newId}` : "/suppliers";

      router.push(redirectPath);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection
        title="Supplier Information"
        description="Basic supplier contact and company details"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <Label>Supplier Name</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input {...register("phone")} />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Company</Label>
            <Input {...register("company")} />
          </div>

          <div className="space-y-2">
            <Label>Tax Number</Label>
            <Input {...register("taxNumber")} />
          </div>

          <div className="space-y-2 md:col-span-2 xl:col-span-3">
            <Label>Address</Label>
            <Textarea rows={3} {...register("address")} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Visibility">
        <div className="flex items-center justify-between rounded-xl border p-4">
          <div>
            <p className="font-medium">Active Supplier</p>
            <p className="text-sm text-muted-foreground">
              Inactive suppliers are hidden from product and purchase forms
            </p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={(v) => setValue("isActive", v)}
          />
        </div>
      </FormSection>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "create" ? "Creating..." : "Updating..."}
            </>
          ) : mode === "create" ? (
            "Create Supplier"
          ) : (
            "Update Supplier"
          )}
        </Button>
      </div>
    </form>
  );
}