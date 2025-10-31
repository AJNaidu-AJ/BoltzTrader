import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface VolumeIndicatorProps {
  volume: number;
  change: number; // percentage change
  className?: string;
}

export function VolumeIndicator({ volume, change, className }: VolumeIndicatorProps) {
  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(2)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(2)}K`;
    return vol.toString();
  };

  const getIcon = () => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getColor = () => {
    if (change > 0) return "text-success";
    if (change < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm font-medium text-foreground">
        {formatVolume(volume)}
      </span>
      <div className={cn("flex items-center gap-1", getColor())}>
        {getIcon()}
        <span className="text-xs font-medium">
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
