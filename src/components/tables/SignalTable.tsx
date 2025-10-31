import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { SignalRankBadge } from "@/components/signals/SignalRankBadge";
import { ConfidenceBar } from "@/components/signals/ConfidenceBar";
import { SparklineChart } from "@/components/signals/SparklineChart";
import { VolumeIndicator } from "@/components/signals/VolumeIndicator";
import { SentimentIndicator } from "@/components/signals/SentimentIndicator";
import { SignalActionMenu } from "@/components/signals/SignalActionMenu";

export interface Signal {
  id: string;
  rank: "top" | "medium" | "low";
  symbol: string;
  company: string;
  sector: string;
  confidence: number;
  price: number;
  priceChange: number;
  volume: number;
  volumeChange: number;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  sparklineData: number[];
}

interface SignalTableProps {
  signals: Signal[];
  onRowClick?: (signal: Signal) => void;
}

export function SignalTable({ signals, onRowClick }: SignalTableProps) {
  const [sortBy, setSortBy] = useState<keyof Signal>("confidence");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (key: keyof Signal) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
  };

  const sortedSignals = [...signals].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Rank</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => handleSort("confidence")}
              >
                Confidence
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Trend</TableHead>
            <TableHead>Volume</TableHead>
            <TableHead>Sentiment</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSignals.map((signal) => (
            <TableRow
              key={signal.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick?.(signal)}
            >
              <TableCell>
                <SignalRankBadge rank={signal.rank} />
              </TableCell>
              <TableCell className="font-bold">{signal.symbol}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {signal.company}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{signal.sector}</Badge>
              </TableCell>
              <TableCell>
                <ConfidenceBar confidence={signal.confidence} />
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">${signal.price.toFixed(2)}</span>
                  <span
                    className={
                      signal.priceChange >= 0
                        ? "text-xs text-success"
                        : "text-xs text-destructive"
                    }
                  >
                    {signal.priceChange >= 0 ? "+" : ""}
                    {signal.priceChange.toFixed(2)}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <SparklineChart
                  data={signal.sparklineData}
                  className="h-8 w-20"
                />
              </TableCell>
              <TableCell>
                <VolumeIndicator
                  volume={signal.volume}
                  change={signal.volumeChange}
                />
              </TableCell>
              <TableCell>
                <SentimentIndicator
                  sentiment={signal.sentiment}
                  score={signal.sentimentScore}
                />
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <SignalActionMenu
                  symbol={signal.symbol}
                  onSave={() => console.log("Save", signal.symbol)}
                  onCompare={() => console.log("Compare", signal.symbol)}
                  onExplain={() => console.log("Explain", signal.symbol)}
                  onShare={() => console.log("Share", signal.symbol)}
                  onAnalyze={() => console.log("Analyze", signal.symbol)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
