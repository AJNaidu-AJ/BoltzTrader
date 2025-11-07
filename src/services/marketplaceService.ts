import { supabase } from '@/lib/supabaseClient'
import { logAudit } from '@/utils/auditLogger'

export interface StrategyListing {
  id?: string
  strategy_id: string
  creator_id: string
  title: string
  description: string
  price: number
  currency: string
  tags: string[]
  is_public: boolean
  is_paid: boolean
}

export interface Purchase {
  id?: string
  listing_id: string
  buyer_id: string
  amount: number
  currency: string
  payment_provider: string
  status: 'pending' | 'completed' | 'refunded' | 'failed'
}

export const marketplaceService = {
  // Listings
  async createListing(listing: StrategyListing): Promise<StrategyListing> {
    const { data, error } = await supabase
      .from('strategy_marketplace')
      .insert([listing])
      .select()
      .single()

    if (error) throw error

    await logAudit('marketplace_listing', data.id, 'CREATE', listing.creator_id, listing)
    return data
  },

  async getListings(filters?: {
    search?: string
    tags?: string[]
    creator_id?: string
    page?: number
    limit?: number
  }): Promise<StrategyListing[]> {
    let query = supabase
      .from('strategy_marketplace')
      .select('*')
      .eq('status', 'active')
      .eq('is_public', true)

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`)
    }

    if (filters?.creator_id) {
      query = query.eq('creator_id', filters.creator_id)
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const offset = (page - 1) * limit

    const { data, error } = await query
      .order('total_sales', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  },

  async getListing(id: string): Promise<StrategyListing | null> {
    const { data, error } = await supabase
      .from('strategy_marketplace')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  },

  // Purchases
  async createPurchase(purchase: Omit<Purchase, 'id'>): Promise<Purchase> {
    const { data, error } = await supabase
      .from('strategy_purchases')
      .insert([purchase])
      .select()
      .single()

    if (error) throw error

    await logAudit('marketplace_purchase', data.id, 'CREATE', purchase.buyer_id, purchase)
    return data
  },

  async updatePurchaseStatus(purchaseId: string, status: Purchase['status']): Promise<void> {
    const { error } = await supabase
      .from('strategy_purchases')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', purchaseId)

    if (error) throw error

    if (status === 'completed') {
      await this.grantAccess(purchaseId)
    }

    await logAudit('marketplace_purchase', purchaseId, 'UPDATE_STATUS', 'system', { status })
  },

  async grantAccess(purchaseId: string): Promise<void> {
    // Get purchase details
    const { data: purchase } = await supabase
      .from('strategy_purchases')
      .select('*, strategy_marketplace(strategy_id)')
      .eq('id', purchaseId)
      .single()

    if (!purchase) return

    // Grant access
    const { error } = await supabase
      .from('user_strategy_access')
      .insert([{
        user_id: purchase.buyer_id,
        strategy_id: purchase.strategy_marketplace.strategy_id,
        listing_id: purchase.listing_id,
        access_type: 'purchased'
      }])

    if (error) throw error

    // Increment sales count
    await supabase
      .from('strategy_marketplace')
      .update({ 
        total_sales: supabase.raw('total_sales + 1')
      })
      .eq('id', purchase.listing_id)

    await logAudit('marketplace_access', purchase.buyer_id, 'GRANT', 'system', {
      strategy_id: purchase.strategy_marketplace.strategy_id,
      purchase_id: purchaseId
    })
  },

  // User access
  async hasAccess(userId: string, strategyId: string): Promise<boolean> {
    const { data } = await supabase
      .from('user_strategy_access')
      .select('id')
      .eq('user_id', userId)
      .eq('strategy_id', strategyId)
      .single()

    return !!data
  },

  // Creator payouts
  async requestPayout(creatorId: string): Promise<void> {
    // Calculate pending earnings
    const { data: purchases } = await supabase
      .from('strategy_purchases')
      .select('amount, strategy_marketplace!inner(creator_id)')
      .eq('status', 'completed')
      .eq('strategy_marketplace.creator_id', creatorId)

    if (!purchases || purchases.length === 0) return

    const totalAmount = purchases.reduce((sum, p) => sum + p.amount, 0)
    const platformFee = totalAmount * 0.3 // 30% platform fee
    const payoutAmount = totalAmount - platformFee

    const { error } = await supabase
      .from('creator_payouts')
      .insert([{
        creator_id: creatorId,
        amount: payoutAmount,
        currency: 'USD',
        status: 'queued'
      }])

    if (error) throw error

    await logAudit('marketplace_payout', creatorId, 'REQUEST', creatorId, {
      amount: payoutAmount,
      total_sales: totalAmount
    })
  }
}