import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Star, GitCompare, MessageSquare, Share2, TrendingUp } from "lucide-react";

interface SignalActionMenuProps {
  symbol: string;
  onSave?: () => void;
  onCompare?: () => void;
  onExplain?: () => void;
  onShare?: () => void;
  onAnalyze?: () => void;
}

export function SignalActionMenu({
  symbol,
  onSave,
  onCompare,
  onExplain,
  onShare,
  onAnalyze,
}: SignalActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
        <DropdownMenuItem onClick={onSave}>
          <Star className="mr-2 h-4 w-4" />
          Save to Watchlist
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCompare}>
          <GitCompare className="mr-2 h-4 w-4" />
          Compare Symbols
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExplain}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Explain Signal
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onAnalyze}>
          <TrendingUp className="mr-2 h-4 w-4" />
          Deep Analysis
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
