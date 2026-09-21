import { adminCors, requireAdmin } from '../_lib/adminAuth.js';
import { supabaseConfigured, supabaseHeaders, supabaseRest } from '../_lib/supabase.js';

export default async function handler(req, res) {
  adminCors(res, 'GET, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  if (!supabaseConfigured()) {
    return res.status(503).json({ error: 'Supabase no configurado' });
  }

  const base = supabaseRest('service_overrides');
  const headers = supabaseHeaders('return=representation');

  if (req.method === 'GET') {
    const response = await fetch(`${base}?select=slug,locale,data,updated_at&order=slug.asc`, {
      headers: supabaseHeaders(),
    });
    const data = await response.json();
    return res.status(response.ok ? 200 : 500).json(data);
  }

  if (req.method === 'PUT') {
    const { slug, locale, data } = req.body || {};
    if (!slug || !locale || !['es', 'ca'].includes(locale)) {
      return res.status(400).json({ error: 'slug y locale (es|ca) requeridos' });
    }
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'data debe ser un objeto' });
    }
    const row = {
      slug,
      locale,
      data,
      updated_at: new Date().toISOString(),
    };
    const response = await fetch(`${base}?on_conflict=slug,locale`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(row),
    });
    const result = await response.json();
    return res.status(response.ok ? 200 : 500).json(result);
  }

  if (req.method === 'DELETE') {
    const { slug, locale } = req.query;
    if (!slug || !locale) {
      return res.status(400).json({ error: 'slug y locale en query requeridos' });
    }
    const response = await fetch(
      `${base}?slug=eq.${encodeURIComponent(slug)}&locale=eq.${encodeURIComponent(locale)}`,
      { method: 'DELETE', headers: supabaseHeaders() },
    );
    return res.status(response.ok ? 204 : 500).end();
  }

  return res.status(405).end();
}
