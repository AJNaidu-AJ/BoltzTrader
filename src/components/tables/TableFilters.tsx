import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TableFiltersProps {
  selectedSector: string;
  onSectorChange: (sector: string) => void;
  selectedRank: string;
  onRankChange: (rank: string) => void;
  volumeRange: number[];
  onVolumeRangeChange: (range: number[]) => void;
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

export function TableFilters({
  selectedSector,
  onSectorChange,
  selectedRank,
  onRankChange,
  volumeRange,
  onVolumeRangeChange,
  selectedTimeframe,
  onTimeframeChange,
}: TableFiltersProps) {
  const hasFilters =
    selectedSector !== "all" ||
    selectedRank !== "all" ||
    volumeRange[0] !== 0 ||
    selectedTimeframe !== "1h";

  const clearFilters = () => {
    onSectorChange("all");
    onRankChange("all");
    onVolumeRangeChange([0]);
    onTimeframeChange("1h");
  };

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-card border border-border rounded-lg">
      <div className="flex-1 min-w-[200px] space-y-2">
        <Label htmlFor="sector">Sector</Label>
        <Select value={selectedSector} onValueChange={onSectorChange}>
          <SelectTrigger id="sector">
            <SelectValue placeholder="All Sectors" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">All Sectors</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="energy">Energy</SelectItem>
            <SelectItem value="consumer">Consumer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[150px] space-y-2">
        <Label htmlFor="rank">Rank</Label>
        <Select value={selectedRank} onValueChange={onRankChange}>
          <SelectTrigger id="rank">
            <SelectValue placeholder="All Ranks" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="all">All Ranks</SelectItem>
            <SelectItem value="top">Top</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px] space-y-2">
        <Label htmlFor="volume">Min Volume</Label>
        <div className="flex items-center gap-2">
          <Slider
            id="volume"
            value={volumeRange}
            onValueChange={onVolumeRangeChange}
            max={10000000}
            step={100000}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground min-w-[60px]">
            {volumeRange[0] >= 1000000
              ? `${(volumeRange[0] / 1000000).toFixed(1)}M`
              : `${(volumeRange[0] / 1000).toFixed(0)}K`}
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-[150px] space-y-2">
        <Label htmlFor="timeframe">Timeframe</Label>
        <Select value={selectedTimeframe} onValueChange={onTimeframeChange}>
          <SelectTrigger id="timeframe">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            <SelectItem value="5m">5 Minutes</SelectItem>
            <SelectItem value="15m">15 Minutes</SelectItem>
            <SelectItem value="1h">1 Hour</SelectItem>
            <SelectItem value="4h">4 Hours</SelectItem>
            <SelectItem value="1d">1 Day</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="cursor-pointer"
            onClick={clearFilters}
          >
            Clear Filters
            <X className="ml-1 h-3 w-3" />
          </Badge>
        </div>
      )}
    </div>
  );
}
