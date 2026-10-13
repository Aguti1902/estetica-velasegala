import { adminCors, requireAdmin } from '../_lib/adminAuth.js';
import { supabaseConfigured, supabaseHeaders, supabaseRest } from '../_lib/supabase.js';

export default async function handler(req, res) {
  adminCors(res, 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  if (!supabaseConfigured()) {
    return res.status(503).json({ error: 'Supabase no configurado' });
  }

  const base = supabaseRest('inventory_items');
  const headers = supabaseHeaders('return=representation');

  if (req.method === 'GET') {
    const { search, low_stock, limit = '200' } = req.query;
    let url = `${base}?select=*&order=name.asc&limit=${Math.min(Number(limit) || 200, 500)}`;
    if (search?.trim()) {
      const q = search.trim().replace(/[,()]/g, '');
      url += `&or=(name.ilike.*${encodeURIComponent(q)}*,sku.ilike.*${encodeURIComponent(q)}*,category.ilike.*${encodeURIComponent(q)}*)`;
    }
    const response = await fetch(url, { headers: supabaseHeaders() });
    let data = await response.json();
    if (!response.ok) return res.status(500).json(data);
    if (!Array.isArray(data)) data = [];
    if (low_stock === 'true') {
      data = data.filter((i) => Number(i.quantity) <= Number(i.min_quantity || 0));
    }
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Nombre obligatorio' });
    const row = {
      name,
      sku: String(req.body?.sku || '').trim() || null,
      category: String(req.body?.category || '').trim() || 'General',
      quantity: Number.isFinite(Number(req.body?.quantity)) ? Number(req.body.quantity) : 0,
      min_quantity: Number.isFinite(Number(req.body?.min_quantity)) ? Number(req.body.min_quantity) : 0,
      unit: String(req.body?.unit || 'ud').trim() || 'ud',
      notes: String(req.body?.notes || '').trim() || null,
    };
    const response = await fetch(base, { method: 'POST', headers, body: JSON.stringify(row) });
    const data = await response.json();
    return res.status(response.ok ? 201 : 500).json(data);
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const { id, ...rest } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id requerido' });
    const row = { updated_at: new Date().toISOString() };
    if (rest.name !== undefined) {
      const name = String(rest.name || '').trim();
      if (!name) return res.status(400).json({ error: 'Nombre obligatorio' });
      row.name = name;
    }
    if (rest.sku !== undefined) row.sku = String(rest.sku || '').trim() || null;
    if (rest.category !== undefined) row.category = String(rest.category || '').trim() || 'General';
    if (rest.quantity !== undefined) {
      const n = Number(rest.quantity);
      row.quantity = Number.isFinite(n) ? n : 0;
    }
    if (rest.min_quantity !== undefined) {
      const n = Number(rest.min_quantity);
      row.min_quantity = Number.isFinite(n) ? n : 0;
    }
    if (rest.unit !== undefined) row.unit = String(rest.unit || 'ud').trim() || 'ud';
    if (rest.notes !== undefined) row.notes = String(rest.notes || '').trim() || null;
    const response = await fetch(`${base}?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(row),
    });
    const data = await response.json();
    return res.status(response.ok ? 200 : 500).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id requerido' });
    const response = await fetch(`${base}?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: supabaseHeaders(),
    });
    return res.status(response.ok ? 204 : 500).end();
  }

  return res.status(405).end();
}
