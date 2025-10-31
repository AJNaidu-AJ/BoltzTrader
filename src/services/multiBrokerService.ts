interface BrokerConfig {
  id: string;
  name: string;
  region: string;
  supportedMarkets: string[];
  apiEndpoint: string;
  authType: 'oauth' | 'api_key' | 'token';
  features: string[];
}

interface BrokerAccount {
  brokerId: string;
  accountId: string;
  balance: number;
  currency: string;
  isActive: boolean;
}

interface OrderRequest {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  orderType: 'market' | 'limit' | 'stop';
  price?: number;
  stopPrice?: number;
}

abstract class BrokerAdapter {
  protected config: BrokerConfig;

  constructor(config: BrokerConfig) {
    this.config = config;
  }

  abstract authenticate(credentials: any): Promise<boolean>;
  abstract getAccount(): Promise<BrokerAccount>;
  abstract placeOrder(order: OrderRequest): Promise<any>;
  abstract getPositions(): Promise<any[]>;
  abstract getOrders(): Promise<any[]>;
  abstract cancelOrder(orderId: string): Promise<boolean>;
}

class ZerodhaAdapter extends BrokerAdapter {
  async authenticate(credentials: { apiKey: string; accessToken: string }): Promise<boolean> {
    // Zerodha Kite Connect authentication
    return true;
  }

  async getAccount(): Promise<BrokerAccount> {
    return {
      brokerId: 'zerodha',
      accountId: 'ZD1234',
      balance: 50000,
      currency: 'INR',
      isActive: true
    };
  }

  async placeOrder(order: OrderRequest): Promise<any> {
    return {
      orderId: `ZD_${Date.now()}`,
      status: 'pending',
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity
    };
  }

  async getPositions(): Promise<any[]> {
    return [];
  }

  async getOrders(): Promise<any[]> {
    return [];
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    return true;
  }
}

class AlpacaAdapter extends BrokerAdapter {
  async authenticate(credentials: { apiKey: string; secretKey: string }): Promise<boolean> {
    // Alpaca API authentication
    return true;
  }

  async getAccount(): Promise<BrokerAccount> {
    return {
      brokerId: 'alpaca',
      accountId: 'ALP1234',
      balance: 25000,
      currency: 'USD',
      isActive: true
    };
  }

  async placeOrder(order: OrderRequest): Promise<any> {
    return {
      orderId: `ALP_${Date.now()}`,
      status: 'pending',
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity
    };
  }

  async getPositions(): Promise<any[]> {
    return [];
  }

  async getOrders(): Promise<any[]> {
    return [];
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    return true;
  }
}

class InteractiveBrokersAdapter extends BrokerAdapter {
  async authenticate(credentials: { username: string; password: string }): Promise<boolean> {
    // IB TWS/Gateway authentication
    return true;
  }

  async getAccount(): Promise<BrokerAccount> {
    return {
      brokerId: 'interactive_brokers',
      accountId: 'IB1234',
      balance: 100000,
      currency: 'USD',
      isActive: true
    };
  }

  async placeOrder(order: OrderRequest): Promise<any> {
    return {
      orderId: `IB_${Date.now()}`,
      status: 'pending',
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity
    };
  }

  async getPositions(): Promise<any[]> {
    return [];
  }

  async getOrders(): Promise<any[]> {
    return [];
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    return true;
  }
}

class MultiBrokerService {
  private brokers: Map<string, BrokerConfig> = new Map();
  private adapters: Map<string, BrokerAdapter> = new Map();
  private activeAccounts: Map<string, BrokerAccount> = new Map();

  constructor() {
    this.initializeBrokers();
  }

  private initializeBrokers(): void {
    const brokerConfigs: BrokerConfig[] = [
      {
        id: 'zerodha',
        name: 'Zerodha',
        region: 'asia',
        supportedMarkets: ['NSE', 'BSE'],
        apiEndpoint: 'https://api.kite.trade',
        authType: 'api_key',
        features: ['stocks', 'options', 'futures']
      },
      {
        id: 'alpaca',
        name: 'Alpaca',
        region: 'us',
        supportedMarkets: ['NYSE', 'NASDAQ'],
        apiEndpoint: 'https://paper-api.alpaca.markets',
        authType: 'api_key',
        features: ['stocks', 'crypto']
      },
      {
        id: 'interactive_brokers',
        name: 'Interactive Brokers',
        region: 'global',
        supportedMarkets: ['NYSE', 'NASDAQ', 'LSE', 'TSE'],
        apiEndpoint: 'https://localhost:5000',
        authType: 'oauth',
        features: ['stocks', 'options', 'futures', 'forex', 'crypto']
      }
    ];

    brokerConfigs.forEach(config => {
      this.brokers.set(config.id, config);
      this.createAdapter(config);
    });
  }

  private createAdapter(config: BrokerConfig): void {
    let adapter: BrokerAdapter;

    switch (config.id) {
      case 'zerodha':
        adapter = new ZerodhaAdapter(config);
        break;
      case 'alpaca':
        adapter = new AlpacaAdapter(config);
        break;
      case 'interactive_brokers':
        adapter = new InteractiveBrokersAdapter(config);
        break;
      default:
        throw new Error(`Unknown broker: ${config.id}`);
    }

    this.adapters.set(config.id, adapter);
  }

  getBrokers(region?: string): BrokerConfig[] {
    const allBrokers = Array.from(this.brokers.values());
    return region 
      ? allBrokers.filter(b => b.region === region || b.region === 'global')
      : allBrokers;
  }

  async connectBroker(brokerId: string, credentials: any): Promise<boolean> {
    const adapter = this.adapters.get(brokerId);
    if (!adapter) throw new Error(`Broker not found: ${brokerId}`);

    const authenticated = await adapter.authenticate(credentials);
    if (authenticated) {
      const account = await adapter.getAccount();
      this.activeAccounts.set(brokerId, account);
    }

    return authenticated;
  }

  async placeOrder(brokerId: string, order: OrderRequest): Promise<any> {
    const adapter = this.adapters.get(brokerId);
    if (!adapter) throw new Error(`Broker not found: ${brokerId}`);

    const account = this.activeAccounts.get(brokerId);
    if (!account) throw new Error(`Broker not connected: ${brokerId}`);

    return await adapter.placeOrder(order);
  }

  async getAggregatedPositions(): Promise<any[]> {
    const allPositions = [];

    for (const [brokerId, adapter] of this.adapters.entries()) {
      if (this.activeAccounts.has(brokerId)) {
        try {
          const positions = await adapter.getPositions();
          allPositions.push(...positions.map(p => ({ ...p, brokerId })));
        } catch (error) {
          console.error(`Error fetching positions from ${brokerId}:`, error);
        }
      }
    }

    return allPositions;
  }

  async getAggregatedBalance(): Promise<{ total: number; byBroker: Record<string, number> }> {
    let total = 0;
    const byBroker: Record<string, number> = {};

    for (const [brokerId, account] of this.activeAccounts.entries()) {
      byBroker[brokerId] = account.balance;
      total += account.balance;
    }

    return { total, byBroker };
  }

  getActiveAccounts(): BrokerAccount[] {
    return Array.from(this.activeAccounts.values());
  }

  disconnectBroker(brokerId: string): void {
    this.activeAccounts.delete(brokerId);
  }
}

export const multiBrokerService = new MultiBrokerService();
export type { BrokerConfig, BrokerAccount, OrderRequest };