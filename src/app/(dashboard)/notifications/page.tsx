import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-custom";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { NotificationActions } from "./notification-actions";

const typeEmoji: Record<string, string> = {
  LOW_STOCK: "📦",
  OUT_OF_STOCK: "🚫",
  EXPIRY_ALERT: "⏰",
  PAYMENT_DUE: "💳",
  DAILY_REPORT: "📊",
  SYSTEM: "⚙️",
};

export default async function NotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        badge={unreadCount > 0 ? `${unreadCount} unread` : "All read"}
        description="System alerts and notifications."
        actions={<NotificationActions hasUnread={unreadCount > 0} />}
      />

      <Card>
        <CardContent className="p-5">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-4xl mb-3">🔔</p>
              <p className="font-medium">No notifications</p>
              <p className="text-sm mt-1">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(
                (notif: (typeof notifications)[number]) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-4 rounded-xl border p-4 transition-all duration-200 ${
                      notif.isRead
                        ? "bg-background"
                        : "bg-primary/5 border-primary/20"
                    }`}
                  >
                    <span className="text-2xl shrink-0">
                      {typeEmoji[notif.type] ?? "🔔"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold">{notif.title}</p>
                        {!notif.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notif.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDateTime(notif.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] shrink-0"
                    >
                      {notif.type.replace(/_/g, " ")}
                    </Badge>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}