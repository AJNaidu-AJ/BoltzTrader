from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class JournalEntryCreate(BaseModel):
    trade_id: Optional[UUID] = None
    symbol: str
    broker: str
    side: str
    size: float
    price: float
    pnl: float
    entry_time: datetime
    exit_time: Optional[datetime] = None
    strategy_id: Optional[UUID] = None
    notes: Optional[str] = None
    tags: List[str] = []
    metadata: Dict[str, Any] = {}

class JournalEntry(BaseModel):
    id: UUID
    user_id: UUID
    trade_id: Optional[UUID]
    symbol: str
    broker: str
    side: str
    size: float
    price: float
    pnl: float
    entry_time: datetime
    exit_time: Optional[datetime]
    strategy_id: Optional[UUID]
    notes: Optional[str]
    tags: List[str]
    xai_id: Optional[UUID]
    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

class AnnotationCreate(BaseModel):
    comment: str
    visibility: str = "private"

class Annotation(BaseModel):
    id: UUID
    entry_id: UUID
    author_id: UUID
    comment: str
    visibility: str
    created_at: datetime

class AnalyticsMetrics(BaseModel):
    total_trades: int
    win_rate: float
    avg_return: float
    max_drawdown: float
    sharpe_ratio: Optional[float]
    cumulative_return: float