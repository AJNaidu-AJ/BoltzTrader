import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PriceChart } from "@/components/charts/PriceChart";
import { Search, TrendingUp, Star, Bell, Share2, MessageSquare } from "lucide-react";
import { generatePriceChartData } from "@/lib/mockData";
import { SentimentIndicator } from "@/components/signals/SentimentIndicator";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default function Analysis() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const chartData = generatePriceChartData(30);

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
            <Input placeholder="Search symbol or ask a question..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 text-lg h-12" />
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
                  <Button size="sm" variant="outline"><Star className="h-4 w-4 mr-2" />Save</Button>
                  <Button size="sm" variant="outline"><Bell className="h-4 w-4 mr-2" />Alert</Button>
                  <Button size="sm" variant="outline"><Share2 className="h-4 w-4 mr-2" />Share</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold">$178.45</span>
                <div className="flex items-center gap-2 text-success">
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
                  <PriceChart data={chartData} className="h-80" />
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
                  </div>
                </TabsContent>
                <TabsContent value="news" className="space-y-3">
                  <Card><CardContent className="p-4"><div className="flex items-start gap-3"><SentimentIndicator sentiment="positive" score={0.75} /><div className="flex-1"><p className="font-medium">Apple announces new product line</p></div></div></CardContent></Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />AI Trading Assistant</CardTitle>
            <CardDescription>Ask questions about signals, strategies, and market analysis</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ChatInterface />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
