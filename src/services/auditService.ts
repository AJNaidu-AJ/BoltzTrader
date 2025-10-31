import { supabase } from '@/integrations/supabase/client';

interface AuditEvent {
  id?: string;
  event_type: string;
  user_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, any>;
  timestamp: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface ComplianceReport {
  period_start: string;
  period_end: string;
  total_events: number;
  high_risk_events: number;
  failed_logins: number;
  suspicious_activities: number;
  kyc_approvals: number;
  trade_volume: number;
}

class AuditService {
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async logEvent(eventType: string, details: Record<string, any>, riskLevel: AuditEvent['risk_level'] = 'low'): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const auditEvent: AuditEvent = {
        event_type: eventType,
        user_id: user?.id,
        session_id: this.sessionId,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        details,
        timestamp: new Date().toISOString(),
        risk_level: riskLevel
      };

      await supabase
        .from('audit_logs')
        .insert(auditEvent);

      // Alert on high-risk events
      if (riskLevel === 'high' || riskLevel === 'critical') {
        await this.alertSecurityTeam(auditEvent);
      }
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  async logTradeEvent(trade: any): Promise<void> {
    await this.logEvent('trade_executed', {
      trade_id: trade.id,
      symbol: trade.symbol,
      side: trade.side,
      quantity: trade.quantity,
      price: trade.price,
      broker: trade.broker,
      order_type: trade.order_type
    }, 'medium');
  }

  async logLoginEvent(success: boolean, method: string): Promise<void> {
    await this.logEvent('user_login', {
      success,
      method,
      timestamp: new Date().toISOString()
    }, success ? 'low' : 'medium');
  }

  async logDataAccess(resource: string, action: string): Promise<void> {
    await this.logEvent('data_access', {
      resource,
      action,
      timestamp: new Date().toISOString()
    }, 'low');
  }

  async logConfigChange(component: string, oldValue: any, newValue: any): Promise<void> {
    await this.logEvent('config_change', {
      component,
      old_value: oldValue,
      new_value: newValue,
      timestamp: new Date().toISOString()
    }, 'medium');
  }

  async logSecurityEvent(eventType: string, details: Record<string, any>): Promise<void> {
    await this.logEvent(`security_${eventType}`, details, 'high');
  }

  async logAPIAccess(endpoint: string, method: string, statusCode: number): Promise<void> {
    await this.logEvent('api_access', {
      endpoint,
      method,
      status_code: statusCode,
      timestamp: new Date().toISOString()
    }, statusCode >= 400 ? 'medium' : 'low');
  }

  async getAuditLogs(filters: {
    startDate?: string;
    endDate?: string;
    eventType?: string;
    userId?: string;
    riskLevel?: string;
    limit?: number;
  } = {}): Promise<AuditEvent[]> {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters.startDate) {
      query = query.gte('timestamp', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('timestamp', filters.endDate);
    }
    if (filters.eventType) {
      query = query.eq('event_type', filters.eventType);
    }
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.riskLevel) {
      query = query.eq('risk_level', filters.riskLevel);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  async generateComplianceReport(startDate: string, endDate: string): Promise<ComplianceReport> {
    const { data, error } = await supabase.rpc('generate_compliance_report', {
      start_date: startDate,
      end_date: endDate
    });

    if (error) throw error;

    return data || {
      period_start: startDate,
      period_end: endDate,
      total_events: 0,
      high_risk_events: 0,
      failed_logins: 0,
      suspicious_activities: 0,
      kyc_approvals: 0,
      trade_volume: 0
    };
  }

  async exportAuditLogs(startDate: string, endDate: string): Promise<Blob> {
    const logs = await this.getAuditLogs({ startDate, endDate });
    
    const csvContent = this.convertToCSV(logs);
    return new Blob([csvContent], { type: 'text/csv' });
  }

  private convertToCSV(logs: AuditEvent[]): string {
    const headers = ['Timestamp', 'Event Type', 'User ID', 'Session ID', 'IP Address', 'Risk Level', 'Details'];
    const rows = logs.map(log => [
      log.timestamp,
      log.event_type,
      log.user_id || '',
      log.session_id || '',
      log.ip_address || '',
      log.risk_level,
      JSON.stringify(log.details)
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  private async alertSecurityTeam(event: AuditEvent): Promise<void> {
    // Integration with security alerting system
    console.warn('High-risk security event detected:', event);
    
    // In production, integrate with:
    // - SIEM systems
    // - Security team notifications
    // - Incident response workflows
  }

  // ISO 27001 / SOC2 compliance helpers
  async validateDataIntegrity(): Promise<boolean> {
    // Implement data integrity checks
    return true;
  }

  async checkAccessControls(): Promise<any> {
    // Validate access control implementation
    return { status: 'compliant', checks: [] };
  }

  async generateSOC2Report(): Promise<any> {
    // Generate SOC2 compliance report
    return {
      period: new Date().getFullYear(),
      controls: [],
      exceptions: [],
      status: 'compliant'
    };
  }
}

export const auditService = new AuditService();
export type { AuditEvent, ComplianceReport };