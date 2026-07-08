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
CREATE POLICY "Solo service role" ON gift_cards
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comentario
COMMENT ON TABLE gift_cards IS 'Tarjetas regalo vendidas en esteticavelasegala.com';
