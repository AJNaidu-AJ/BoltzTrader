import { Smile, Meh, Frown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SentimentIndicatorProps {
  sentiment: "positive" | "neutral" | "negative";
  score?: number;
  className?: string;
}

export function SentimentIndicator({ sentiment, score, className }: SentimentIndicatorProps) {
  const config = {
    positive: {
      icon: Smile,
      color: "text-success",
      label: "Positive",
    },
    neutral: {
      icon: Meh,
      color: "text-warning",
      label: "Neutral",
    },
    negative: {
      icon: Frown,
      color: "text-destructive",
      label: "Negative",
    },
  };

  const { icon: Icon, color, label } = config[sentiment];

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className={cn("flex items-center gap-1", className)}>
          <Icon className={cn("h-4 w-4", color)} />
          {score !== undefined && (
            <span className={cn("text-xs font-medium", color)}>
              {score.toFixed(1)}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Sentiment: {label}</p>
        {score !== undefined && <p>Score: {score.toFixed(2)}</p>}
      </TooltipContent>
    </Tooltip>
  );
}
