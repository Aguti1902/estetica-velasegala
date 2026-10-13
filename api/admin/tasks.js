import { adminCors, requireAdmin } from '../_lib/adminAuth.js';
import { supabaseConfigured, supabaseHeaders, supabaseRest } from '../_lib/supabase.js';

export default async function handler(req, res) {
  adminCors(res, 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  if (!supabaseConfigured()) {
    return res.status(503).json({ error: 'Supabase no configurado' });
  }

  const base = supabaseRest('admin_tasks');
  const headers = supabaseHeaders('return=representation');

  if (req.method === 'GET') {
    const { status, limit = '100' } = req.query;
    let url = `${base}?select=*&order=done.asc,due_date.asc.nullslast,created_at.desc&limit=${Math.min(Number(limit) || 100, 300)}`;
    if (status === 'open') url += '&done=eq.false';
    if (status === 'done') url += '&done=eq.true';
    const response = await fetch(url, { headers: supabaseHeaders() });
    const data = await response.json();
    return res.status(response.ok ? 200 : 500).json(data);
  }

  if (req.method === 'POST') {
    const title = String(req.body?.title || '').trim();
    if (!title) return res.status(400).json({ error: 'Título obligatorio' });
    const row = {
      title,
      notes: String(req.body?.notes || '').trim() || null,
      due_date: req.body?.due_date || null,
      priority: ['low', 'normal', 'high'].includes(req.body?.priority) ? req.body.priority : 'normal',
      done: false,
    };
    const response = await fetch(base, { method: 'POST', headers, body: JSON.stringify(row) });
    const data = await response.json();
    return res.status(response.ok ? 201 : 500).json(data);
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const { id, ...rest } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id requerido' });
    const row = {};
    if (rest.title !== undefined) {
      const title = String(rest.title || '').trim();
      if (!title) return res.status(400).json({ error: 'Título obligatorio' });
      row.title = title;
    }
    if (rest.notes !== undefined) row.notes = String(rest.notes || '').trim() || null;
    if (rest.due_date !== undefined) row.due_date = rest.due_date || null;
    if (rest.priority !== undefined) {
      if (!['low', 'normal', 'high'].includes(rest.priority)) return res.status(400).json({ error: 'Prioridad no válida' });
      row.priority = rest.priority;
    }
    if (rest.done !== undefined) {
      row.done = Boolean(rest.done);
      row.done_at = row.done ? new Date().toISOString() : null;
    }
    row.updated_at = new Date().toISOString();
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
