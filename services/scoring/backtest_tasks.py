from celery_app import celery_app
import numpy as np
import pandas as pd
import json
from datetime import datetime, timedelta
from supabase import create_client
import os
from report_generator import generate_pdf_report, generate_csv_report

# Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase = create_client(supabase_url, supabase_key)

@celery_app.task(bind=True)
def run_backtest(self, symbol: str, timeframe: str, period_days: int):
    """Run backtest for a symbol and generate report"""
    try:
        # Update task status
        self.update_state(state='PROGRESS', meta={'status': 'Starting backtest...'})
        
        # Generate mock backtest data
        backtest_data = generate_mock_backtest(symbol, period_days)
        
        self.update_state(state='PROGRESS', meta={'status': 'Calculating metrics...'})
        
        # Calculate performance metrics
        metrics = calculate_metrics(backtest_data)
        
        self.update_state(state='PROGRESS', meta={'status': 'Generating reports...'})
        
        # Generate reports
        pdf_path = generate_pdf_report(symbol, backtest_data, metrics)
        csv_path = generate_csv_report(symbol, backtest_data, metrics)
        
        self.update_state(state='PROGRESS', meta={'status': 'Uploading to storage...'})
        
        # Upload to Supabase Storage
        pdf_url = upload_to_storage(pdf_path, f"backtests/{symbol}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")
        csv_url = upload_to_storage(csv_path, f"backtests/{symbol}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
        
        # Save backtest record
        backtest_record = {
            "symbol": symbol,
            "timeframe": timeframe,
            "period_days": period_days,
            "results": backtest_data,
            "metrics": metrics,
            "pdf_url": pdf_url,
            "csv_url": csv_url,
            "created_at": datetime.now().isoformat()
        }
        
        supabase.table("backtests").insert(backtest_record).execute()
        
        return {
            'status': 'completed',
            'symbol': symbol,
            'metrics': metrics,
            'pdf_url': pdf_url,
            'csv_url': csv_url
        }
        
    except Exception as e:
        self.update_state(state='FAILURE', meta={'error': str(e)})
        raise

def generate_mock_backtest(symbol: str, period_days: int):
    """Generate mock backtest data"""
    np.random.seed(42)  # For reproducible results
    
    dates = pd.date_range(end=datetime.now(), periods=period_days, freq='D')
    
    # Mock price data
    initial_price = 100
    returns = np.random.normal(0.001, 0.02, period_days)  # Daily returns
    prices = [initial_price]
    
    for ret in returns[1:]:
        prices.append(prices[-1] * (1 + ret))
    
    # Mock signals (buy/sell decisions)
    signals = np.random.choice(['BUY', 'SELL', 'HOLD'], period_days, p=[0.3, 0.2, 0.5])
    
    # Mock performance
    portfolio_values = []
    position = 0
    cash = 10000
    
    for i, (price, signal) in enumerate(zip(prices, signals)):
        if signal == 'BUY' and cash > price:
            shares_to_buy = cash // price
            position += shares_to_buy
            cash -= shares_to_buy * price
        elif signal == 'SELL' and position > 0:
            cash += position * price
            position = 0
            
        portfolio_value = cash + position * price
        portfolio_values.append(portfolio_value)
    
    return {
        'dates': [d.isoformat() for d in dates],
        'prices': prices,
        'signals': signals.tolist(),
        'portfolio_values': portfolio_values,
        'period_days': period_days
    }

def calculate_metrics(backtest_data):
    """Calculate performance metrics"""
    portfolio_values = backtest_data['portfolio_values']
    returns = np.diff(portfolio_values) / portfolio_values[:-1]
    
    total_return = (portfolio_values[-1] - portfolio_values[0]) / portfolio_values[0] * 100
    accuracy = np.random.uniform(55, 85)  # Mock accuracy
    sharpe_ratio = np.mean(returns) / np.std(returns) * np.sqrt(252) if np.std(returns) > 0 else 0
    max_drawdown = calculate_max_drawdown(portfolio_values)
    
    return {
        'total_return': round(total_return, 2),
        'accuracy': round(accuracy, 2),
        'sharpe_ratio': round(sharpe_ratio, 2),
        'max_drawdown': round(max_drawdown, 2),
        'total_trades': len([s for s in backtest_data['signals'] if s != 'HOLD']),
        'win_rate': round(np.random.uniform(45, 75), 2)
    }

def calculate_max_drawdown(portfolio_values):
    """Calculate maximum drawdown"""
    peak = portfolio_values[0]
    max_dd = 0
    
    for value in portfolio_values:
        if value > peak:
            peak = value
        drawdown = (peak - value) / peak * 100
        if drawdown > max_dd:
            max_dd = drawdown
            
    return max_dd

def upload_to_storage(file_path: str, storage_path: str) -> str:
    """Upload file to Supabase Storage"""
    try:
        with open(file_path, 'rb') as f:
            result = supabase.storage.from_("reports").upload(storage_path, f)
        
        # Get public URL
        url = supabase.storage.from_("reports").get_public_url(storage_path)
        return url
    except Exception as e:
        print(f"Upload failed: {e}")
        return ""