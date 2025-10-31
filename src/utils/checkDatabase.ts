import { supabase } from '@/integrations/supabase/client';

export const checkDatabase = async () => {
  try {
    // Check if symbols table exists and has data
    const { data: symbols, error: symbolsError } = await supabase
      .from('symbols')
      .select('*')
      .limit(5);

    // Check if signals table has asset_type column
    const { data: signals, error: signalsError } = await supabase
      .from('signals')
      .select('symbol, asset_type')
      .limit(5);

    return {
      symbolsTable: {
        exists: !symbolsError,
        count: symbols?.length || 0,
        data: symbols || [],
        error: symbolsError?.message
      },
      signalsAssetType: {
        exists: !signalsError,
        count: signals?.length || 0,
        hasAssetType: signals?.some(s => s.asset_type) || false,
        error: signalsError?.message
      }
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};