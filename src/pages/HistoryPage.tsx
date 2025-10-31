import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Target } from "lucide-react";
import { PriceChart } from "@/components/charts/PriceChart";
import { generatePriceChartData } from "@/lib/mockData";

export default function HistoryPage() {
  const chartData = generatePriceChartData(30);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance History</h1>
          <p className="text-muted-foreground mt-2">Track signal accuracy and returns</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">84.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6"><div><p className="text-sm text-muted-foreground">Total Signals</p><p className="text-2xl font-bold">1,247</p></div></CardContent>
        </Card>
        <Card>
          <CardContent className="p-6"><div><p className="text-sm text-muted-foreground">Avg Return</p><p className="text-2xl font-bold text-success">+12.3%</p></div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cumulative Performance</CardTitle>
          <CardDescription>Signal accuracy over time</CardDescription>
        </CardHeader>
        <CardContent>
          <PriceChart data={chartData} className="h-80" />
        </CardContent>
      </Card>
    </div>
  );
}
