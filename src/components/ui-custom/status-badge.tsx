import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  inactive: "bg-slate-500/15 text-slate-600 border-slate-500/20",
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  completed: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  cancelled: "bg-red-500/15 text-red-600 border-red-500/20",
  refunded: "bg-purple-500/15 text-purple-600 border-purple-500/20",
  low_stock: "bg-orange-500/15 text-orange-600 border-orange-500/20",
  out_of_stock: "bg-red-500/15 text-red-600 border-red-500/20",
  in_stock: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(/\s+/g, "_");

  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize border font-medium",
        statusStyles[key] ?? "bg-blue-500/15 text-blue-600 border-blue-500/20",
        className
      )}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}