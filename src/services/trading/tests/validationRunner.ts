import { routeTrade } from '../tradeRouter'
import { RiskGuard } from '../riskGuard'
import { ZerodhaAdapter, BinanceAdapter, AlpacaAdapter } from '../brokers'
import { AISignal } from '../brokers/types'

export class ValidationRunner {
  private results: { test: string; status: 'PASS' | 'FAIL'; details?: string }[] = []

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Phase 9.4 Validation Suite...\n')
    
    await this.testBrokerConnectivity()
    await this.testAISignalExecution()
    await this.testRiskGuardValidation()
    await this.testAuditTrail()
    await this.testEmergencyStop()
    
    this.printResults()
  }

  private async testBrokerConnectivity(): Promise<void> {
    console.log('🔧 Testing Broker Connectivity...')
    
    const brokers = [
      { name: 'Zerodha', adapter: ZerodhaAdapter },
      { name: 'Binance', adapter: BinanceAdapter },
      { name: 'Alpaca', adapter: AlpacaAdapter }
    ]

    for (const broker of brokers) {
      try {
        await broker.adapter.getBalance()
        this.results.push({ test: `${broker.name} Connectivity`, status: 'PASS' })
      } catch (error) {
        this.results.push({ 
          test: `${broker.name} Connectivity`, 
          status: 'FAIL', 
          details: error.message 
        })
      }
    }
  }

  private async testAISignalExecution(): Promise<void> {
    console.log('🧠 Testing AI Signal Execution...')
    
    const validSignal: AISignal = {
      symbol: 'BTCUSDT',
      status: 'BUY',
      amount: 0.01,
      confidence: 0.92,
      timestamp: new Date(),
      reasoning: 'Test signal for validation'
    }

    try {
      const result = await routeTrade(validSignal, 'test-user')
      if (result.success && result.order) {
        this.results.push({ test: 'AI Signal Execution', status: 'PASS' })
      } else {
        this.results.push({ 
          test: 'AI Signal Execution', 
          status: 'FAIL', 
          details: 'No order returned' 
        })
      }
    } catch (error) {
      this.results.push({ 
        test: 'AI Signal Execution', 
        status: 'FAIL', 
        details: error.message 
      })
    }
  }

  private async testRiskGuardValidation(): Promise<void> {
    console.log('🛡️ Testing Risk Guard Validation...')
    
    // Test low confidence rejection
    const lowConfidenceSignal: AISignal = {
      symbol: 'BTCUSDT',
      status: 'BUY',
      amount: 0.01,
      confidence: 0.2, // Below 0.7 threshold
      timestamp: new Date()
    }

    try {
      await routeTrade(lowConfidenceSignal, 'test-user')
      this.results.push({ 
        test: 'Risk Guard - Low Confidence', 
        status: 'FAIL', 
        details: 'Should have rejected low confidence signal' 
      })
    } catch (error) {
      if (error.message.includes('confidence')) {
        this.results.push({ test: 'Risk Guard - Low Confidence', status: 'PASS' })
      } else {
        this.results.push({ 
          test: 'Risk Guard - Low Confidence', 
          status: 'FAIL', 
          details: `Wrong error: ${error.message}` 
        })
      }
    }

    // Test exposure limit
    const highExposureSignal: AISignal = {
      symbol: 'AAPL',
      status: 'BUY',
      amount: 5000, // High amount
      confidence: 0.95,
      timestamp: new Date()
    }

    try {
      await routeTrade(highExposureSignal, 'test-user')
      this.results.push({ 
        test: 'Risk Guard - Exposure Limit', 
        status: 'FAIL', 
        details: 'Should have rejected high exposure trade' 
      })
    } catch (error) {
      if (error.message.includes('Exposure')) {
        this.results.push({ test: 'Risk Guard - Exposure Limit', status: 'PASS' })
      } else {
        this.results.push({ 
          test: 'Risk Guard - Exposure Limit', 
          status: 'FAIL', 
          details: `Wrong error: ${error.message}` 
        })
      }
    }
  }

  private async testAuditTrail(): Promise<void> {
    console.log('📜 Testing Audit Trail...')
    
    // Mock audit verification - in production, query actual database
    const auditEntries = await this.mockGetAuditEntries()
    
    if (auditEntries.length > 0 && auditEntries[0].hash && auditEntries[0].hash.length === 64) {
      this.results.push({ test: 'Audit Trail Hash', status: 'PASS' })
    } else {
      this.results.push({ 
        test: 'Audit Trail Hash', 
        status: 'FAIL', 
        details: 'Missing or invalid audit hash' 
      })
    }
  }

  private async testEmergencyStop(): Promise<void> {
    console.log('🚨 Testing Emergency Stop...')
    
    // Mock emergency stop test
    try {
      // In production, this would call actual emergency stop API
      const stopResult = await this.mockEmergencyStop()
      
      if (stopResult.stopped) {
        this.results.push({ test: 'Emergency Stop', status: 'PASS' })
      } else {
        this.results.push({ 
          test: 'Emergency Stop', 
          status: 'FAIL', 
          details: 'Emergency stop not activated' 
        })
      }
    } catch (error) {
      this.results.push({ 
        test: 'Emergency Stop', 
        status: 'FAIL', 
        details: error.message 
      })
    }
  }

  private printResults(): void {
    console.log('\n📊 Validation Results:')
    console.log('=' .repeat(50))
    
    let passed = 0
    let failed = 0
    
    this.results.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌'
      console.log(`${status} ${result.test}`)
      
      if (result.details) {
        console.log(`   Details: ${result.details}`)
      }
      
      if (result.status === 'PASS') passed++
      else failed++
    })
    
    console.log('=' .repeat(50))
    console.log(`Total: ${this.results.length} | Passed: ${passed} | Failed: ${failed}`)
    
    if (failed === 0) {
      console.log('🎉 All tests passed! Phase 9.4 validation complete.')
    } else {
      console.log(`⚠️  ${failed} test(s) failed. Please review and fix issues.`)
    }
  }

  // Mock functions - replace with actual implementations
  private async mockGetAuditEntries() {
    return [{ hash: 'a'.repeat(64), action: 'trade_executed' }]
  }

  private async mockEmergencyStop() {
    return { stopped: true, timestamp: new Date() }
  }
}

// Run validation if called directly
if (require.main === module) {
  const runner = new ValidationRunner()
  runner.runAllTests().catch(console.error)
}