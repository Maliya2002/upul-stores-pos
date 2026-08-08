import { PageHeader } from "@/components/ui-custom";
import { SettingsNav } from "@/features/settings/components";

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Settings"
        description="Configure alerts and notifications."
      />
      <SettingsNav />
      <div className="rounded-2xl border p-8 text-center text-muted-foreground">
        <p className="text-sm">
          Email and WhatsApp notification settings coming soon.
        </p>
      </div>
    </div>
  );
}