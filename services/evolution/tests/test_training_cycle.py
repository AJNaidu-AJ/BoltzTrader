import pytest
import asyncio
import pandas as pd
from unittest.mock import AsyncMock, patch
from ..workers.training_worker import TrainingWorker

class TestTrainingCycle:
    def setup_method(self):
        """Setup test training worker"""
        self.worker = TrainingWorker()
    
    @pytest.mark.asyncio
    async def test_fetch_recent_trades(self):
        """Test fetching recent trade data"""
        trades = await self.worker.fetch_recent_trades()
        
        assert isinstance(trades, pd.DataFrame)
        assert not trades.empty
        assert 'symbol' in trades.columns
        assert 'pnl' in trades.columns
        assert len(trades) > 0
    
    @pytest.mark.asyncio
    async def test_training_cycle_with_data(self):
        """Test complete training cycle with mock data"""
        with patch.object(self.worker, 'fetch_recent_trades') as mock_fetch, \
             patch.object(self.worker, 'store_training_metrics') as mock_store, \
             patch.object(self.worker, 'update_predictive_metrics') as mock_update:
            
            # Mock trade data
            mock_trades = pd.DataFrame({
                'symbol': ['BTCUSDT'] * 50,
                'pnl': [i * 10 for i in range(-25, 25)],
                'price': [50000] * 50,
                'size': [0.1] * 50,
                'entry_time': pd.date_range('2024-01-01', periods=50, freq='H'),
                'exit_time': pd.date_range('2024-01-01 02:00:00', periods=50, freq='H'),
                'volatility': [0.05] * 50,
                'volume': [1000] * 50,
                'confidence': [0.7] * 50
            })
            
            mock_fetch.return_value = mock_trades
            mock_store.return_value = None
            mock_update.return_value = None
            
            # Run training cycle
            await self.worker.run_training_cycle()
            
            # Verify calls
            mock_fetch.assert_called_once()
            mock_store.assert_called_once()
            mock_update.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_training_cycle_no_data(self):
        """Test training cycle with no data"""
        with patch.object(self.worker, 'fetch_recent_trades') as mock_fetch, \
             patch.object(self.worker, 'store_training_metrics') as mock_store:
            
            # Mock empty data
            mock_fetch.return_value = pd.DataFrame()
            
            # Run training cycle
            await self.worker.run_training_cycle()
            
            # Should not call store_training_metrics with no data
            mock_store.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_update_predictive_metrics(self):
        """Test updating predictive metrics for strategies"""
        with patch.object(self.worker, 'fetch_active_strategies') as mock_strategies, \
             patch.object(self.worker, 'generate_strategy_predictions') as mock_predictions, \
             patch.object(self.worker, 'store_predictions') as mock_store:
            
            mock_strategies.return_value = [
                {'id': 'strategy-1', 'name': 'Test Strategy'}
            ]
            mock_predictions.return_value = {
                'predicted_return': 0.02,
                'predicted_volatility': 0.15,
                'confidence': 0.75
            }
            mock_store.return_value = None
            
            await self.worker.update_predictive_metrics()
            
            mock_strategies.assert_called_once()
            mock_predictions.assert_called_once()
            mock_store.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_generate_strategy_predictions(self):
        """Test generating predictions for a strategy"""
        strategy = {'id': 'test-strategy', 'name': 'Test Strategy'}
        
        predictions = await self.worker.generate_strategy_predictions(strategy)
        
        assert isinstance(predictions, dict)
        assert 'predicted_return' in predictions
        assert 'predicted_volatility' in predictions
        assert 'confidence' in predictions
        
        # Check value ranges
        assert -1 <= predictions['predicted_return'] <= 1
        assert 0 <= predictions['predicted_volatility'] <= 1
        assert 0 <= predictions['confidence'] <= 1
    
    @pytest.mark.asyncio
    async def test_error_handling(self):
        """Test error handling in training cycle"""
        with patch.object(self.worker, 'fetch_recent_trades') as mock_fetch:
            # Mock exception
            mock_fetch.side_effect = Exception("Database error")
            
            # Should not raise exception
            await self.worker.run_training_cycle()
            
            # Verify exception was handled
            mock_fetch.assert_called_once()

@pytest.mark.asyncio
async def test_scheduled_training():
    """Test scheduled training function"""
    from ..workers.training_worker import scheduled_training
    
    with patch('services.evolution.workers.training_worker.TrainingWorker') as mock_worker_class:
        mock_worker = AsyncMock()
        mock_worker_class.return_value = mock_worker
        
        await scheduled_training()
        
        mock_worker_class.assert_called_once()
        mock_worker.run_training_cycle.assert_called_once()