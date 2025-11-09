import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { stockSearchService, Stock } from '@/services/stockSearchService';
import { Search } from 'lucide-react';

export const StockSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchStocks = async () => {
      if (query.length < 1) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const stocks = await stockSearchService.searchStocks(query);
        setResults(stocks);
      } catch (error) {
        console.error('Stock search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchStocks, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-green-400/70" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stocks (e.g., RELIANCE, TCS)"
          className="pl-10 bg-black border-green-500/30 text-green-400 font-mono"
        />
      </div>
      
      {results.length > 0 && (
        <Card className="absolute top-12 left-0 right-0 z-50 bg-black/95 border-green-500/30 max-h-60 overflow-y-auto">
          <CardContent className="p-2">
            {results.map((stock) => (
              <div
                key={stock.instrument_token}
                className="p-2 hover:bg-green-500/10 cursor-pointer border-b border-green-500/20 last:border-b-0"
                onClick={() => {
                  setQuery(stock.symbol);
                  setResults([]);
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-mono text-green-400 font-bold">{stock.symbol}</div>
                    <div className="text-xs text-green-400/70">{stock.name}</div>
                  </div>
                  <div className="text-xs text-green-400/70">{stock.exchange}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};