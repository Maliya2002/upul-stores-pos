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
  customerSchema,
  type CustomerFormInput,
  type CustomerFormValues,
} from "../schemas/customer-schema";
import {
  createCustomerAction,
  updateCustomerAction,
} from "../actions/customer-actions";

interface CustomerFormProps {
  mode: "create" | "edit";
  customerId?: string;
  initialData?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    membershipLevel?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
    loyaltyPoints?: number;
    creditBalance?: number;
    isActive?: boolean;
  };
}

const membershipColors = {
  BRONZE: "text-orange-600",
  SILVER: "text-slate-500",
  GOLD: "text-amber-500",
  PLATINUM: "text-purple-500",
};

export function CustomerForm({
  mode,
  customerId,
  initialData,
}: CustomerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormInput, unknown, CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      address: initialData?.address ?? "",
      membershipLevel: initialData?.membershipLevel ?? "BRONZE",
      loyaltyPoints: initialData?.loyaltyPoints ?? 0,
      creditBalance: initialData?.creditBalance ?? 0,
      isActive: initialData?.isActive ?? true,
    },
  });

  const isActive = Boolean(watch("isActive"));
  const membershipValue = (watch("membershipLevel") ?? "BRONZE") as
    | "BRONZE"
    | "SILVER"
    | "GOLD"
    | "PLATINUM";

  const onSubmit = (values: CustomerFormValues) => {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCustomerAction(values)
          : await updateCustomerAction(customerId || "", values);

      if (!result.success) {
        toast.error(result.error || "Something went wrong.");
        return;
      }

      toast.success(result.message || "Success");

      const newId =
        "customerId" in result
          ? (result as { customerId?: string }).customerId
          : null;

      router.push(newId ? `/customers/${newId}` : "/customers");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection
        title="Personal Information"
        description="Customer contact and personal details"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Phone</Label>
            <Input {...register("phone")} />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">
                {errors.email.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2 xl:col-span-3">
            <Label>Address</Label>
            <Textarea rows={3} {...register("address")} />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Membership & Loyalty"
        description="Manage customer membership and loyalty points"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Membership Level</Label>
            <Select
              value={membershipValue}
              onValueChange={(v) =>
                setValue(
                  "membershipLevel",
                  v as "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {(["BRONZE", "SILVER", "GOLD", "PLATINUM"] as const).map(
                  (level) => (
                    <SelectItem key={level} value={level}>
                      <span className={membershipColors[level]}>
                        ★ {level}
                      </span>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Loyalty Points</Label>
            <Input type="number" {...register("loyaltyPoints")} />
          </div>

          <div className="space-y-2">
            <Label>Credit Balance (Rs.)</Label>
            <Input
              type="number"
              step="0.01"
              {...register("creditBalance")}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Visibility">
        <div className="flex items-center justify-between rounded-xl border p-4">
          <div>
            <p className="font-medium">Active Customer</p>
            <p className="text-sm text-muted-foreground">
              Inactive customers are hidden from POS billing
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
            "Create Customer"
          ) : (
            "Update Customer"
          )}
        </Button>
      </div>
    </form>
  );
}