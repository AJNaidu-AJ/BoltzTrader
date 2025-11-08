import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any

class CorrelationEngine:
    def __init__(self, min_periods: int = 20):
        self.min_periods = min_periods
    
    def compute_correlations(self, price_data: Dict[str, List[float]]) -> Dict[str, Dict[str, float]]:
        """Compute correlation matrix from price data"""
        try:
            df = pd.DataFrame(price_data)
            
            if df.empty or len(df) < self.min_periods:
                return {}
            
            # Calculate returns
            returns = df.pct_change().dropna()
            
            if returns.empty:
                return {}
            
            # Compute correlation matrix
            corr_matrix = returns.corr()
            
            # Convert to nested dict format
            correlations = {}
            for symbol1 in corr_matrix.index:
                correlations[symbol1] = {}
                for symbol2 in corr_matrix.columns:
                    if symbol1 != symbol2:
                        corr_value = corr_matrix.loc[symbol1, symbol2]
                        if not pd.isna(corr_value):
                            correlations[symbol1][symbol2] = round(float(corr_value), 3)
            
            return correlations
        
        except Exception as e:
            print(f"Error computing correlations: {e}")
            return {}
    
    def suggest_hedges(self, correlations: Dict[str, Dict[str, float]], 
                      threshold: float = 0.75) -> List[Tuple[str, str, float]]:
        """Suggest hedge pairs based on high correlation"""
        hedge_pairs = []
        processed_pairs = set()
        
        for base_symbol, related_corrs in correlations.items():
            for related_symbol, corr_value in related_corrs.items():
                # Create sorted pair to avoid duplicates
                pair = tuple(sorted([base_symbol, related_symbol]))
                
                if (abs(corr_value) >= threshold and 
                    pair not in processed_pairs):
                    
                    hedge_pairs.append((base_symbol, related_symbol, corr_value))
                    processed_pairs.add(pair)
        
        # Sort by correlation strength
        hedge_pairs.sort(key=lambda x: abs(x[2]), reverse=True)
        return hedge_pairs
    
    def calculate_hedge_ratio(self, base_returns: List[float], 
                            hedge_returns: List[float]) -> float:
        """Calculate optimal hedge ratio using linear regression"""
        try:
            if len(base_returns) != len(hedge_returns) or len(base_returns) < 2:
                return 0.0
            
            base_array = np.array(base_returns)
            hedge_array = np.array(hedge_returns)
            
            # Remove NaN values
            mask = ~(np.isnan(base_array) | np.isnan(hedge_array))
            base_clean = base_array[mask]
            hedge_clean = hedge_array[mask]
            
            if len(base_clean) < 2:
                return 0.0
            
            # Calculate hedge ratio (beta)
            covariance = np.cov(base_clean, hedge_clean)[0, 1]
            hedge_variance = np.var(hedge_clean)
            
            if hedge_variance == 0:
                return 0.0
            
            hedge_ratio = covariance / hedge_variance
            return round(hedge_ratio, 4)
        
        except Exception:
            return 0.0
    
    def get_diversification_score(self, portfolio_weights: Dict[str, float], 
                                correlations: Dict[str, Dict[str, float]]) -> float:
        """Calculate portfolio diversification score"""
        try:
            symbols = list(portfolio_weights.keys())
            n = len(symbols)
            
            if n <= 1:
                return 1.0
            
            # Calculate weighted average correlation
            total_weight = 0
            weighted_corr_sum = 0
            
            for i, symbol1 in enumerate(symbols):
                for j, symbol2 in enumerate(symbols):
                    if i != j and symbol1 in correlations and symbol2 in correlations[symbol1]:
                        weight1 = portfolio_weights[symbol1]
                        weight2 = portfolio_weights[symbol2]
                        corr = correlations[symbol1][symbol2]
                        
                        weighted_corr_sum += weight1 * weight2 * abs(corr)
                        total_weight += weight1 * weight2
            
            if total_weight == 0:
                return 1.0
            
            avg_correlation = weighted_corr_sum / total_weight
            
            # Diversification score (1 = perfectly diversified, 0 = perfectly correlated)
            diversification_score = 1.0 - avg_correlation
            return round(max(0.0, min(1.0, diversification_score)), 3)
        
        except Exception:
            return 0.5