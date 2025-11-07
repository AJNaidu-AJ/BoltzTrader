import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Search, TrendingUp, Star, Bell, Share2, MessageSquare, Smile } from "lucide-react";

export default function Analysis() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");

  // Mock chart data
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: 150 + Math.random() * 50,
    volume: Math.floor(Math.random() * 50000000) + 10000000,
  }));

  const CustomChart = ({ data, className }: any) => (
    <div className={className}>
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Price Chart</h3>
          <div className="text-sm text-gray-500">Last 30 days</div>
        </div>
        <div className="flex-1 relative">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            <defs>
              <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line key={i} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#e5e7eb" strokeWidth="1" />
            ))}
            {/* Price line */}
            <path
              d={`M 0 ${100 + Math.sin(0) * 30} ${data.slice(0, 20).map((_, i) => 
                `L ${i * 20} ${100 + Math.sin(i * 0.3) * 30 + Math.random() * 20}`
              ).join(' ')}`}
              fill="url(#priceGradient)"
              stroke="#3b82f6"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="text-center text-sm text-gray-600 mt-2">
          Current: ${(150 + Math.random() * 50).toFixed(2)}
        </div>
      </div>
    </div>
  );

  const SentimentIndicator = ({ sentiment, score }: any) => (
    <div className="flex items-center gap-2">
      <Smile className={`w-4 h-4 ${sentiment === 'positive' ? 'text-green-500' : 'text-gray-400'}`} />
      <span className="text-sm font-medium">{score}</span>
    </div>
  );

  const ChatInterface = () => (
    <div className="h-96 bg-gray-50 rounded-lg p-4 flex flex-col">
      <div className="flex-1 space-y-3">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-sm">What's the sentiment for AAPL today?</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-lg ml-8">
          <p className="text-sm">AAPL shows strong bullish sentiment with 82% positive indicators. Key factors include strong earnings and institutional buying.</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-sm">Should I buy or wait?</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-lg ml-8">
          <p className="text-sm">Based on technical analysis, AAPL is showing strong momentum. Consider entering on any dip below $175.</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Input placeholder="Ask about signals, strategies..." className="flex-1" />
        <Button size="sm">Send</Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Symbol Analysis</CardTitle>
          <CardDescription>Search and analyze any symbol with AI-powered insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search symbol or ask a question..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-10 text-lg h-12" 
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl">{selectedSymbol}</CardTitle>
                  <CardDescription>Apple Inc.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Star className="h-4 w-4 mr-2" />Save
                  </Button>
                  <Button size="sm" variant="outline">
                    <Bell className="h-4 w-4 mr-2" />Alert
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold">$178.45</span>
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-xl font-medium">+2.34%</span>
                </div>
              </div>

              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="indicators">Indicators</TabsTrigger>
                  <TabsTrigger value="news">News</TabsTrigger>
                </TabsList>
                <TabsContent value="chart" className="space-y-4">
                  <CustomChart data={chartData} className="h-80" />
                </TabsContent>
                <TabsContent value="indicators" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">RSI (14)</span>
                        <span className="text-sm font-bold">68.5</span>
                      </div>
                      <Progress value={68.5} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">MACD</span>
                        <span className="text-sm font-bold text-green-600">Bullish</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Volume</span>
                        <span className="text-sm font-bold">High</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Support</span>
                        <span className="text-sm font-bold">$175.20</span>
                      </div>
                      <div className="text-xs text-gray-500">Strong level</div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="news" className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <SentimentIndicator sentiment="positive" score={0.75} />
                        <div className="flex-1">
                          <p className="font-medium">Apple announces new product line</p>
                          <p className="text-sm text-gray-600 mt-1">Strong market reaction expected with institutional buying pressure</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">Earnings</Badge>
                            <Badge variant="outline">Bullish</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <SentimentIndicator sentiment="positive" score={0.68} />
                        <div className="flex-1">
                          <p className="font-medium">Analyst upgrades price target to $200</p>
                          <p className="text-sm text-gray-600 mt-1">Multiple firms raise targets citing strong fundamentals</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">Analyst</Badge>
                            <Badge variant="outline">Upgrade</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI Trading Assistant
            </CardTitle>
            <CardDescription>Ask questions about signals, strategies, and market analysis</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ChatInterface />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}