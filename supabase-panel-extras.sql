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
