import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { newsService, NewsItem } from '@/services/newsApi';
import { RefreshCw, ExternalLink, TrendingUp, Clock } from 'lucide-react';

interface MarketFeedProps {
  symbols?: string[];
  maxItems?: number;
  autoRefresh?: boolean;
}

export const MarketFeed = ({ symbols, maxItems = 10, autoRefresh = true }: MarketFeedProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNews();
    
    if (autoRefresh) {
      const interval = setInterval(loadNews, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [symbols, autoRefresh]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const symbolsStr = symbols?.join(',');
      const response = await newsService.getMarketNews(symbolsStr, maxItems);
      setNews(response.news);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentBadge = (sentiment: string, score: number) => {
    const variants = {
      positive: 'default',
      negative: 'destructive',
      neutral: 'secondary'
    } as const;

    return (
      <Badge variant={variants[sentiment as keyof typeof variants] || 'secondary'} className="text-xs">
        {newsService.getSentimentIcon(sentiment)} {sentiment}
      </Badge>
    );
  };

  if (loading && news.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Feed
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={loadNews} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="text-center text-red-500 text-sm mb-4">{error}</div>
        )}
        
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {news.map((item) => (
              <div key={item.id} className="border-b border-border pb-4 last:border-b-0">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">{item.source}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {newsService.formatTimeAgo(item.published_at)}
                      </div>
                    </div>
                    {getSentimentBadge(item.sentiment, item.sentiment_score)}
                  </div>

                  <h4 className="font-medium text-sm leading-tight hover:text-primary cursor-pointer">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2">
                      <span className="flex-1">{item.title}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 mt-0.5" />
                    </a>
                  </h4>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.summary}
                  </p>

                  {item.symbols.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.symbols.map((symbol) => (
                        <Badge key={symbol} variant="outline" className="text-xs px-1 py-0">
                          {symbol}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {news.length === 0 && !loading && (
              <div className="text-center text-muted-foreground text-sm py-8">
                No news available at the moment
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};