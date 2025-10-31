import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignalTable } from "@/components/tables/SignalTable";
import { TableFilters } from "@/components/tables/TableFilters";
import { SignalDetailPanel } from "@/components/signals/SignalDetailPanel";
import { DailySummaryCard } from "@/components/dashboard/DailySummaryCard";
import { MarketFeed } from "@/components/news/MarketFeed";
import { mockSignals } from "@/lib/mockData";
import { Signal } from "@/components/tables/SignalTable";

export default function Dashboard() {
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedRank, setSelectedRank] = useState("all");
  const [volumeRange, setVolumeRange] = useState([0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");

  const filteredSignals = mockSignals.filter((signal) => {
    if (selectedSector !== "all" && signal.sector !== selectedSector) return false;
    if (selectedRank !== "all" && signal.rank !== selectedRank) return false;
    if (signal.volume < volumeRange[0]) return false;
    return true;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Today's Signals</h1>
          <p className="text-muted-foreground">Real-time AI-powered trading signals</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Market Breadth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">+65%</div>
            <p className="text-xs text-muted-foreground">Bullish momentum</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Sector</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Technology</div>
            <p className="text-xs text-muted-foreground">+3.2% today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.78</div>
            <p className="text-xs text-muted-foreground">High accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">82%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Summary Card */}
      <DailySummaryCard />

      {/* Filters */}
      <TableFilters
        selectedSector={selectedSector}
        onSectorChange={setSelectedSector}
        selectedRank={selectedRank}
        onRankChange={setSelectedRank}
        volumeRange={volumeRange}
        onVolumeRangeChange={setVolumeRange}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
      />

      {/* Main Content - Table, Detail Panel, and News Feed */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <SignalTable signals={filteredSignals} onRowClick={setSelectedSignal} />
        </div>
        <div className="lg:col-span-1">
          <SignalDetailPanel signal={selectedSignal} />
        </div>
        <div className="lg:col-span-1">
          <MarketFeed maxItems={8} />
        </div>
      </div>
    </div>
  );
}
