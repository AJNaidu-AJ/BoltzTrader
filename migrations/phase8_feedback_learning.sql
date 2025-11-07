-- Stores reinforcement feedback for AI learning
CREATE TABLE IF NOT EXISTS ai_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id uuid,
  user_id uuid,
  benchmark text NOT NULL,
  ai_return numeric,
  benchmark_return numeric,
  alpha numeric,
  reward numeric,
  outcome text, -- positive, neutral, negative
  learning_cycle int DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_strategy ON ai_feedback (strategy_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user ON ai_feedback (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_outcome ON ai_feedback (outcome);