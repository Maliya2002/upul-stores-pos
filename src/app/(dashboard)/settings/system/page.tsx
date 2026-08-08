import { PageHeader } from "@/components/ui-custom";
import { SettingsNav, SystemInfo } from "@/features/settings/components";
import { getSystemInfo } from "@/features/settings/actions/settings-actions";

export default async function SystemInfoPage() {
  const info = await getSystemInfo();

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Information"
        description="Application and database details."
      />
      <SettingsNav />
      <SystemInfo info={info} />
    </div>
  );
}