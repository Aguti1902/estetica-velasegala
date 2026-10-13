-- Agenda del panel admin — ejecuta esto en Supabase SQL Editor si aún no tienes la tabla

CREATE TABLE IF NOT EXISTS appointments (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name   TEXT NOT NULL,
  client_phone  TEXT,
  client_email  TEXT,
  service_name  TEXT,
  service_slug  TEXT,
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ NOT NULL,
  status        TEXT NOT NULL DEFAULT 'confirmed'
                  CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed')),
  channel       TEXT NOT NULL DEFAULT 'whatsapp'
                  CHECK (channel IN ('whatsapp', 'phone', 'web', 'instagram', 'walkin', 'other')),
  notes         TEXT,
  employee      TEXT NOT NULL DEFAULT 'Natalia',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_starts ON appointments(starts_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_employee ON appointments(employee);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo service role appointments" ON appointments;
CREATE POLICY "Solo service role appointments" ON appointments
  FOR ALL USING (true) WITH CHECK (true);
