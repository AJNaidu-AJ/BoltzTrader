import { ZerodhaAdapter, BinanceAdapter, AlpacaAdapter } from './brokers'
import { logAudit } from '@/utils/auditLogger'

export interface BrokerHealth {
  name: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  latency?: number
  lastCheck: Date
  error?: string
}

export class BrokerHealthChecker {
  private healthCache: Map<string, BrokerHealth> = new Map()
  private readonly CACHE_TTL = 30000 // 30 seconds

  async checkAllBrokers(): Promise<Record<string, string>> {
    const brokers = [
      { name: 'Zerodha', adapter: ZerodhaAdapter },
      { name: 'Binance', adapter: BinanceAdapter },
      { name: 'Alpaca', adapter: AlpacaAdapter }
    ]

    const results: Record<string, string> = {}
    
    for (const broker of brokers) {
      const health = await this.checkBrokerHealth(broker.name, broker.adapter)
      results[broker.name] = health.status
    }

    return results
  }

  async checkBrokerHealth(brokerName: string, adapter: any): Promise<BrokerHealth> {
    const cached = this.healthCache.get(brokerName)
    const now = new Date()
    
    // Return cached result if still valid
    if (cached && (now.getTime() - cached.lastCheck.getTime()) < this.CACHE_TTL) {
      return cached
    }

    const startTime = Date.now()
    let health: BrokerHealth = {
      name: brokerName,
      status: 'unhealthy',
      lastCheck: now
    }

    try {
      // Test basic connectivity with balance check
      await Promise.race([
        adapter.getBalance(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ])
      
      const latency = Date.now() - startTime
      health = {
        name: brokerName,
        status: latency > 2000 ? 'degraded' : 'healthy',
        latency,
        lastCheck: now
      }

      await logAudit('broker_health_check', brokerName, 'HEALTHY', 'HealthChecker', {
        latency,
        status: health.status
      })

    } catch (error) {
      health = {
        name: brokerName,
        status: 'unhealthy',
        lastCheck: now,
        error: error.message
      }

      await logAudit('broker_health_check', brokerName, 'UNHEALTHY', 'HealthChecker', {
        error: error.message
      })
    }

    this.healthCache.set(brokerName, health)
    return health
  }

  async getDetailedHealth(): Promise<BrokerHealth[]> {
    const brokers = [
      { name: 'Zerodha', adapter: ZerodhaAdapter },
      { name: 'Binance', adapter: BinanceAdapter },
      { name: 'Alpaca', adapter: AlpacaAdapter }
    ]

    const healthChecks = brokers.map(broker => 
      this.checkBrokerHealth(broker.name, broker.adapter)
    )

    return Promise.all(healthChecks)
  }

  clearCache(): void {
    this.healthCache.clear()
  }

  getHealthSummary(): { healthy: number; unhealthy: number; degraded: number } {
    const summary = { healthy: 0, unhealthy: 0, degraded: 0 }
    
    for (const health of this.healthCache.values()) {
      summary[health.status]++
    }
    
    return summary
  }
}

export const brokerHealthChecker = new BrokerHealthChecker()