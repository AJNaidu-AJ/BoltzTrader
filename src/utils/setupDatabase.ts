import { supabase } from '@/integrations/supabase/client';

export const setupDatabase = async () => {
  try {
    console.log('Setting up database...');

    // 1. Insert sample symbols
    const { error: symbolsError } = await supabase
      .from('symbols')
      .upsert([
        { symbol: 'AAPL', name: 'Apple Inc.', asset_type: 'equity', sector: 'Technology', exchange: 'NASDAQ' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', asset_type: 'equity', sector: 'Technology', exchange: 'NASDAQ' },
        { symbol: 'TSLA', name: 'Tesla Inc.', asset_type: 'equity', sector: 'Consumer Cyclical', exchange: 'NASDAQ' },
        { symbol: 'BTC-USD', name: 'Bitcoin', asset_type: 'crypto', sector: 'Cryptocurrency', exchange: 'Binance' },
        { symbol: 'ETH-USD', name: 'Ethereum', asset_type: 'crypto', sector: 'Cryptocurrency', exchange: 'Binance' },
        { symbol: 'SPY', name: 'SPDR S&P 500 ETF', asset_type: 'etf', sector: 'Broad Market', exchange: 'NYSE' }
      ], { onConflict: 'symbol' });

    if (symbolsError) {
      console.error('Error inserting symbols:', symbolsError);
    } else {
      console.log('✓ Symbols inserted successfully');
    }

    // 2. Insert sample signals with rule matches
    const { error: signalsError } = await supabase
      .from('signals')
      .upsert([
        {
          symbol: 'AAPL',
          company_name: 'Apple Inc.',
          current_price: 150.25,
          price_change: 2.50,
          price_change_percent: 1.69,
          volume: 45000000,
          confidence: 85,
          rank: 'top',
          sector: 'Technology',
          asset_type: 'equity',
          timeframe: '1d',
          rule_matches: [
            { name: 'RSI Signal', value: 'RSI at 65.2', weight: 0.3 },
            { name: 'Volume Surge', value: '2.1x average', weight: 0.25 },
            { name: 'Price Momentum', value: '1.7% up', weight: 0.3 }
          ]
        },
        {
          symbol: 'BTC-USD',
          company_name: 'Bitcoin',
          current_price: 42500.00,
          price_change: 1250.00,
          price_change_percent: 3.03,
          volume: 28000000,
          confidence: 78,
          rank: 'top',
          sector: 'Cryptocurrency',
          asset_type: 'crypto',
          timeframe: '1d',
          rule_matches: [
            { name: 'Breakout Pattern', value: 'Above resistance', weight: 0.4 },
            { name: 'High Volume', value: '1.8x average', weight: 0.25 },
            { name: 'Momentum', value: '3.0% up', weight: 0.35 }
          ]
        },
        {
          symbol: 'SPY',
          company_name: 'SPDR S&P 500 ETF',
          current_price: 475.80,
          price_change: -1.20,
          price_change_percent: -0.25,
          volume: 12000000,
          confidence: 65,
          rank: 'medium',
          sector: 'Broad Market',
          asset_type: 'etf',
          timeframe: '1d',
          rule_matches: [
            { name: 'Support Level', value: 'Near key support', weight: 0.3 },
            { name: 'Market Sentiment', value: 'Neutral', weight: 0.2 },
            { name: 'Technical Score', value: '65% confidence', weight: 0.5 }
          ]
        }
      ], { onConflict: 'symbol' });

    if (signalsError) {
      console.error('Error inserting signals:', signalsError);
    } else {
      console.log('✓ Signals with rule matches inserted successfully');
    }

    return { success: true };
  } catch (error) {
    console.error('Database setup failed:', error);
    return { success: false, error };
  }
};