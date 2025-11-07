import { evaluatePerformance } from './evaluator';
import { logAudit } from '@/utils/auditLogger';

// Mock supabase for now - replace with actual supabase client
const mockSupabase = {
  from: (table: string) => ({
    insert: (data: any[]) => ({
      select: () => ({
        single: async () => {
          const mockData = { id: `feedback_${Date.now()}`, ...data[0] };
          console.log(`📊 Mock DB Insert to ${table}:`, mockData);
          return { data: mockData, error: null };
        }
      })
    })
  })
};

export async function recordFeedback(
  strategyId: string, 
  aiReturn: number, 
  benchmarkReturn: number, 
  userId: string, 
  benchmark: string
) {
  const { alpha, reward, outcome } = evaluatePerformance(aiReturn, benchmarkReturn);

  // Insert feedback entry
  const { data, error } = await mockSupabase.from('ai_feedback').insert([{
    strategy_id: strategyId,
    user_id: userId,
    benchmark,
    ai_return: aiReturn,
    benchmark_return: benchmarkReturn,
    alpha,
    reward,
    outcome,
  }]).select().single();

  if (error) throw error;

  // 🔐 Governance / Audit Log
  await logAudit(
    'ai_feedback',
    data.id,
    'RECORD',
    userId,
    { strategyId, benchmark, aiReturn, benchmarkReturn, alpha, reward, outcome }
  );

  console.log(`📘 Feedback + Audit logged → Strategy:${strategyId} Outcome:${outcome}`);
  return { alpha, reward, outcome };
}