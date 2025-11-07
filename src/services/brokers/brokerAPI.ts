import { encryptData, decryptData } from './encryptUtil';
import { logAudit } from '@/utils/auditLogger';

// Mock supabase for now - replace with actual supabase client
const mockSupabase = {
  from: (table: string) => ({
    insert: async (data: any[]) => {
      console.log(`🔐 Mock DB Insert to ${table}:`, data);
      return { data: data.map(d => ({ ...d, id: `broker_${Date.now()}` })), error: null };
    },
    select: (columns: string) => ({
      eq: (column: string, value: any) => ({
        data: [
          {
            id: 'broker_1',
            user_id: value,
            broker_name: 'BINANCE',
            api_key: encryptData('mock_api_key'),
            api_secret: encryptData('mock_api_secret'),
            access_token: 'mock_token',
            created_at: new Date().toISOString()
          }
        ],
        error: null
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => {
        console.log(`🗑️ Mock DB Delete from broker_accounts where ${column} = ${value}`);
        return { error: null };
      }
    })
  })
};

export async function linkBrokerAccount(userId: string, broker: string, credentials: any) {
  const encryptedKey = encryptData(credentials.apiKey);
  const encryptedSecret = encryptData(credentials.apiSecret);

  const { data, error } = await mockSupabase.from('broker_accounts').insert([{
    user_id: userId,
    broker_name: broker,
    api_key: encryptedKey,
    api_secret: encryptedSecret,
    access_token: credentials.accessToken
  }]);

  if (error) throw error;
  
  await logAudit('broker_account', userId, 'LINK', userId, { broker });
  console.log(`✅ Broker account linked: ${broker} for user ${userId}`);
  
  return data;
}

export async function getBrokerAccounts(userId: string) {
  const { data } = await mockSupabase.from('broker_accounts').select('*').eq('user_id', userId);
  
  return data.map(acc => ({
    ...acc,
    api_key: decryptData(acc.api_key),
    api_secret: decryptData(acc.api_secret)
  }));
}

export async function unlinkBrokerAccount(userId: string, brokerId: string) {
  const { error } = await mockSupabase.from('broker_accounts').delete().eq('id', brokerId);
  
  if (error) throw error;
  
  await logAudit('broker_account', brokerId, 'UNLINK', userId, {});
  console.log(`🔓 Broker account unlinked: ${brokerId} for user ${userId}`);
  
  return true;
}