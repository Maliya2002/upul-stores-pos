import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string | number;
  title: string;
  description: string;
  time: string;
  type?: "success" | "warning" | "error" | "info";
}

interface ActivityFeedProps {
  title?: string;
  items: ActivityItem[];
}

export function ActivityFeed({
  title = "Recent Activity",
  items,
}: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <span
              className={cn(
                "mt-2 h-2.5 w-2.5 shrink-0 rounded-full",
                item.type === "success" && "bg-emerald-500",
                item.type === "warning" && "bg-amber-500",
                item.type === "error" && "bg-red-500",
                (!item.type || item.type === "info") && "bg-blue-500"
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{item.title}</p>
                <span className="text-xs text-muted-foreground">
                  {item.time}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}