interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  published_at: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentiment_score: number;
  symbols: string[];
}

interface NewsResponse {
  news: NewsItem[];
  total_count: number;
}

class NewsService {
  private baseUrl = import.meta.env.VITE_SCORING_SERVICE_URL || 'http://localhost:8000';

  async getMarketNews(symbols?: string, limit = 20, hoursBack = 24): Promise<NewsResponse> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        hours_back: hoursBack.toString()
      });

      if (symbols) {
        params.append('symbols', symbols);
      }

      const response = await fetch(`${this.baseUrl}/api/news?${params}`);
      
      if (!response.ok) {
        throw new Error(`News API failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('News API error:', error);
      // Return fallback data
      return {
        news: [],
        total_count: 0
      };
    }
  }

  async getNewsForSymbol(symbol: string): Promise<NewsItem[]> {
    const response = await this.getMarketNews(symbol, 10);
    return response.news;
  }

  getSentimentColor(sentiment: string): string {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getSentimentIcon(sentiment: string): string {
    switch (sentiment) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      default: return '📊';
    }
  }

  formatTimeAgo(publishedAt: string): string {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffMs = now.getTime() - published.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return published.toLocaleDateString();
  }
}

export const newsService = new NewsService();
export type { NewsItem, NewsResponse };