import { supabase } from '@/integrations/supabase/client';
import { auditService } from './auditService';

interface APIKey {
  id: string;
  name: string;
  key: string;
  secret: string;
  permissions: string[];
  rate_limit: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

interface APIUsage {
  api_key_id: string;
  endpoint: string;
  method: string;
  requests_count: number;
  date: string;
}

interface EnterpriseSubscription {
  user_id: string;
  plan: 'pro' | 'enterprise' | 'institutional';
  features: string[];
  api_quota: number;
  custom_limits: Record<string, number>;
  status: 'active' | 'suspended' | 'cancelled';
  billing_cycle: 'monthly' | 'annual';
  price: number;
}

class EnterpriseAPIService {
  async generateAPIKey(name: string, permissions: string[], rateLimit: number = 1000): Promise<APIKey> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user has enterprise subscription
    const hasAccess = await this.checkEnterpriseAccess(user.id);
    if (!hasAccess) throw new Error('Enterprise subscription required');

    const apiKey = this.generateSecureKey();
    const apiSecret = this.generateSecureKey();

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name,
        key: apiKey,
        secret: apiSecret,
        permissions,
        rate_limit: rateLimit,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    await auditService.logEvent('api_key_created', {
      api_key_id: data.id,
      name,
      permissions,
      rate_limit: rateLimit
    }, 'medium');

    return data;
  }

  async getAPIKeys(): Promise<APIKey[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  async revokeAPIKey(keyId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId)
      .eq('user_id', user.id);

    if (error) throw error;

    await auditService.logEvent('api_key_revoked', { api_key_id: keyId }, 'medium');
  }

  async validateAPIKey(key: string, endpoint: string): Promise<{ valid: boolean; keyData?: APIKey }> {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key', key)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      await auditService.logSecurityEvent('invalid_api_key', { key, endpoint });
      return { valid: false };
    }

    // Check rate limits
    const withinLimits = await this.checkRateLimit(data.id, data.rate_limit);
    if (!withinLimits) {
      await auditService.logSecurityEvent('rate_limit_exceeded', { 
        api_key_id: data.id, 
        endpoint 
      });
      return { valid: false };
    }

    // Check permissions
    const hasPermission = this.checkEndpointPermission(endpoint, data.permissions);
    if (!hasPermission) {
      await auditService.logSecurityEvent('insufficient_permissions', { 
        api_key_id: data.id, 
        endpoint,
        permissions: data.permissions
      });
      return { valid: false };
    }

    // Log API usage
    await this.logAPIUsage(data.id, endpoint, 'GET');

    return { valid: true, keyData: data };
  }

  async getAPIUsage(keyId: string, days: number = 30): Promise<APIUsage[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('api_usage')
      .select('*')
      .eq('api_key_id', keyId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createEnterpriseSubscription(plan: EnterpriseSubscription['plan']): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const planConfig = this.getPlanConfiguration(plan);

    const { error } = await supabase
      .from('enterprise_subscriptions')
      .upsert({
        user_id: user.id,
        plan,
        features: planConfig.features,
        api_quota: planConfig.apiQuota,
        custom_limits: planConfig.customLimits,
        status: 'active',
        billing_cycle: 'monthly',
        price: planConfig.price
      });

    if (error) throw error;

    await auditService.logEvent('enterprise_subscription_created', {
      user_id: user.id,
      plan,
      price: planConfig.price
    }, 'low');
  }

  async checkEnterpriseAccess(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('enterprise_subscriptions')
      .select('status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    return !!data;
  }

  private generateSecureKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async checkRateLimit(keyId: string, limit: number): Promise<boolean> {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const { data } = await supabase
      .from('api_requests')
      .select('id')
      .eq('api_key_id', keyId)
      .gte('created_at', hourAgo.toISOString());

    return (data?.length || 0) < limit;
  }

  private checkEndpointPermission(endpoint: string, permissions: string[]): boolean {
    const endpointPermissions = {
      '/api/signals': ['signals:read'],
      '/api/trades': ['trades:read', 'trades:write'],
      '/api/portfolio': ['portfolio:read'],
      '/api/strategies': ['strategies:read', 'strategies:write'],
      '/api/market-data': ['market:read']
    };

    const requiredPermissions = endpointPermissions[endpoint as keyof typeof endpointPermissions] || [];
    return requiredPermissions.some(perm => permissions.includes(perm));
  }

  private async logAPIUsage(keyId: string, endpoint: string, method: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    await supabase.rpc('increment_api_usage', {
      p_api_key_id: keyId,
      p_endpoint: endpoint,
      p_method: method,
      p_date: today
    });
  }

  private getPlanConfiguration(plan: EnterpriseSubscription['plan']) {
    const configs = {
      pro: {
        features: ['api_access', 'advanced_analytics', 'priority_support'],
        apiQuota: 10000,
        customLimits: { signals_per_day: 100 },
        price: 99
      },
      enterprise: {
        features: ['api_access', 'advanced_analytics', 'priority_support', 'custom_integrations', 'dedicated_support'],
        apiQuota: 100000,
        customLimits: { signals_per_day: 1000 },
        price: 499
      },
      institutional: {
        features: ['api_access', 'advanced_analytics', 'priority_support', 'custom_integrations', 'dedicated_support', 'white_label'],
        apiQuota: 1000000,
        customLimits: { signals_per_day: 10000 },
        price: 2499
      }
    };

    return configs[plan];
  }
}

export const enterpriseApiService = new EnterpriseAPIService();
export type { APIKey, APIUsage, EnterpriseSubscription };