import { adminCors, requireAdmin } from '../_lib/adminAuth.js';
import { supabaseConfigured, supabaseHeaders, supabaseRest } from '../_lib/supabase.js';

const ROW_ID = 'schedule';

export default async function handler(req, res) {
  adminCors(res, 'GET, PUT, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  if (!supabaseConfigured()) {
    return res.status(503).json({ error: 'Supabase no configurado' });
  }

  const table = supabaseRest('catalog_config');
  const headers = supabaseHeaders('return=representation');

  if (req.method === 'GET') {
    const response = await fetch(`${table}?id=eq.${ROW_ID}&select=data`, { headers: supabaseHeaders() });
    const rows = await response.json();
    if (!response.ok) return res.status(500).json(rows);
    return res.status(200).json(rows?.[0]?.data || {});
  }

  if (req.method === 'PUT') {
    const data = req.body?.schedule || req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Horario no válido' });
    }
    const response = await fetch(`${table}?on_conflict=id`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({
        id: ROW_ID,
        data,
        updated_at: new Date().toISOString(),
      }),
    });
    const result = await response.json();
    return res.status(response.ok ? 200 : 500).json(result);
  }

  return res.status(405).end();
}
