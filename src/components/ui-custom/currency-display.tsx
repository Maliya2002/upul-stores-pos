import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showPositivePrefix?: boolean;
}

export function CurrencyDisplay({
  amount,
  className,
  showPositivePrefix = false,
}: CurrencyDisplayProps) {
  const prefix = showPositivePrefix && amount > 0 ? "+" : "";
  return (
    <span className={cn("font-semibold tabular-nums", className)}>
      {prefix}
      {formatCurrency(amount)}
    </span>
  );
}