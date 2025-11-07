-- Phase 5: Learning & Feedback Loop Database Schema

-- Performance metrics table
CREATE TABLE performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    strategy_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    profit_loss DECIMAL(15,4) NOT NULL,
    drawdown DECIMAL(8,4) NOT NULL,
    sharpe_ratio DECIMAL(8,4),
    total_trades INTEGER DEFAULT 0,
    win_rate DECIMAL(5,4),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback events table
CREATE TABLE feedback_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    strategy_id VARCHAR(255),
    user_id UUID,
    feedback_type VARCHAR(50) NOT NULL, -- 'user', 'system', 'performance'
    score INTEGER CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning snapshots table
CREATE TABLE learning_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    snapshot_timestamp TIMESTAMPTZ DEFAULT NOW(),
    fusion_weights JSONB NOT NULL, -- {momentum: 0.3, breakout: 0.2, mean_reversion: 0.3, sentiment: 0.2}
    reward_score DECIMAL(10,6) NOT NULL,
    learning_iteration INTEGER NOT NULL,
    performance_window JSONB, -- last N trades performance data
    adaptive_params JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Strategy performance summary view
CREATE VIEW strategy_performance_summary AS
SELECT 
    strategy_id,
    COUNT(*) as total_records,
    AVG(profit_loss) as avg_profit_loss,
    AVG(drawdown) as avg_drawdown,
    AVG(sharpe_ratio) as avg_sharpe_ratio,
    AVG(win_rate) as avg_win_rate,
    MAX(timestamp) as last_updated
FROM performance_metrics 
GROUP BY strategy_id;

-- Indexes for performance
CREATE INDEX idx_performance_metrics_strategy_timestamp ON performance_metrics(strategy_id, timestamp DESC);
CREATE INDEX idx_feedback_events_strategy_timestamp ON feedback_events(strategy_id, timestamp DESC);
CREATE INDEX idx_learning_snapshots_timestamp ON learning_snapshots(snapshot_timestamp DESC);

-- RLS policies (if needed)
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_snapshots ENABLE ROW LEVEL SECURITY;