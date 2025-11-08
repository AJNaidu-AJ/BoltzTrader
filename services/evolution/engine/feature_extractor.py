import pandas as pd
import numpy as np
from typing import Dict, Any

def extract_features(trade_history: pd.DataFrame) -> pd.DataFrame:
    """Extract features from trade history for ML model"""
    if trade_history.empty:
        return pd.DataFrame()
    
    # Calculate returns
    trade_history['return'] = trade_history['pnl'] / (trade_history['price'] * trade_history['size'])
    
    # Calculate holding time in hours
    if 'exit_time' in trade_history.columns and 'entry_time' in trade_history.columns:
        trade_history['holding_time'] = (
            pd.to_datetime(trade_history['exit_time']) - 
            pd.to_datetime(trade_history['entry_time'])
        ).dt.total_seconds() / 3600
    else:
        trade_history['holding_time'] = 0
    
    # Fill missing values
    feature_columns = ['return', 'holding_time']
    
    # Add volatility if available
    if 'volatility' in trade_history.columns:
        feature_columns.append('volatility')
    else:
        trade_history['volatility'] = 0
    
    # Add volume if available
    if 'volume' in trade_history.columns:
        feature_columns.append('volume')
    else:
        trade_history['volume'] = 0
    
    # Add confidence if available
    if 'confidence' in trade_history.columns:
        feature_columns.append('confidence')
    else:
        trade_history['confidence'] = 0.5
    
    return trade_history[feature_columns].fillna(0)

def calculate_technical_indicators(price_data: pd.DataFrame) -> Dict[str, float]:
    """Calculate technical indicators for feature engineering"""
    if price_data.empty:
        return {}
    
    indicators = {}
    
    # Simple moving averages
    if len(price_data) >= 20:
        indicators['sma_20'] = price_data['close'].rolling(20).mean().iloc[-1]
        indicators['sma_50'] = price_data['close'].rolling(50).mean().iloc[-1] if len(price_data) >= 50 else 0
    
    # RSI
    if len(price_data) >= 14:
        delta = price_data['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
        rs = gain / loss
        indicators['rsi'] = (100 - (100 / (1 + rs))).iloc[-1]
    
    # Volatility
    if len(price_data) >= 20:
        indicators['volatility'] = price_data['close'].pct_change().rolling(20).std().iloc[-1]
    
    return indicators