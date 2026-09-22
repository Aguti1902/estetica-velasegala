-- ============================================================
-- Tabla de tarjetas regalo – Vela Segalà Estètica (Viladecans)
-- Ejecuta este SQL en Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS gift_cards (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code              TEXT UNIQUE NOT NULL,           -- Código legible: VS-XXXX-XXXX
  amount            INTEGER NOT NULL,               -- Importe en euros: 50, 100 o 200
  stripe_session_id TEXT UNIQUE,                    -- ID de sesión Stripe para consultar el estado
  buyer_name        TEXT NOT NULL,                  -- Nombre del comprador
  buyer_email       TEXT NOT NULL,                  -- Email del comprador (recibe la tarjeta)
  recipient_name    TEXT,                           -- Nombre del destinatario (opcional)
  message           TEXT,                           -- Mensaje personal (opcional)
  is_used           BOOLEAN NOT NULL DEFAULT FALSE, -- ¿Ha sido canjeada?
  used_at           TIMESTAMPTZ,                    -- Cuándo se canjeó
  used_by           TEXT,                           -- Quién marcó la tarjeta como usada
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_buyer_email ON gift_cards(buyer_email);
CREATE INDEX IF NOT EXISTS idx_gift_cards_stripe_session ON gift_cards(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_is_used ON gift_cards(is_used);

-- Row Level Security: la API usa la service_role key, así que es seguro
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

-- Política: solo el service role puede leer/escribir (ningún anon puede acceder directamente)
DROP POLICY IF EXISTS "Solo service role" ON gift_cards;
CREATE POLICY "Solo service role" ON gift_cards
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comentario
COMMENT ON TABLE gift_cards IS 'Tarjetas regalo vendidas en esteticavelasegala.com';

-- ============================================================
-- Mensajes del formulario de contacto
-- ============================================================

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

-- ============================================================
-- Overrides CMS de tratamientos (parches JSON por slug e idioma)
-- ============================================================

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

-- ============================================================
-- Configuración del catálogo (nombres de secciones, etc.)
-- ============================================================

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
-- Storage: bucket público para imágenes de tratamientos
-- En Supabase Dashboard → Storage → New bucket:
--   Name: treatment-images
--   Public: ON
-- (La API sube con service_role; no hace falta política anon de escritura)
-- ============================================================
