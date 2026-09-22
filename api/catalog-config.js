import { supabaseConfigured, supabaseHeaders, supabaseRest } from './_lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  if (!supabaseConfigured()) {
    return res.status(200).json({});
  }

  const response = await fetch(
    `${supabaseRest('catalog_config')}?id=eq.default&select=data`,
    { headers: supabaseHeaders() },
  );
  const rows = await response.json();
  if (!response.ok || !rows?.[0]) {
    return res.status(200).json({});
  }
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(rows[0].data || {});
}
