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

CREATE TABLE IF NOT EXISTS catalog_config (
  id         TEXT PRIMARY KEY DEFAULT 'default',
  data       JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE catalog_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo service role catalog" ON catalog_config;
CREATE POLICY "Solo service role catalog" ON catalog_config
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Agenda / citas (calendario admin — Natalia)
-- ============================================================

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
                  CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed', 'no_show')),
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

CREATE TABLE IF NOT EXISTS clients (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  phone      TEXT,
  email      TEXT,
  notes      TEXT,
  status     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Solo service role clients" ON clients;
CREATE POLICY "Solo service role clients" ON clients
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2) DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);

-- Ampliar estados (si la tabla ya existía con CHECK antiguo)
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed', 'no_show'));
-- Secciones extra del panel: Tareas + Inventario
-- Ejecuta en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS admin_tasks (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT NOT NULL,
  notes      TEXT,
  due_date   DATE,
  priority   TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  done       BOOLEAN NOT NULL DEFAULT FALSE,
  done_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_tasks_done ON admin_tasks(done);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_due ON admin_tasks(due_date);

ALTER TABLE admin_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Solo service role admin_tasks" ON admin_tasks;
CREATE POLICY "Solo service role admin_tasks" ON admin_tasks
  FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS inventory_items (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  sku          TEXT,
  category     TEXT NOT NULL DEFAULT 'General',
  quantity     NUMERIC(12,2) NOT NULL DEFAULT 0,
  min_quantity NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit         TEXT NOT NULL DEFAULT 'ud',
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory_items(name);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Solo service role inventory" ON inventory_items;
CREATE POLICY "Solo service role inventory" ON inventory_items
  FOR ALL USING (true) WITH CHECK (true);
