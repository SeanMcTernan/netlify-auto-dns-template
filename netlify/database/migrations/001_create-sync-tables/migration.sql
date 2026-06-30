CREATE TABLE processed_sites (
  site_id       TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  custom_domain TEXT,
  action        TEXT NOT NULL,  -- 'seeded' | 'assigned' | 'skipped_existing_domain'
  processed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sync_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
