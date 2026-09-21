-- Solo panel admin (contacto + CMS tratamientos)
-- Úsalo si gift_cards ya está creado y el SQL completo falla al reejecutarse.

CREATE TABLE IF NOT EXISTS contact_submissions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  service    TEXT,
  clinic     TEXT,
  message    TEXT,
  source     TEXT NOT NULL DEFAULT 'contact',
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON contact_submissions(created_at DESC);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo service role contact" ON contact_submissions;
CREATE POLICY "Solo service role contact" ON contact_submissions
  FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS service_overrides (
  slug       TEXT NOT NULL,
  locale     TEXT NOT NULL CHECK (locale IN ('es', 'ca')),
  data       JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (slug, locale)
);

ALTER TABLE service_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo service role services" ON service_overrides;
CREATE POLICY "Solo service role services" ON service_overrides
  FOR ALL USING (true) WITH CHECK (true);
