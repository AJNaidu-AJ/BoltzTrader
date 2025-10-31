import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { marketplaceService, MarketplaceStrategy } from '@/services/marketplaceService';
import { useToast } from '@/components/ui/use-toast';
import { Star, Download, DollarSign, Search, TrendingUp } from 'lucide-react';

export const StrategyMarketplace = () => {
  const { toast } = useToast();
  const [strategies, setStrategies] = useState<MarketplaceStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    loadStrategies();
  }, [sortBy, filterBy]);

  const loadStrategies = async () => {
    try {
      setLoading(true);
      const data = await marketplaceService.getMarketplaceStrategies({
        search: searchTerm,
        sort: sortBy,
        filter: filterBy
      });
      setStrategies(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load strategies", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (strategyId: string, price: number) => {
    try {
      const result = await marketplaceService.purchaseStrategy(strategyId);
      if (result.success) {
        toast({ title: "Success", description: "Strategy purchased successfully!" });
        loadStrategies();
      }
    } catch (error) {
      toast({ title: "Error", description: "Purchase failed", variant: "destructive" });
    }
  };

  const renderRating = (rating: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
      <span className="text-sm text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );

  const getPriceDisplay = (strategy: MarketplaceStrategy) => {
    if (strategy.price === 0) return 'Free';
    if (strategy.is_purchased) return 'Owned';
    return `$${strategy.price}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Strategy Marketplace</h1>
          <p className="text-muted-foreground">Discover and purchase trading strategies from the community</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search strategies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="downloads">Most Popular</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="trending">Trending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2 mb-4" />
                <div className="h-20 bg-muted rounded mb-4" />
                <div className="h-8 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map((strategy) => (
            <Card key={strategy.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {strategy.description}
                    </p>
                  </div>
                  <Badge variant={strategy.price === 0 ? 'secondary' : 'default'}>
                    {getPriceDisplay(strategy)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={strategy.creator_avatar} />
                    <AvatarFallback>{strategy.creator_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{strategy.creator_name}</p>
                    <p className="text-xs text-muted-foreground">Creator</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {renderRating(strategy.rating)}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Download className="h-4 w-4" />
                    {strategy.download_count}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Return:</span>
                    <span className={`ml-1 font-medium ${strategy.performance_metrics.total_return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {strategy.performance_metrics.total_return > 0 ? '+' : ''}{strategy.performance_metrics.total_return}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sharpe:</span>
                    <span className="ml-1 font-medium">{strategy.performance_metrics.sharpe_ratio}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {strategy.is_purchased ? (
                    <Button className="flex-1" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1"
                      onClick={() => handlePurchase(strategy.id, strategy.price)}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      {strategy.price === 0 ? 'Get Free' : `Buy $${strategy.price}`}
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {strategies.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No strategies found</p>
        </div>
      )}
    </div>
  );
};