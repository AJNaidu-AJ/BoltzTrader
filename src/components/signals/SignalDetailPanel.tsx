import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Signal } from "@/components/tables/SignalTable";
import { ConfidenceBar } from "./ConfidenceBar";
import { PriceChart } from "@/components/charts/PriceChart";
import { SentimentIndicator } from "./SentimentIndicator";
import { PlaceOrderDialog } from "@/components/trading/PlaceOrderDialog";
import { Star, Bell, TrendingUp } from "lucide-react";
import { generatePriceChartData } from "@/lib/mockData";

interface SignalDetailPanelProps {
  signal: Signal | null;
}

export function SignalDetailPanel({ signal }: SignalDetailPanelProps) {
  if (!signal) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Select a signal to view details</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = generatePriceChartData(7);

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{signal.symbol}</CardTitle>
            <CardDescription>{signal.company}</CardDescription>
          </div>
          <Badge variant="outline">{signal.sector}</Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Star className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button size="sm" variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Alert
          </Button>
          <PlaceOrderDialog 
            signal={{
              id: signal.id,
              symbol: signal.symbol,
              company: signal.company,
              price: signal.price,
              confidence: signal.confidence
            }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Price Info */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">${signal.price.toFixed(2)}</span>
            <span
              className={
                signal.priceChange >= 0
                  ? "text-lg font-medium text-success"
                  : "text-lg font-medium text-destructive"
              }
            >
              {signal.priceChange >= 0 ? "+" : ""}
              {signal.priceChange.toFixed(2)}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Today's change</p>
        </div>

        {/* Confidence Score */}
        <div>
          <h3 className="text-sm font-medium mb-2">Confidence Score</h3>
          <ConfidenceBar confidence={signal.confidence} />
        </div>

        {/* Price Chart */}
        <div>
          <h3 className="text-sm font-medium mb-2">7-Day Trend</h3>
          <PriceChart data={chartData} className="h-48" />
        </div>

        {/* Top Reasons */}
        <div>
          <h3 className="text-sm font-medium mb-2">Top Signal Reasons</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-success font-bold">1.</span>
              <span>Strong upward momentum with RSI at 68, indicating bullish strength</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success font-bold">2.</span>
              <span>Volume surge of {signal.volumeChange.toFixed(1)}% above average signals increased interest</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success font-bold">3.</span>
              <span>Positive news sentiment with {(signal.sentimentScore * 100).toFixed(0)}% favorable coverage</span>
            </li>
          </ul>
        </div>

        {/* Sentiment */}
        <div>
          <h3 className="text-sm font-medium mb-2">Market Sentiment</h3>
          <div className="flex items-center gap-2">
            <SentimentIndicator sentiment={signal.sentiment} score={signal.sentimentScore} />
            <span className="text-sm capitalize">{signal.sentiment}</span>
            <span className="text-sm text-muted-foreground">
              ({(signal.sentimentScore * 100).toFixed(0)}%)
            </span>
          </div>
        </div>

        {/* Recent News */}
        <div>
          <h3 className="text-sm font-medium mb-2">Recent News</h3>
          <div className="space-y-2">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{signal.company} Reports Strong Q4 Earnings</p>
              <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Analyst Upgrades {signal.symbol} to Buy Rating</p>
              <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
