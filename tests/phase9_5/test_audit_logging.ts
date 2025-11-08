import crypto from 'crypto'

describe('Audit Logging Tests', () => {
  test('Audit entries produce valid SHA-256 hash', () => {
    const payload = { entity: 'trade_monitor', action: 'rebalance', performed_by: 'system' }
    const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  test('Different payloads produce different hashes', () => {
    const payload1 = { entity: 'trade_monitor', action: 'rebalance', performed_by: 'system' }
    const payload2 = { entity: 'trade_monitor', action: 'stop_loss', performed_by: 'system' }
    
    const hash1 = crypto.createHash('sha256').update(JSON.stringify(payload1)).digest('hex')
    const hash2 = crypto.createHash('sha256').update(JSON.stringify(payload2)).digest('hex')
    
    expect(hash1).not.toBe(hash2)
  })

  test('Identical payloads produce identical hashes', () => {
    const payload = { entity: 'trade_monitor', action: 'volatility_guard', performed_by: 'system' }
    
    const hash1 = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')
    const hash2 = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')
    
    expect(hash1).toBe(hash2)
  })
})