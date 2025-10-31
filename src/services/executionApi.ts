interface ExecuteOrderRequest {
  user_id: string;
  signal_id?: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  order_type?: 'market' | 'limit';
  price?: number;
  broker?: string;
  is_paper_trade?: boolean;
}

interface ExecuteOrderResponse {
  order_id: string;
  task_id: string;
  status: string;
  message: string;
}

interface OrderStatus {
  order_id: string;
  status: string;
  execution_latency_ms?: number;
  task_id?: string;
  error?: string;
}

interface PnLSummary {
  user_id: string;
  total_pnl: number;
  positions: Record<string, {
    quantity: number;
    avg_cost: number;
    total_cost: number;
  }>;
  calculated_at: string;
}

interface ExecutionMetrics {
  total_executions: number;
  success_rate: number;
  average_latency_ms: number;
  recent_metrics: Array<{
    symbol: string;
    broker: string;
    execution_latency_ms: number;
    status: string;
    timestamp: string;
  }>;
}

class ExecutionService {
  private baseUrl = import.meta.env.VITE_EXECUTION_SERVICE_URL || 'http://localhost:8001';

  async executeOrder(request: ExecuteOrderRequest): Promise<ExecuteOrderResponse> {
    const response = await fetch(`${this.baseUrl}/api/orders/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Execution failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    const response = await fetch(`${this.baseUrl}/api/orders/status/${orderId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get order status: ${response.statusText}`);
    }

    return await response.json();
  }

  async retryOrder(orderId: string): Promise<{ task_id: string; status: string }> {
    const response = await fetch(`${this.baseUrl}/api/orders/retry/${orderId}`, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Failed to retry order: ${response.statusText}`);
    }

    return await response.json();
  }

  async getUserOrders(userId: string, limit = 50, offset = 0) {
    const response = await fetch(
      `${this.baseUrl}/api/orders/user/${userId}?limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error(`Failed to get user orders: ${response.statusText}`);
    }

    const data = await response.json();
    return data.orders;
  }

  async getUserPnL(userId: string, symbol?: string): Promise<PnLSummary> {
    const url = symbol 
      ? `${this.baseUrl}/api/pnl/${userId}?symbol=${symbol}`
      : `${this.baseUrl}/api/pnl/${userId}`;
      
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to get PnL: ${response.statusText}`);
    }

    return await response.json();
  }

  async getExecutionMetrics(): Promise<ExecutionMetrics> {
    const response = await fetch(`${this.baseUrl}/api/metrics/execution`);

    if (!response.ok) {
      throw new Error(`Failed to get execution metrics: ${response.statusText}`);
    }

    return await response.json();
  }

  // Polling utility for real-time order status updates
  pollOrderStatus(orderId: string, onUpdate: (status: OrderStatus) => void, intervalMs = 2000): () => void {
    const interval = setInterval(async () => {
      try {
        const status = await this.getOrderStatus(orderId);
        onUpdate(status);
        
        // Stop polling if order is in final state
        if (['filled', 'cancelled', 'rejected', 'failed'].includes(status.status)) {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }
}

export const executionService = new ExecutionService();
export type { ExecuteOrderRequest, ExecuteOrderResponse, OrderStatus, PnLSummary, ExecutionMetrics };