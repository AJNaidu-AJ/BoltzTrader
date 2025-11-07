import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface AuditLog {
  id: string;
  entity: string;
  action: string;
  outcome?: string;
  reward?: number;
  user_id: string;
  timestamp: string;
}

export function AuditDashboard() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    // Mock audit logs for AI feedback
    const mockLogs: AuditLog[] = [
      {
        id: 'audit_1',
        entity: 'ai_feedback',
        action: 'RECORD',
        outcome: 'positive',
        reward: 0.37,
        user_id: 'user_104',
        timestamp: '2025-11-07T02:00:00Z'
      },
      {
        id: 'audit_2',
        entity: 'ai_feedback',
        action: 'RECORD',
        outcome: 'negative',
        reward: -0.21,
        user_id: 'user_107',
        timestamp: '2025-11-07T02:01:00Z'
      },
      {
        id: 'audit_3',
        entity: 'ai_feedback',
        action: 'RECORD',
        outcome: 'positive',
        reward: 0.15,
        user_id: 'user_109',
        timestamp: '2025-11-07T02:02:00Z'
      }
    ];
    setAuditLogs(mockLogs);
  }, []);

  const getOutcomeBadge = (outcome: string) => {
    const variant = outcome === 'positive' ? 'default' : outcome === 'negative' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{outcome}</Badge>;
  };

  const aiFeedbackLogs = auditLogs.filter(log => log.entity === 'ai_feedback');

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Feedback Audit Logs</CardTitle>
        <p className="text-sm text-muted-foreground">
          Compliance tracking for AI learning feedback system
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Strategy</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aiFeedbackLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">
                  {log.id.replace('audit_', 'STRAT-')}
                </TableCell>
                <TableCell>
                  {log.outcome && getOutcomeBadge(log.outcome)}
                </TableCell>
                <TableCell>
                  <span className={log.reward && log.reward > 0 ? 'text-green-600' : 'text-red-600'}>
                    {log.reward ? (log.reward > 0 ? '+' : '') + log.reward.toFixed(2) : 'N/A'}
                  </span>
                </TableCell>
                <TableCell>{log.user_id}</TableCell>
                <TableCell>
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}