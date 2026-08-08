import { PageHeader } from "@/components/ui-custom";
import { SettingsNav, StoreSettingsForm } from "@/features/settings/components";
import { getAllSettings } from "@/features/settings/actions/settings-actions";

export default async function StoreSettingsPage() {
  const settings = await getAllSettings();

  return (
    <div className="space-y-6">
      <PageHeader title="Store Details" />
      <SettingsNav />
      <StoreSettingsForm settings={settings} />
    </div>
  );
}