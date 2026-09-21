import { adminCors, requireAdmin } from '../_lib/adminAuth.js';
import { supabaseConfigured, supabaseHeaders, supabaseRest } from '../_lib/supabase.js';

export default async function handler(req, res) {
  adminCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  if (!supabaseConfigured()) {
    return res.status(503).json({ error: 'Supabase no configurado' });
  }

  const base = supabaseRest('contact_submissions');
  const headers = supabaseHeaders('return=representation');

  if (req.method === 'GET') {
    const { status, limit = '100' } = req.query;
    let url = `${base}?select=*&order=created_at.desc&limit=${Math.min(Number(limit) || 100, 500)}`;
    if (status && status !== 'all') url += `&status=eq.${encodeURIComponent(status)}`;
    const response = await fetch(url, { headers: supabaseHeaders() });
    const data = await response.json();
    return res.status(response.ok ? 200 : 500).json(data);
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    if (!id || !['new', 'read', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'id y status (new|read|archived) requeridos' });
    }
    const response = await fetch(`${base}?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    return res.status(response.ok ? 200 : 500).json(data);
  }

  return res.status(405).end();
}
