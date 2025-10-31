import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { executionService, OrderStatus } from '@/services/executionApi';
import { Clock, CheckCircle, XCircle, RotateCcw, Zap } from 'lucide-react';

interface OrderStatusPanelProps {
  orderId: string;
  onClose?: () => void;
}

export const OrderStatusPanel = ({ orderId, onClose }: OrderStatusPanelProps) => {
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrderStatus();
    
    // Start polling for status updates
    const stopPolling = executionService.pollOrderStatus(orderId, (newStatus) => {
      setStatus(newStatus);
      setLoading(false);
    });

    return stopPolling;
  }, [orderId]);

  const loadOrderStatus = async () => {
    try {
      const orderStatus = await executionService.getOrderStatus(orderId);
      setStatus(orderStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order status');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!status) return;
    
    try {
      await executionService.retryOrder(orderId);
      // Status will be updated via polling
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry order');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'filled':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'queued':
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      filled: 'default',
      queued: 'secondary',
      processing: 'secondary',
      failed: 'destructive',
      rejected: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'queued': return 25;
      case 'processing': return 75;
      case 'filled': return 100;
      case 'failed':
      case 'rejected': return 0;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!status) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Order Status</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.status)}
            <span className="font-medium">Order {status.order_id.slice(-8)}</span>
          </div>
          {getStatusBadge(status.status)}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Execution Progress</span>
            <span>{getProgressValue(status.status)}%</span>
          </div>
          <Progress value={getProgressValue(status.status)} />
        </div>

        {/* Execution Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {status.execution_latency_ms && (
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <div>
                <div className="font-medium">Latency</div>
                <div className="text-muted-foreground">
                  {status.execution_latency_ms.toFixed(1)}ms
                </div>
              </div>
            </div>
          )}
          
          {status.task_id && (
            <div>
              <div className="font-medium">Task ID</div>
              <div className="text-muted-foreground font-mono text-xs">
                {status.task_id.slice(-8)}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm font-medium text-red-800">Error</div>
            <div className="text-sm text-red-600">{status.error}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {(status.status === 'failed' || status.status === 'rejected') && (
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry Order
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={loadOrderStatus}>
            Refresh
          </Button>
        </div>

        {/* Status Timeline */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Timeline</div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Queued</span>
              <span>✓</span>
            </div>
            {status.status !== 'queued' && (
              <div className="flex justify-between">
                <span>Processing</span>
                <span>{['processing', 'filled'].includes(status.status) ? '✓' : '⏳'}</span>
              </div>
            )}
            {status.status === 'filled' && (
              <div className="flex justify-between">
                <span>Filled</span>
                <span>✓</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};