import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Signal API
export const signalApi = {
  getAll: async (filters?: { sector?: string; rank?: string; assetType?: string; limit?: number }) => {
    let query = supabase
      .from('signals')
      .select('*')
      .eq('is_active', true)
      .order('confidence', { ascending: false });

    if (filters?.sector) query = query.eq('sector', filters.sector);
    if (filters?.rank) query = query.eq('rank', filters.rank);
    if (filters?.assetType) query = query.eq('asset_type', filters.assetType);
    if (filters?.limit) query = query.limit(filters.limit);

    return query;
  },

  getById: (id: string) => 
    supabase.from('signals').select('*').eq('id', id).single(),

  create: (signal: TablesInsert<'signals'>) =>
    supabase.from('signals').insert(signal).select().single(),

  update: (id: string, updates: TablesUpdate<'signals'>) =>
    supabase.from('signals').update(updates).eq('id', id).select().single(),

  delete: (id: string) =>
    supabase.from('signals').delete().eq('id', id)
};

// Sector API
export const sectorApi = {
  getAll: () => 
    supabase.from('sectors').select('*').order('performance_1d', { ascending: false }),

  getById: (id: string) =>
    supabase.from('sectors').select('*').eq('id', id).single(),

  update: (id: string, updates: TablesUpdate<'sectors'>) =>
    supabase.from('sectors').update(updates).eq('id', id).select().single()
};

// Watchlist API
export const watchlistApi = {
  getByUserId: (userId: string) =>
    supabase.from('watchlists').select('*').eq('user_id', userId).order('sort_order'),

  create: (watchlist: TablesInsert<'watchlists'>) =>
    supabase.from('watchlists').insert(watchlist).select().single(),

  update: (id: string, updates: TablesUpdate<'watchlists'>) =>
    supabase.from('watchlists').update(updates).eq('id', id).select().single(),

  delete: (id: string) =>
    supabase.from('watchlists').delete().eq('id', id)
};

// Notification API
export const notificationApi = {
  getByUserId: (userId: string) =>
    supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),

  markAsRead: (id: string) =>
    supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id),

  create: (notification: TablesInsert<'notifications'>) =>
    supabase.from('notifications').insert(notification).select().single()
};

// User Preferences API
export const userPreferencesApi = {
  getByUserId: (userId: string) =>
    supabase.from('user_preferences').select('*').eq('user_id', userId).single(),

  upsert: (preferences: TablesInsert<'user_preferences'>) =>
    supabase.from('user_preferences').upsert(preferences).select().single()
};

// Symbols API
export const symbolsApi = {
  getAll: (assetType?: string) => {
    let query = supabase.from('symbols').select('*').eq('is_active', true);
    if (assetType) query = query.eq('asset_type', assetType);
    return query.order('symbol');
  },

  getBySymbol: (symbol: string) =>
    supabase.from('symbols').select('*').eq('symbol', symbol).single(),

  create: (symbol: TablesInsert<'symbols'>) =>
    supabase.from('symbols').insert(symbol).select().single(),

  update: (id: string, updates: TablesUpdate<'symbols'>) =>
    supabase.from('symbols').update(updates).eq('id', id).select().single()
};