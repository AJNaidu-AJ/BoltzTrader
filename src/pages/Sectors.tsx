import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function Sectors() {
  const [timeframe, setTimeframe] = useState("1d");
  const sectors = [
    { name: "Technology", marketCap: 12500000000, change: 2.45, signalCount: 23 },
    { name: "Healthcare", marketCap: 8900000000, change: 1.23, signalCount: 15 },
    { name: "Financial", marketCap: 7800000000, change: -0.89, signalCount: 18 }
  ];

  const getColorClass = (change: number) => {
    if (change > 1.5) return "bg-success/90 hover:bg-success";
    if (change > 0) return "bg-success/30 hover:bg-success/50";
    return "bg-destructive/30 hover:bg-destructive/50";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sector Heatmap</h1>
          <p className="text-muted-foreground mt-2">Market overview with sector performance</p>
        </div>
        <div className="flex gap-2">
          {["1d", "1w", "1m"].map((tf) => (
            <Button key={tf} variant={timeframe === tf ? "default" : "outline"} size="sm" onClick={() => setTimeframe(tf)}>{tf.toUpperCase()}</Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sector Performance Heatmap</CardTitle>
          <CardDescription>Tile size represents market capitalization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sectors.map((sector) => (
              <button key={sector.name} className={`${getColorClass(sector.change)} p-6 rounded-lg transition-all duration-200 text-left cursor-pointer`}>
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{sector.name}</h3>
                    <p className="text-2xl font-bold mb-1">{sector.change >= 0 ? "+" : ""}{sector.change.toFixed(2)}%</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{sector.signalCount} signals</Badge>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
