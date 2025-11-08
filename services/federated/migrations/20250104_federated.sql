-- clients registry
CREATE TABLE IF NOT EXISTS federated_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  region text,
  trust_score numeric DEFAULT 0.5,
  last_seen timestamptz,
  public_key text, -- for secure aggregation / signature verification
  created_at timestamptz DEFAULT now()
);

-- model versions
CREATE TABLE IF NOT EXISTS federated_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name text NOT NULL,
  version int NOT NULL,
  artifact_url text, -- S3/obj-store
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- aggregation log / audit
CREATE TABLE IF NOT EXISTS federated_aggregations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES federated_models(id),
  round_number int,
  aggregated_by text,
  client_count int,
  aggregation_metrics jsonb,
  audit_hash text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- pending updates (store metadata only, not raw gradients)
CREATE TABLE IF NOT EXISTS federated_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES federated_clients(id),
  model_id uuid REFERENCES federated_models(id),
  round_number int,
  update_url text, -- encrypted payload storage (short-lived)
  size_bytes int,
  status text DEFAULT 'pending', -- pending, received, aggregated, failed
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_federated_clients_name ON federated_clients(client_name);
CREATE INDEX IF NOT EXISTS idx_federated_models_name_version ON federated_models(model_name, version);
CREATE INDEX IF NOT EXISTS idx_federated_updates_status ON federated_updates(status);