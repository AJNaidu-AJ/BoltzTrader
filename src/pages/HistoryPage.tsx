import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Target, TrendingUp, TrendingDown, Calendar, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

export default function HistoryPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [filterSymbol, setFilterSymbol] = useState("");

  // Mock performance data
  const performanceData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    accuracy: 80 + Math.random() * 15,
    returns: (Math.random() - 0.3) * 20,
    signals: Math.floor(Math.random() * 50) + 10
  }));

  // Mock signal history
  const signalHistory = [
    {
      id: "1",
      symbol: "AAPL",
      company: "Apple Inc.",
      signal: "BUY",
      confidence: 0.89,
      entryPrice: 175.20,
      exitPrice: 182.45,
      return: 4.14,
      status: "closed",
      date: "2024-01-15",
      duration: "3 days"
    },
    {
      id: "2", 
      symbol: "MSFT",
      company: "Microsoft Corporation",
      signal: "SELL",
      confidence: 0.76,
      entryPrice: 380.50,
      exitPrice: 375.20,
      return: 1.39,
      status: "closed",
      date: "2024-01-14",
      duration: "2 days"
    },
    {
      id: "3",
      symbol: "GOOGL", 
      company: "Alphabet Inc.",
      signal: "BUY",
      confidence: 0.82,
      entryPrice: 140.30,
      exitPrice: null,
      return: 2.85,
      status: "open",
      date: "2024-01-16",
      duration: "1 day"
    },
    {
      id: "4",
      symbol: "NVDA",
      company: "NVIDIA Corporation", 
      signal: "BUY",
      confidence: 0.94,
      entryPrice: 485.60,
      exitPrice: 502.30,
      return: 3.44,
      status: "closed",
      date: "2024-01-13",
      duration: "4 days"
    },
    {
      id: "5",
      symbol: "TSLA",
      company: "Tesla Inc.",
      signal: "SELL",
      confidence: 0.71,
      entryPrice: 248.90,
      exitPrice: 242.15,
      return: 2.71,
      status: "closed", 
      date: "2024-01-12",
      duration: "5 days"
    }
  ];

  const CustomPerformanceChart = ({ data, className }: any) => (
    <div className={className}>
      <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 flex flex-col relative z-0">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Cumulative Performance</h3>
          <div className="flex gap-2">
            <Button size="sm" variant={timeRange === "7d" ? "default" : "outline"} onClick={() => setTimeRange("7d")}>7D</Button>
            <Button size="sm" variant={timeRange === "30d" ? "default" : "outline"} onClick={() => setTimeRange("30d")}>30D</Button>
            <Button size="sm" variant={timeRange === "90d" ? "default" : "outline"} onClick={() => setTimeRange("90d")}>90D</Button>
          </div>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 500 200" style={{maxHeight: '200px'}}>
            <defs>
              <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line key={i} x1="0" y1={i * 40} x2="500" y2={i * 40} stroke="#e5e7eb" strokeWidth="1" />
            ))}
            {/* Performance line */}
            <path
              d={`M 0 ${100 + Math.sin(0) * 30} ${data.slice(0, 25).map((_, i) => 
                `L ${i * 20} ${100 + Math.sin(i * 0.2) * 25 + (i * 1.5)}`
              ).join(' ')}`}
              fill="url(#performanceGradient)"
              stroke="#10b981"
              strokeWidth="2"
            />
            {/* Data points */}
            {data.slice(0, 25).map((_, i) => (
              <circle
                key={i}
                cx={i * 20}
                cy={100 + Math.sin(i * 0.2) * 25 + (i * 1.5)}
                r="2"
                fill="#10b981"
              />
            ))}
          </svg>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
          <div>
            <div className="font-semibold text-green-600">+24.7%</div>
            <div className="text-gray-500">Total Return</div>
          </div>
          <div>
            <div className="font-semibold">847</div>
            <div className="text-gray-500">Total Signals</div>
          </div>
          <div>
            <div className="font-semibold">12.3</div>
            <div className="text-gray-500">Avg Days</div>
          </div>
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status: string) => (
    <Badge variant={status === "closed" ? "default" : "secondary"}>
      {status.toUpperCase()}
    </Badge>
  );

  const getSignalBadge = (signal: string) => (
    <Badge variant={signal === "BUY" ? "default" : "destructive"}>
      {signal}
    </Badge>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance History</h1>
          <p className="text-muted-foreground mt-2">Track signal accuracy and returns over time</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />Export
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Signal Accuracy</p>
                <p className="text-2xl font-bold">84.5%</p>
                <p className="text-xs text-green-600">+2.1% vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Signals</p>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-xs text-blue-600">+156 this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Return</p>
                <p className="text-2xl font-bold text-green-600">+12.3%</p>
                <p className="text-xs text-green-600">+1.8% vs benchmark</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Max Drawdown</p>
                <p className="text-2xl font-bold text-red-600">-5.2%</p>
                <p className="text-xs text-gray-500">Within risk limits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Performance</CardTitle>
          <CardDescription>Signal accuracy and returns over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 relative">
            <CustomPerformanceChart data={performanceData} className="h-full" />
          </div>
        </CardContent>
      </Card>

      {/* Signal History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Signal History</CardTitle>
              <CardDescription>Detailed breakdown of all trading signals</CardDescription>
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="Filter by symbol..." 
                value={filterSymbol}
                onChange={(e) => setFilterSymbol(e.target.value)}
                className="w-48"
              />
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Signal</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Entry Price</TableHead>
                <TableHead>Exit Price</TableHead>
                <TableHead>Return %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signalHistory
                .filter(signal => !filterSymbol || signal.symbol.toLowerCase().includes(filterSymbol.toLowerCase()))
                .map((signal) => (
                <TableRow key={signal.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{signal.symbol}</div>
                      <div className="text-sm text-muted-foreground">{signal.company}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getSignalBadge(signal.signal)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>{(signal.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>${signal.entryPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    {signal.exitPrice ? `$${signal.exitPrice.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell>
                    <span className={signal.return > 0 ? "text-green-600" : "text-red-600"}>
                      {signal.return > 0 ? "+" : ""}{signal.return.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(signal.status)}
                  </TableCell>
                  <TableCell>{signal.duration}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(signal.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}