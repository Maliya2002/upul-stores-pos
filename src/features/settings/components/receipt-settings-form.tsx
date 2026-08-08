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

interface ReceiptSettingsFormProps {
  settings: Record<string, string>;
}

export function ReceiptSettingsForm({
  settings,
}: ReceiptSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    receipt_footer: settings.receipt_footer ?? "",
    receipt_header: settings.receipt_header ?? "",
    receipt_note: settings.receipt_note ?? "",
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
        toast.error(result.error || "Failed.");
        return;
      }

      toast.success("Receipt settings saved!");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <FormSection
        title="Receipt Design"
        description="Customize your receipt header, footer and notes"
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Receipt Header</Label>
            <Input
              value={form.receipt_header}
              onChange={(e) => updateField("receipt_header", e.target.value)}
              placeholder="Store tagline or welcome message"
            />
          </div>
          <div className="space-y-2">
            <Label>Receipt Footer</Label>
            <Textarea
              value={form.receipt_footer}
              onChange={(e) => updateField("receipt_footer", e.target.value)}
              rows={2}
              placeholder="Thank you message..."
            />
          </div>
          <div className="space-y-2">
            <Label>Additional Note</Label>
            <Textarea
              value={form.receipt_note}
              onChange={(e) => updateField("receipt_note", e.target.value)}
              rows={2}
              placeholder="Return policy, promotions, etc."
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
              Save Receipt Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}