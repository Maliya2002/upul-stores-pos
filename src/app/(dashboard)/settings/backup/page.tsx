import { PageHeader } from "@/components/ui-custom";
import { SettingsNav, BackupRestore } from "@/features/settings/components";

export default function BackupPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Backup & Restore"
        description="Export your data and manage backups."
      />
      <SettingsNav />
      <BackupRestore />
    </div>
  );
}