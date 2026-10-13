import { adminCors, requireAdmin } from '../_lib/adminAuth.js';
import { supabaseConfigured, supabaseHeaders, supabaseRest } from '../_lib/supabase.js';

const CHANNELS = ['whatsapp', 'phone', 'web', 'instagram', 'walkin', 'other'];
const STATUSES = ['confirmed', 'pending', 'cancelled', 'completed'];

export default async function handler(req, res) {
  adminCors(res, 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  if (!supabaseConfigured()) {
    return res.status(503).json({ error: 'Supabase no configurado' });
  }

  const base = supabaseRest('appointments');
  const headers = supabaseHeaders('return=representation');

  if (req.method === 'GET') {
    const { from, to, include_cancelled } = req.query;
    let url = `${base}?select=*&order=starts_at.asc`;
    if (from) url += `&starts_at=gte.${encodeURIComponent(from)}`;
    if (to) url += `&starts_at=lt.${encodeURIComponent(to)}`;
    if (include_cancelled !== 'true') url += `&status=neq.cancelled`;
    const response = await fetch(url, { headers: supabaseHeaders() });
    const data = await response.json();
    return res.status(response.ok ? 200 : 500).json(data);
  }

  if (req.method === 'POST') {
    const row = normalizeBody(req.body);
    if (row.error) return res.status(400).json({ error: row.error });
    const response = await fetch(base, {
      method: 'POST',
      headers,
      body: JSON.stringify(row),
    });
    const data = await response.json();
    return res.status(response.ok ? 201 : 500).json(data);
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const { id, ...rest } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id requerido' });
    const row = normalizeBody(rest, true);
    if (row.error) return res.status(400).json({ error: row.error });
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

function normalizeBody(body, partial = false) {
  if (!body || typeof body !== 'object') return { error: 'Body inválido' };
  const out = {};

  if (!partial || body.client_name !== undefined) {
    const name = String(body.client_name || '').trim();
    if (!name) return { error: 'Nombre de cliente obligatorio' };
    out.client_name = name;
  }
  if (body.client_phone !== undefined) out.client_phone = String(body.client_phone || '').trim() || null;
  if (body.client_email !== undefined) out.client_email = String(body.client_email || '').trim() || null;
  if (body.service_name !== undefined) out.service_name = String(body.service_name || '').trim() || null;
  if (body.service_slug !== undefined) out.service_slug = String(body.service_slug || '').trim() || null;
  if (body.notes !== undefined) out.notes = String(body.notes || '').trim() || null;
  if (body.employee !== undefined) out.employee = String(body.employee || 'Natalia').trim() || 'Natalia';

  if (!partial || body.starts_at !== undefined) {
    if (!body.starts_at) return { error: 'Fecha/hora de inicio obligatoria' };
    out.starts_at = body.starts_at;
  }
  if (!partial || body.ends_at !== undefined) {
    if (!body.ends_at) return { error: 'Fecha/hora de fin obligatoria' };
    out.ends_at = body.ends_at;
  }
  if (out.starts_at && out.ends_at && new Date(out.ends_at) <= new Date(out.starts_at)) {
    return { error: 'La hora de fin debe ser posterior al inicio' };
  }

  if (body.channel !== undefined) {
    if (!CHANNELS.includes(body.channel)) return { error: 'Canal no válido' };
    out.channel = body.channel;
  } else if (!partial) {
    out.channel = 'whatsapp';
  }

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) return { error: 'Estado no válido' };
    out.status = body.status;
  } else if (!partial) {
    out.status = 'confirmed';
  }

  if (!partial) out.employee = out.employee || 'Natalia';

  return out;
}
