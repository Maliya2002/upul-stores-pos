"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "@/components/forms";
import { updateMultipleSettingsAction } from "../actions/settings-actions";

interface StoreSettingsFormProps {
  settings: Record<string, string>;
}

export function StoreSettingsForm({ settings }: StoreSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    store_name: settings.store_name ?? "",
    store_phone: settings.store_phone ?? "",
    store_email: settings.store_email ?? "",
    store_address: settings.store_address ?? "",
    currency: settings.currency ?? "LKR",
    currency_symbol: settings.currency_symbol ?? "Rs.",
    tax_rate: settings.tax_rate ?? "0",
    low_stock_threshold: settings.low_stock_threshold ?? "10",
    loyalty_points_rate: settings.loyalty_points_rate ?? "1",
  });

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const updates = Object.entries(form).map(([key, value]) => ({
        key,
        value,
      }));

      const result = await updateMultipleSettingsAction(updates);

      if (!result.success) {
        toast.error(result.error || "Failed to save.");
        return;
      }

      toast.success("Settings saved successfully!");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <FormSection
        title="Store Information"
        description="Your store name, contact and address details"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Store Name</Label>
            <Input
              value={form.store_name}
              onChange={(e) => updateField("store_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={form.store_phone}
              onChange={(e) => updateField("store_phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={form.store_email}
              onChange={(e) => updateField("store_email", e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Address</Label>
            <Textarea
              value={form.store_address}
              onChange={(e) => updateField("store_address", e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Currency & Tax"
        description="Configure currency and default tax rate"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Currency Code</Label>
            <Input
              value={form.currency}
              onChange={(e) => updateField("currency", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Currency Symbol</Label>
            <Input
              value={form.currency_symbol}
              onChange={(e) => updateField("currency_symbol", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Default Tax Rate (%)</Label>
            <Input
              type="number"
              value={form.tax_rate}
              onChange={(e) => updateField("tax_rate", e.target.value)}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Inventory & Loyalty"
        description="Stock alerts and loyalty points configuration"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Low Stock Threshold</Label>
            <Input
              type="number"
              value={form.low_stock_threshold}
              onChange={(e) =>
                updateField("low_stock_threshold", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Loyalty Points per Rs.100</Label>
            <Input
              type="number"
              value={form.loyalty_points_rate}
              onChange={(e) =>
                updateField("loyalty_points_rate", e.target.value)
              }
            />
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}