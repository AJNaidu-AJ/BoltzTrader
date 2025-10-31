from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from celery_app import celery_app
from backtest_tasks import run_backtest
from typing import Optional

router = APIRouter()

class BacktestRequest(BaseModel):
    symbol: str
    timeframe: str = "1d"
    period_days: int = 30

class BacktestResponse(BaseModel):
    task_id: str
    status: str
    message: str

class BacktestStatusResponse(BaseModel):
    task_id: str
    status: str
    result: Optional[dict] = None
    error: Optional[str] = None

@router.post("/backtest", response_model=BacktestResponse)
async def trigger_backtest(request: BacktestRequest):
    """Trigger backtest Celery job"""
    try:
        # Validate inputs
        if request.period_days < 1 or request.period_days > 365:
            raise HTTPException(status_code=400, detail="Period must be between 1 and 365 days")
        
        # Start Celery task
        task = run_backtest.delay(request.symbol, request.timeframe, request.period_days)
        
        return BacktestResponse(
            task_id=task.id,
            status="started",
            message=f"Backtest started for {request.symbol}"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start backtest: {str(e)}")

@router.get("/backtest/{task_id}", response_model=BacktestStatusResponse)
async def get_backtest_status(task_id: str):
    """Get backtest job status"""
    try:
        task = celery_app.AsyncResult(task_id)
        
        if task.state == 'PENDING':
            response = {
                'task_id': task_id,
                'status': 'pending',
                'result': None
            }
        elif task.state == 'PROGRESS':
            response = {
                'task_id': task_id,
                'status': 'running',
                'result': task.info
            }
        elif task.state == 'SUCCESS':
            response = {
                'task_id': task_id,
                'status': 'completed',
                'result': task.result
            }
        else:  # FAILURE
            response = {
                'task_id': task_id,
                'status': 'failed',
                'error': str(task.info)
            }
            
        return BacktestStatusResponse(**response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")

@router.get("/backtests")
async def list_backtests():
    """List all completed backtests"""
    try:
        from supabase import create_client
        import os
        
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_ANON_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        result = supabase.table("backtests").select("*").order("created_at", desc=True).limit(20).execute()
        
        return {"backtests": result.data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list backtests: {str(e)}")