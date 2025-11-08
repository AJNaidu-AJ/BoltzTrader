from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import numpy as np
import joblib
import os
from typing import Tuple, Optional

MODEL_PATH = "models/predictive_model.pkl"

class Predictor:
    def __init__(self):
        self.model = None
        self.model_version = "1.0.0"
        self.load_model()
    
    def load_model(self):
        """Load existing model or create new one"""
        try:
            if os.path.exists(MODEL_PATH):
                self.model = joblib.load(MODEL_PATH)
            else:
                self.model = RandomForestRegressor(
                    n_estimators=50, 
                    random_state=42,
                    max_depth=10,
                    min_samples_split=5
                )
        except Exception:
            self.model = RandomForestRegressor(
                n_estimators=50, 
                random_state=42,
                max_depth=10,
                min_samples_split=5
            )
    
    def train(self, X: np.ndarray, y: np.ndarray) -> dict:
        """Train the model and return metrics"""
        if len(X) < 10:
            return {"error": "Insufficient training data"}
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train model
        self.model.fit(X_train, y_train)
        
        # Evaluate
        train_pred = self.model.predict(X_train)
        test_pred = self.model.predict(X_test)
        
        metrics = {
            "train_mse": mean_squared_error(y_train, train_pred),
            "test_mse": mean_squared_error(y_test, test_pred),
            "feature_importance": self.model.feature_importances_.tolist(),
            "model_version": self.model_version
        }
        
        # Save model
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(self.model, MODEL_PATH)
        
        return metrics
    
    def predict(self, X: np.ndarray) -> Tuple[np.ndarray, float]:
        """Make predictions and return confidence"""
        if self.model is None:
            return np.zeros(len(X)), 0.0
        
        predictions = self.model.predict(X)
        
        # Clip predictions to reasonable range
        predictions = np.clip(predictions, -1, 1)
        
        # Calculate confidence based on prediction variance
        if hasattr(self.model, 'estimators_'):
            # For ensemble methods, use prediction variance
            tree_predictions = np.array([
                tree.predict(X) for tree in self.model.estimators_
            ])
            variance = np.var(tree_predictions, axis=0)
            confidence = 1.0 / (1.0 + np.mean(variance))
        else:
            confidence = 0.5
        
        return predictions, confidence
    
    def get_feature_importance(self) -> Optional[np.ndarray]:
        """Get feature importance if available"""
        if self.model and hasattr(self.model, 'feature_importances_'):
            return self.model.feature_importances_
        return None