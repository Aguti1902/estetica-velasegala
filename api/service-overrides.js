import { supabaseConfigured, supabaseHeaders, supabaseRest } from './_lib/supabase.js';

/** GET público: overrides de tratamientos (parches JSON por slug e idioma) */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  if (!supabaseConfigured()) {
    return res.status(200).json({ es: {}, ca: {} });
  }

  const response = await fetch(
    `${supabaseRest('service_overrides')}?select=slug,locale,data`,
    { headers: supabaseHeaders() },
  );
  const rows = await response.json();
  if (!response.ok) {
    console.error('service-overrides', rows);
    return res.status(200).json({ es: {}, ca: {} });
  }

  const out = { es: {}, ca: {} };
  for (const row of rows) {
    if (row.locale === 'es' || row.locale === 'ca') {
      out[row.locale][row.slug] = row.data || {};
    }
  }
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(out);
}
