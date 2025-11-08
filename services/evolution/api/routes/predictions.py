from fastapi import APIRouter, HTTPException
from ...engine.predictor import Predictor
from ...engine.feature_extractor import extract_features
from ...models.schemas import PredictionRequest, PredictionResponse
import pandas as pd
import numpy as np

router = APIRouter()
predictor = Predictor()

@router.post("/run", response_model=PredictionResponse)
async def run_prediction(request: PredictionRequest):
    """Run prediction on trade data"""
    try:
        if not request.trades:
            raise HTTPException(status_code=400, detail="No trade data provided")
        
        # Convert to DataFrame
        df = pd.DataFrame(request.trades)
        
        # Extract features
        features = extract_features(df)
        
        if features.empty:
            raise HTTPException(status_code=400, detail="Could not extract features from trade data")
        
        # Make predictions
        X = features.values
        predictions, confidence = predictor.predict(X)
        
        return PredictionResponse(
            predictions=predictions.tolist(),
            confidence=float(confidence),
            model_version=predictor.model_version
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/train")
async def train_model(request: PredictionRequest):
    """Train the prediction model"""
    try:
        if not request.trades:
            raise HTTPException(status_code=400, detail="No training data provided")
        
        df = pd.DataFrame(request.trades)
        features = extract_features(df)
        
        if features.empty or 'return' not in df.columns:
            raise HTTPException(status_code=400, detail="Insufficient training data")
        
        X = features.values
        y = df['return'].values if 'return' in df.columns else df['pnl'].values
        
        metrics = predictor.train(X, y)
        
        return {
            "status": "success",
            "metrics": metrics,
            "message": "Model trained successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@router.get("/model/info")
async def get_model_info():
    """Get model information and feature importance"""
    try:
        feature_importance = predictor.get_feature_importance()
        
        return {
            "model_version": predictor.model_version,
            "feature_importance": feature_importance.tolist() if feature_importance is not None else None,
            "model_type": "RandomForestRegressor"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")