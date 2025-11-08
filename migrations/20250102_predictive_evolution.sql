-- Predicted performance and evolution tracking
CREATE TABLE IF NOT EXISTS predictive_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  strategy_id uuid REFERENCES strategies(id),
  symbol text,
  timeframe text,
  predicted_return numeric,
  predicted_volatility numeric,
  confidence numeric,
  model_version text,
  computed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS strategy_evolution_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id uuid REFERENCES strategies(id),
  previous_config jsonb,
  new_config jsonb,
  improvement_score numeric,
  reason text,
  triggered_by text, -- e.g., performance_drop / model_signal
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_predictive_strategy ON predictive_metrics(strategy_id);
CREATE INDEX IF NOT EXISTS idx_evolution_strategy ON strategy_evolution_history(strategy_id);