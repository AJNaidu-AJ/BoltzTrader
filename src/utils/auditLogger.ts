import { supabase } from '@/lib/supabaseClient'

// Browser-compatible hash function
async function createHash(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function logAudit(
  entity: string, 
  entityId: string, 
  action: string, 
  performedBy: string, 
  payload: any
): Promise<void> {
  try {
    const auditData = { entity, entityId, action, performedBy, payload, timestamp: Date.now() }
    const hash = await createHash(JSON.stringify(auditData))

    const { error } = await supabase.from('audit_ledger').insert([{
      entity,
      entity_id: entityId,
      action,
      performed_by: performedBy,
      payload,
      hash
    }])

    if (error) {
      console.error('Audit logging failed:', error)
      return
    }

    console.log(`✅ Audit logged: ${entity} → ${action}`)
  } catch (error) {
    console.error('Audit logging error:', error)
  }
}

export async function verifyAuditIntegrity(auditId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('audit_ledger')
      .select('*')
      .eq('id', auditId)
      .single()

    if (error || !data) return false

    const auditData = {
      entity: data.entity,
      entityId: data.entity_id,
      action: data.action,
      performedBy: data.performed_by,
      payload: data.payload,
      timestamp: new Date(data.created_at).getTime()
    }

    const computedHash = await createHash(JSON.stringify(auditData))
    return computedHash === data.hash
  } catch (error) {
    console.error('Audit verification error:', error)
    return false
  }
}