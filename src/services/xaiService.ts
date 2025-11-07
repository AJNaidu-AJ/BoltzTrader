import { supabase } from '@/lib/supabaseClient'

export interface XAIReasoning {
  id?: string
  strategy_id: string
  decision: any
  gpt_reasoning: string
  confidence_score: number
  created_at?: string
}

export async function storeXAI(
  strategyId: string, 
  decision: any, 
  gptReasoning: string, 
  confidence: number
): Promise<void> {
  try {
    const { error } = await supabase.from('xai_reasoning').insert([{
      strategy_id: strategyId,
      decision,
      gpt_reasoning: gptReasoning,
      confidence_score: confidence
    }])

    if (error) {
      console.error('XAI storage failed:', error)
      return
    }

    console.log(`✅ XAI reasoning stored for strategy: ${strategyId}`)
  } catch (error) {
    console.error('XAI storage error:', error)
  }
}

export async function getXAIHistory(strategyId: string): Promise<XAIReasoning[]> {
  try {
    const { data, error } = await supabase
      .from('xai_reasoning')
      .select('*')
      .eq('strategy_id', strategyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('XAI history fetch failed:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('XAI history error:', error)
    return []
  }
}

export async function getXAIInsights(strategyId: string): Promise<{
  averageConfidence: number
  totalDecisions: number
  recentReasoning: string[]
}> {
  try {
    const history = await getXAIHistory(strategyId)
    
    if (history.length === 0) {
      return {
        averageConfidence: 0,
        totalDecisions: 0,
        recentReasoning: []
      }
    }

    const averageConfidence = history.reduce((sum, item) => sum + item.confidence_score, 0) / history.length
    const recentReasoning = history.slice(0, 5).map(item => item.gpt_reasoning)

    return {
      averageConfidence,
      totalDecisions: history.length,
      recentReasoning
    }
  } catch (error) {
    console.error('XAI insights error:', error)
    return {
      averageConfidence: 0,
      totalDecisions: 0,
      recentReasoning: []
    }
  }
}