from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import httpx
import os
from datetime import datetime, timedelta
import re

router = APIRouter()

class NewsItem(BaseModel):
    id: str
    title: str
    summary: str
    url: str
    source: str
    published_at: datetime
    sentiment: str
    sentiment_score: float
    symbols: List[str]

class NewsResponse(BaseModel):
    news: List[NewsItem]
    total_count: int

# Simple sentiment analysis
def analyze_sentiment(text: str) -> tuple[str, float]:
    """Simple rule-based sentiment analysis"""
    positive_words = ['gain', 'rise', 'up', 'bull', 'profit', 'growth', 'strong', 'beat', 'exceed', 'positive', 'surge', 'rally']
    negative_words = ['fall', 'drop', 'down', 'bear', 'loss', 'decline', 'weak', 'miss', 'below', 'negative', 'crash', 'plunge']
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    total_words = len(text.split())
    if total_words == 0:
        return 'neutral', 0.0
    
    sentiment_score = (positive_count - negative_count) / max(total_words, 1)
    
    if sentiment_score > 0.02:
        return 'positive', min(sentiment_score * 10, 1.0)
    elif sentiment_score < -0.02:
        return 'negative', max(sentiment_score * 10, -1.0)
    else:
        return 'neutral', sentiment_score

def extract_symbols(text: str) -> List[str]:
    """Extract stock symbols from text"""
    # Simple regex to find potential stock symbols
    symbols = re.findall(r'\b[A-Z]{2,5}\b', text)
    # Filter common words that aren't symbols
    common_words = {'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'HAD', 'BUT', 'HAS', 'HIS', 'WHO', 'OIL', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'ITS', 'DID', 'GET', 'MAY', 'HIM', 'DAY', 'TOO', 'ANY', 'USE', 'HOW', 'OWN', 'SAY', 'SHE', 'WHY', 'TRY', 'ASK', 'MEN', 'RUN', 'END', 'WHY', 'LET', 'PUT', 'TOO', 'OLD', 'WHY', 'LET', 'PUT', 'END', 'WHY', 'TRY', 'ASK', 'MEN', 'RUN'}
    return [s for s in symbols if s not in common_words][:3]  # Max 3 symbols

@router.get("/news", response_model=NewsResponse)
async def get_market_news(
    symbols: Optional[str] = None,
    limit: int = 20,
    hours_back: int = 24
):
    """Get market news with sentiment analysis"""
    try:
        # Mock news data - replace with actual API calls
        mock_news = generate_mock_news(limit, hours_back)
        
        # Filter by symbols if provided
        if symbols:
            symbol_list = [s.strip().upper() for s in symbols.split(',')]
            mock_news = [news for news in mock_news if any(symbol in news.symbols for symbol in symbol_list)]
        
        return NewsResponse(
            news=mock_news,
            total_count=len(mock_news)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch news: {str(e)}")

def generate_mock_news(limit: int, hours_back: int) -> List[NewsItem]:
    """Generate mock news data"""
    news_templates = [
        {
            "title": "AAPL Reports Strong Q4 Earnings, Beats Expectations",
            "summary": "Apple Inc. reported quarterly earnings that exceeded analyst expectations, driven by strong iPhone sales and services revenue growth.",
            "source": "MarketWatch",
            "symbols": ["AAPL"]
        },
        {
            "title": "Tesla Stock Surges on Autonomous Driving Breakthrough",
            "summary": "Tesla shares rally after the company announces significant progress in full self-driving technology, boosting investor confidence.",
            "source": "Reuters",
            "symbols": ["TSLA"]
        },
        {
            "title": "Microsoft Azure Revenue Growth Accelerates",
            "summary": "Microsoft's cloud computing division shows accelerating growth, with Azure revenue up 35% year-over-year in latest quarter.",
            "source": "Bloomberg",
            "symbols": ["MSFT"]
        },
        {
            "title": "Fed Signals Potential Rate Cut Amid Economic Concerns",
            "summary": "Federal Reserve officials hint at possible interest rate reduction as economic indicators show mixed signals for growth.",
            "source": "CNBC",
            "symbols": ["SPY", "QQQ"]
        },
        {
            "title": "NVIDIA AI Chip Demand Continues to Soar",
            "summary": "NVIDIA reports unprecedented demand for AI chips as companies accelerate artificial intelligence adoption across industries.",
            "source": "TechCrunch",
            "symbols": ["NVDA"]
        },
        {
            "title": "Oil Prices Drop on Supply Concerns",
            "summary": "Crude oil futures decline as global supply increases and demand forecasts are revised downward amid economic uncertainty.",
            "source": "Energy News",
            "symbols": ["XOM", "CVX"]
        }
    ]
    
    news_items = []
    base_time = datetime.now()
    
    for i in range(min(limit, len(news_templates) * 3)):
        template = news_templates[i % len(news_templates)]
        
        # Add some variation to titles and summaries
        title = template["title"]
        summary = template["summary"]
        
        if i > len(news_templates):
            title = f"Updated: {title}"
            summary = f"Latest developments: {summary}"
        
        # Calculate sentiment
        sentiment, sentiment_score = analyze_sentiment(f"{title} {summary}")
        
        # Generate timestamp
        published_at = base_time - timedelta(hours=i * (hours_back / limit))
        
        news_items.append(NewsItem(
            id=f"news_{i}_{int(published_at.timestamp())}",
            title=title,
            summary=summary,
            url=f"https://example.com/news/{i}",
            source=template["source"],
            published_at=published_at,
            sentiment=sentiment,
            sentiment_score=sentiment_score,
            symbols=template["symbols"]
        ))
    
    return sorted(news_items, key=lambda x: x.published_at, reverse=True)