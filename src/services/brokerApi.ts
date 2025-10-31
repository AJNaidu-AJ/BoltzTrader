interface PlaceOrderRequest {
  userId: string;
  signalId?: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  orderType?: 'market' | 'limit' | 'stop';
  price?: number;
  broker?: 'zerodha' | 'alpaca' | 'paper';
  isPaperTrade?: boolean;
}

interface PlaceOrderResponse {
  success: boolean;
  tradeId: string;
  brokerOrderId: string;
  status: string;
  message: string;
}

interface Trade {
  id: string;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  status: string;
  broker: string;
  is_paper_trade: boolean;
  created_at: string;
  filled_at?: string;
  signals?: {
    symbol: string;
    company_name: string;
    confidence: number;
  };
}

class BrokerService {
  private baseUrl = import.meta.env.VITE_BROKER_SERVICE_URL || 'http://localhost:3002';

  async placeOrder(request: PlaceOrderRequest): Promise<PlaceOrderResponse> {
    const response = await fetch(`${this.baseUrl}/place-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Order failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async simulateOrder(request: PlaceOrderRequest): Promise<PlaceOrderResponse> {
    const response = await fetch(`${this.baseUrl}/simulate-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...request, isPaperTrade: true })
    });

    if (!response.ok) {
      throw new Error(`Simulation failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async getUserTrades(userId: string, limit = 50, offset = 0): Promise<Trade[]> {
    const response = await fetch(
      `${this.baseUrl}/trades/${userId}?limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch trades: ${response.statusText}`);
    }

    const data = await response.json();
    return data.trades;
  }
}

export const brokerService = new BrokerService();
export type { PlaceOrderRequest, PlaceOrderResponse, Trade };