import { supabase } from '@/lib/supabaseClient'

export interface CompliancePolicy {
  id: string
  region: string
  kyc_required: boolean
  aml_checks: boolean
  max_trade_volume: number
  require_2fa: boolean
  created_at?: string
}

export const policyEngine = {
  async getPolicy(region: string): Promise<CompliancePolicy> {
    const { data, error } = await supabase
      .from('compliance_policies')
      .select('*')
      .eq('region', region)
      .single()
    
    if (error) {
      // Return default policy if none found
      return {
        id: 'default',
        region,
        kyc_required: true,
        aml_checks: true,
        max_trade_volume: 100000,
        require_2fa: true
      }
    }
    return data
  },

  async enforcePolicy(region: string, user: any): Promise<boolean> {
    const policy = await this.getPolicy(region)
    
    if (policy.kyc_required && !user.kyc_verified) {
      throw new Error('KYC verification required for this region.')
    }
    
    if (policy.require_2fa && !user.two_factor_enabled) {
      throw new Error('2FA is mandatory for this region.')
    }
    
    return true
  },

  async validateTradeVolume(region: string, amount: number): Promise<boolean> {
    const policy = await this.getPolicy(region)
    
    if (amount > policy.max_trade_volume) {
      throw new Error(`Trade volume exceeds maximum allowed: ${policy.max_trade_volume}`)
    }
    
    return true
  }
}