import { adminCors, requireAdmin } from '../_lib/adminAuth.js';
import { supabaseConfigured, supabaseHeaders, supabaseRest } from '../_lib/supabase.js';

export default async function handler(req, res) {
  adminCors(res, 'GET, PUT, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  if (!supabaseConfigured()) {
    return res.status(503).json({ error: 'Supabase no configurado' });
  }

  const base = `${supabaseRest('catalog_config')}?id=eq.default`;
  const headers = supabaseHeaders('return=representation');

  if (req.method === 'GET') {
    const response = await fetch(`${base}&select=data,updated_at`, { headers: supabaseHeaders() });
    const rows = await response.json();
    return res.status(200).json(rows[0]?.data || {});
  }

  if (req.method === 'PUT') {
    const { data } = req.body || {};
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'data debe ser un objeto' });
    }
    const row = {
      id: 'default',
      data,
      updated_at: new Date().toISOString(),
    };
    const response = await fetch(`${supabaseRest('catalog_config')}?on_conflict=id`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(row),
    });
    const result = await response.json();
    return res.status(response.ok ? 200 : 500).json(result);
  }

  return res.status(405).end();
}
