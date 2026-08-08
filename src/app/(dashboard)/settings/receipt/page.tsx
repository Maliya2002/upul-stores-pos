import { PageHeader } from "@/components/ui-custom";
import { SettingsNav, ReceiptSettingsForm } from "@/features/settings/components";
import { getAllSettings } from "@/features/settings/actions/settings-actions";

export default async function ReceiptSettingsPage() {
  const settings = await getAllSettings();

  return (
    <div className="space-y-6">
      <PageHeader title="Receipt Design" />
      <SettingsNav />
      <ReceiptSettingsForm settings={settings} />
    </div>
  );
}