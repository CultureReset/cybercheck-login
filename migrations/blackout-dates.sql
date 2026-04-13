-- ============================================================
-- Blackout Dates Table
-- Run in your Supabase project
-- ============================================================

CREATE TABLE IF NOT EXISTS blackout_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id TEXT NOT NULL,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    label TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blackout_dates_site ON blackout_dates(site_id);
CREATE INDEX IF NOT EXISTS idx_blackout_dates_range ON blackout_dates(site_id, date_from, date_to);
