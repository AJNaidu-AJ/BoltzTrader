import { supabase } from '@/integrations/supabase/client';

export interface MarketplaceStrategy {
  id: string;
  name: string;
  description: string;
  price: number;
  creator_id: string;
  creator_name: string;
  creator_avatar?: string;
  rating: number;
  review_count: number;
  download_count: number;
  is_purchased: boolean;
  performance_metrics: {
    total_return: number;
    sharpe_ratio: number;
    max_drawdown: number;
    win_rate: number;
  };
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface StrategyReview {
  id: string;
  strategy_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface PurchaseResult {
  success: boolean;
  payment_url?: string;
  error?: string;
}

class MarketplaceService {
  async getMarketplaceStrategies(filters: {
    search?: string;
    sort?: string;
    filter?: string;
  }): Promise<MarketplaceStrategy[]> {
    try {
      let query = supabase
        .from('marketplace_strategies')
        .select(`
          *,
          creator:profiles(full_name, avatar_url),
          purchases:strategy_purchases(user_id)
        `)
        .eq('status', 'approved');

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.filter === 'free') {
        query = query.eq('price', 0);
      } else if (filters.filter === 'paid') {
        query = query.gt('price', 0);
      }

      switch (filters.sort) {
        case 'downloads':
          query = query.order('download_count', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        default:
          query = query.order('rating', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      
      return (data || []).map(strategy => ({
        ...strategy,
        creator_name: strategy.creator?.full_name || 'Unknown',
        creator_avatar: strategy.creator?.avatar_url,
        is_purchased: user ? strategy.purchases.some((p: any) => p.user_id === user.id) : false
      }));
    } catch (error) {
      console.error('Error fetching marketplace strategies:', error);
      return this.getMockStrategies();
    }
  }

  async publishStrategy(strategyId: string, price: number, description: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('marketplace_strategies')
      .insert({
        strategy_id: strategyId,
        creator_id: user.id,
        price,
        description,
        status: 'pending'
      });

    if (error) throw error;
  }

  async purchaseStrategy(strategyId: string): Promise<PurchaseResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get strategy details
      const { data: strategy, error: strategyError } = await supabase
        .from('marketplace_strategies')
        .select('*')
        .eq('id', strategyId)
        .single();

      if (strategyError) throw strategyError;

      if (strategy.price === 0) {
        // Free strategy - direct purchase
        const { error } = await supabase
          .from('strategy_purchases')
          .insert({
            strategy_id: strategyId,
            user_id: user.id,
            amount: 0,
            status: 'completed'
          });

        if (error) throw error;

        // Update download count
        await this.incrementDownloadCount(strategyId);

        return { success: true };
      } else {
        // Paid strategy - create payment session
        const paymentUrl = await this.createPaymentSession(strategyId, strategy.price);
        return { success: true, payment_url: paymentUrl };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Purchase failed' };
    }
  }

  async createPaymentSession(strategyId: string, amount: number): Promise<string> {
    // Mock payment URL - integrate with Stripe/Razorpay
    return `https://checkout.stripe.com/pay/cs_test_${strategyId}_${amount}`;
  }

  async addReview(strategyId: string, rating: number, comment: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('strategy_reviews')
      .insert({
        strategy_id: strategyId,
        user_id: user.id,
        rating,
        comment
      });

    if (error) throw error;

    // Update strategy rating
    await this.updateStrategyRating(strategyId);
  }

  async getStrategyReviews(strategyId: string): Promise<StrategyReview[]> {
    const { data, error } = await supabase
      .from('strategy_reviews')
      .select(`
        *,
        user:profiles(full_name)
      `)
      .eq('strategy_id', strategyId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(review => ({
      ...review,
      user_name: review.user?.full_name || 'Anonymous'
    }));
  }

  private async incrementDownloadCount(strategyId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_download_count', {
      strategy_id: strategyId
    });
    if (error) console.error('Error incrementing download count:', error);
  }

  private async updateStrategyRating(strategyId: string): Promise<void> {
    const { error } = await supabase.rpc('update_strategy_rating', {
      strategy_id: strategyId
    });
    if (error) console.error('Error updating strategy rating:', error);
  }

  private getMockStrategies(): MarketplaceStrategy[] {
    return [
      {
        id: '1',
        name: 'RSI Momentum Pro',
        description: 'Advanced RSI strategy with momentum filters',
        price: 29.99,
        creator_id: 'creator1',
        creator_name: 'John Trader',
        rating: 4.5,
        review_count: 23,
        download_count: 156,
        is_purchased: false,
        performance_metrics: {
          total_return: 18.5,
          sharpe_ratio: 1.8,
          max_drawdown: -8.2,
          win_rate: 0.68
        },
        tags: ['RSI', 'Momentum', 'Day Trading'],
        status: 'approved',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Mean Reversion Master',
        description: 'Bollinger Bands mean reversion strategy',
        price: 0,
        creator_id: 'creator2',
        creator_name: 'Sarah Analytics',
        rating: 4.2,
        review_count: 45,
        download_count: 289,
        is_purchased: false,
        performance_metrics: {
          total_return: 12.3,
          sharpe_ratio: 1.4,
          max_drawdown: -5.1,
          win_rate: 0.72
        },
        tags: ['Bollinger Bands', 'Mean Reversion', 'Free'],
        status: 'approved',
        created_at: '2024-01-10T14:30:00Z'
      }
    ];
  }
}

export const marketplaceService = new MarketplaceService();