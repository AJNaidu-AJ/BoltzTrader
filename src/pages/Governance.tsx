import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, FileText, Brain, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface CompliancePolicy {
  id: string
  region: string
  kyc_required: boolean
  aml_checks: boolean
  max_trade_volume: number
  require_2fa: boolean
  created_at: string
}

interface AuditLog {
  id: string
  entity: string
  action: string
  performed_by: string
  created_at: string
  hash: string
}

export default function Governance() {
  const [policies, setPolicies] = useState<CompliancePolicy[]>([])
  const [audits, setAudits] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load policies with fallback data
      const { data: policiesData } = await supabase
        .from('compliance_policies')
        .select('*')
        .order('created_at', { ascending: false })

      // Load audit logs with fallback data
      const { data: auditsData } = await supabase
        .from('audit_ledger')
        .select('*')
        .limit(20)
        .order('created_at', { ascending: false })

      setPolicies(policiesData || [
        {
          id: '1',
          region: 'US',
          kyc_required: true,
          aml_checks: true,
          max_trade_volume: 100000,
          require_2fa: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          region: 'EU',
          kyc_required: true,
          aml_checks: true,
          max_trade_volume: 50000,
          require_2fa: true,
          created_at: new Date().toISOString()
        }
      ])

      setAudits(auditsData || [
        {
          id: '1',
          entity: 'trade',
          action: 'EXECUTE',
          performed_by: 'user@example.com',
          created_at: new Date().toISOString(),
          hash: 'abc123...'
        }
      ])
    } catch (error) {
      console.error('Failed to load governance data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading governance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Governance & Compliance</h1>
          <p className="text-gray-600">Manage policies, audit trails, and regulatory compliance</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Shield className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Policies</p>
                <p className="text-2xl font-bold text-gray-900">{policies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Audit Entries</p>
                <p className="text-2xl font-bold text-gray-900">{audits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">XAI Decisions</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Violations</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Compliance Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Region</th>
                  <th className="text-left p-2">KYC Required</th>
                  <th className="text-left p-2">AML Checks</th>
                  <th className="text-left p-2">2FA Required</th>
                  <th className="text-left p-2">Max Volume</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id} className="border-b">
                    <td className="p-2 font-medium">{policy.region}</td>
                    <td className="p-2">
                      <Badge variant={policy.kyc_required ? "default" : "secondary"}>
                        {policy.kyc_required ? "Required" : "Optional"}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant={policy.aml_checks ? "default" : "secondary"}>
                        {policy.aml_checks ? "Enabled" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant={policy.require_2fa ? "default" : "secondary"}>
                        {policy.require_2fa ? "Required" : "Optional"}
                      </Badge>
                    </td>
                    <td className="p-2">${policy.max_trade_volume.toLocaleString()}</td>
                    <td className="p-2">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Recent Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Entity</th>
                  <th className="text-left p-2">Action</th>
                  <th className="text-left p-2">Performed By</th>
                  <th className="text-left p-2">Timestamp</th>
                  <th className="text-left p-2">Hash</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((audit) => (
                  <tr key={audit.id} className="border-b">
                    <td className="p-2 font-medium">{audit.entity}</td>
                    <td className="p-2">
                      <Badge variant="outline">{audit.action}</Badge>
                    </td>
                    <td className="p-2">{audit.performed_by}</td>
                    <td className="p-2">
                      {new Date(audit.created_at).toLocaleString()}
                    </td>
                    <td className="p-2 font-mono text-xs">
                      {audit.hash.substring(0, 12)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}