import { cn } from "@/lib/utils";

interface ConfidenceBarProps {
  confidence: number; // 0-1 scale
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceBar({ confidence, showLabel = true, className }: ConfidenceBarProps) {
  const percentage = Math.round(confidence * 100);
  
  const getColor = (conf: number) => {
    if (conf >= 0.8) return "bg-success";
    if (conf >= 0.6) return "bg-warning";
    return "bg-secondary";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLabel && (
        <span className="text-sm font-medium text-foreground min-w-[3rem]">
          {confidence.toFixed(2)}
        </span>
      )}
      <div className="relative flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            getColor(confidence)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground min-w-[3rem]">
          {percentage}%
        </span>
      )}
    </div>
  );
}
