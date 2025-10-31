import { supabase } from '@/integrations/supabase/client';

interface KYCDocument {
  id: string;
  type: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill' | 'bank_statement';
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
}

interface KYCProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  phone: string;
  occupation: string;
  source_of_funds: string;
  risk_level: 'low' | 'medium' | 'high';
  status: 'incomplete' | 'pending' | 'approved' | 'rejected';
  documents: KYCDocument[];
}

interface AMLCheck {
  user_id: string;
  check_type: 'sanctions' | 'pep' | 'adverse_media';
  result: 'clear' | 'match' | 'error';
  details: any;
  checked_at: string;
}

class KYCService {
  async submitKYCProfile(profile: Partial<KYCProfile>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('kyc_profiles')
      .upsert({
        user_id: user.id,
        ...profile,
        status: 'pending',
        submitted_at: new Date().toISOString()
      });

    if (error) throw error;

    // Trigger AML checks
    await this.performAMLChecks(user.id);
  }

  async uploadDocument(file: File, type: KYCDocument['type']): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileName = `${user.id}/${type}_${Date.now()}.${file.name.split('.').pop()}`;
    
    const { data, error } = await supabase.storage
      .from('kyc-documents')
      .upload(fileName, file);

    if (error) throw error;

    // Save document record
    await supabase
      .from('kyc_documents')
      .insert({
        user_id: user.id,
        type,
        file_path: data.path,
        status: 'pending'
      });

    return data.path;
  }

  async getKYCStatus(): Promise<KYCProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('kyc_profiles')
      .select(`
        *,
        documents:kyc_documents(*)
      `)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async performAMLChecks(userId: string): Promise<void> {
    const checks = ['sanctions', 'pep', 'adverse_media'];
    
    for (const checkType of checks) {
      try {
        const result = await this.runAMLCheck(userId, checkType as AMLCheck['check_type']);
        
        await supabase
          .from('aml_checks')
          .insert({
            user_id: userId,
            check_type: checkType,
            result: result.status,
            details: result.details,
            checked_at: new Date().toISOString()
          });
      } catch (error) {
        console.error(`AML check failed for ${checkType}:`, error);
      }
    }
  }

  private async runAMLCheck(userId: string, checkType: string): Promise<{ status: string; details: any }> {
    // Mock AML check - integrate with actual AML provider (Chainalysis, Elliptic, etc.)
    const mockResults = {
      sanctions: { status: 'clear', details: { matches: 0 } },
      pep: { status: 'clear', details: { matches: 0 } },
      adverse_media: { status: 'clear', details: { matches: 0 } }
    };

    return mockResults[checkType as keyof typeof mockResults] || { status: 'error', details: {} };
  }

  async approveKYC(userId: string, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('kyc_profiles')
      .update({
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;

    // Log audit event
    await this.logAuditEvent('kyc_approved', { userId, adminId });
  }

  async rejectKYC(userId: string, adminId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('kyc_profiles')
      .update({
        status: 'rejected',
        rejected_by: adminId,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('user_id', userId);

    if (error) throw error;

    // Log audit event
    await this.logAuditEvent('kyc_rejected', { userId, adminId, reason });
  }

  async isKYCApproved(userId?: string): Promise<boolean> {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) return false;

    const { data } = await supabase
      .from('kyc_profiles')
      .select('status')
      .eq('user_id', targetUserId)
      .single();

    return data?.status === 'approved';
  }

  private async logAuditEvent(event: string, details: any): Promise<void> {
    await supabase
      .from('audit_logs')
      .insert({
        event_type: event,
        details,
        timestamp: new Date().toISOString()
      });
  }
}

export const kycService = new KYCService();
export type { KYCProfile, KYCDocument, AMLCheck };