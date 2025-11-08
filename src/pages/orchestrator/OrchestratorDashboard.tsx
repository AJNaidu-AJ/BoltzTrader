import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"

interface Model {
  id: string
  model_name: string
  version: string
  status: string
  performance_metrics: any
  created_at: string
}

interface AuditEvent {
  id: string
  model_id: string
  event_type: string
  details: any
  created_at: string
}

export default function OrchestratorDashboard() {
  const [models, setModels] = useState<Model[]>([])
  const [audits, setAudits] = useState<AuditEvent[]>([])
  const [stats, setStats] = useState({ total: 0, production: 0, staging: 0 })

  useEffect(() => {
    const loadData = async () => {
      const { data: modelData } = await supabase
        .from("ai_model_registry")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      const { data: auditData } = await supabase
        .from("model_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)

      if (modelData) {
        setModels(modelData)
        const total = modelData.length
        const production = modelData.filter(m => m.status === 'production').length
        const staging = modelData.filter(m => m.status === 'staging').length
        setStats({ total, production, staging })
      }

      if (auditData) setAudits(auditData)
    }
    loadData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'production': return 'bg-green-500'
      case 'staging': return 'bg-yellow-500'
      case 'rejected': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Models</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.production}</div>
            <div className="text-sm text-gray-600">Production</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.staging}</div>
            <div className="text-sm text-gray-600">Staging</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Registry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {models.map((model) => (
              <div key={model.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">{model.model_name}</div>
                  <div className="text-sm text-gray-600">v{model.version}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(model.status)}>
                    {model.status}
                  </Badge>
                  {model.performance_metrics?.accuracy && (
                    <span className="text-sm">
                      {(model.performance_metrics.accuracy * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {audits.map((audit) => (
              <div key={audit.id} className="flex items-center justify-between p-2 border-b">
                <div>
                  <span className="font-medium">{audit.event_type}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    {new Date(audit.created_at).toLocaleString()}
                  </span>
                </div>
                <Badge variant="outline">{audit.model_id?.slice(0, 8) || 'System'}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}