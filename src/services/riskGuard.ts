import { TradeSignal } from './brokers/brokerService';

export function validateTrade(signal: TradeSignal, balance: number, maxExposure = 0.2): boolean {
  // Check AI confidence threshold
  if (!signal.confidence || signal.confidence < 0.7) {
    throw new Error(`Low-confidence AI signal: ${signal.confidence}`);
  }

  // Check risk exposure
  if (signal.amount > balance * maxExposure) {
    throw new Error(`Exceeds risk threshold: ${signal.amount} > ${balance * maxExposure}`);
  }

  // Validate trade direction
  if (!['buy', 'sell'].includes(signal.side)) {
    throw new Error(`Invalid trade direction: ${signal.side}`);
  }

  // Check minimum quantity
  if (signal.qty <= 0) {
    throw new Error(`Invalid quantity: ${signal.qty}`);
  }

  // Check symbol format
  if (!signal.symbol || signal.symbol.length < 2) {
    throw new Error(`Invalid symbol: ${signal.symbol}`);
  }

  console.log(`✅ Risk validation passed for ${signal.symbol} ${signal.side} ${signal.qty}`);
  return true;
}

export function calculatePositionSize(
  balance: number, 
  riskPercentage: number, 
  stopLossPercentage: number
): number {
  const riskAmount = balance * (riskPercentage / 100);
  const positionSize = riskAmount / (stopLossPercentage / 100);
  return Math.floor(positionSize);
}