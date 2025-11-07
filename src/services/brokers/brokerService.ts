export interface BrokerAdapter {
  placeOrder(symbol: string, side: 'buy' | 'sell', qty: number, price?: number): Promise<any>;
  getPositions(): Promise<any[]>;
  getBalance(): Promise<any>;
  cancelOrder(orderId: string): Promise<any>;
}

export interface TradeSignal {
  symbol: string;
  side: 'buy' | 'sell';
  qty: number;
  price?: number;
  confidence: number;
  amount: number;
  balance: number;
}

export interface BrokerCredentials {
  user_id: string;
  api_key: string;
  api_secret: string;
  access_token?: string;
}