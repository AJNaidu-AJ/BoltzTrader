import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SignalRankBadgeProps {
  rank: "top" | "medium" | "low";
  className?: string;
}

export function SignalRankBadge({ rank, className }: SignalRankBadgeProps) {
  const variants = {
    top: "bg-success text-success-foreground hover:bg-success/90",
    medium: "bg-warning text-warning-foreground hover:bg-warning/90",
    low: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  };

  const labels = {
    top: "Top",
    medium: "Medium",
    low: "Low",
  };

  return (
    <Badge className={cn(variants[rank], className)}>
      {labels[rank]}
    </Badge>
  );
}
