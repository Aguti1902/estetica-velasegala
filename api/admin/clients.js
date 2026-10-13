import { adminCors, requireAdmin } from '../_lib/adminAuth.js';
import { supabaseConfigured, supabaseHeaders, supabaseRest } from '../_lib/supabase.js';

export default async function handler(req, res) {
  adminCors(res, 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  if (!supabaseConfigured()) {
    return res.status(503).json({ error: 'Supabase no configurado' });
  }

  const base = supabaseRest('clients');
  const headers = supabaseHeaders('return=representation');

  if (req.method === 'GET') {
    const { id, search, limit = '200' } = req.query;

    if (id) {
      const clientRes = await fetch(
        `${base}?id=eq.${encodeURIComponent(id)}&select=*&limit=1`,
        { headers: supabaseHeaders() },
      );
      const rows = await clientRes.json();
      if (!clientRes.ok || !rows?.[0]) {
        return res.status(404).json({ error: 'Clienta no encontrada' });
      }
      const stats = await buildClientStats(id, rows[0]);
      return res.status(200).json(stats);
    }

    let url = `${base}?select=*&order=name.asc&limit=${Math.min(Number(limit) || 200, 500)}`;
    if (search?.trim()) {
      const q = search.trim().replace(/[,()]/g, '');
      url += `&or=(name.ilike.*${encodeURIComponent(q)}*,phone.ilike.*${encodeURIComponent(q)}*,email.ilike.*${encodeURIComponent(q)}*)`;
    }
    const response = await fetch(url, { headers: supabaseHeaders() });
    const clients = await response.json();
    if (!response.ok) return res.status(500).json(clients);

    // Enriquecer con stats ligeras (últimas citas agregadas)
    const withStats = await Promise.all(
      (Array.isArray(clients) ? clients : []).map(async (c) => {
        const s = await buildClientStats(c.id, c, true);
        return s;
      }),
    );
    return res.status(200).json(withStats);
  }

  if (req.method === 'POST') {
    const row = normalizeClient(req.body);
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
    const row = normalizeClient(rest, true);
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
    // Soft-archive
    const response = await fetch(`${base}?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: 'archived', updated_at: new Date().toISOString() }),
    });
    return res.status(response.ok ? 200 : 500).json(await response.json());
  }

  return res.status(405).end();
}

function normalizeClient(body, partial = false) {
  if (!body || typeof body !== 'object') return { error: 'Body inválido' };
  const out = {};
  if (!partial || body.name !== undefined) {
    const name = String(body.name || '').trim();
    if (!name) return { error: 'Nombre obligatorio' };
    out.name = name;
  }
  if (body.phone !== undefined) out.phone = String(body.phone || '').trim() || null;
  if (body.email !== undefined) out.email = String(body.email || '').trim().toLowerCase() || null;
  if (body.notes !== undefined) out.notes = String(body.notes || '').trim() || null;
  if (body.status !== undefined) {
    if (!['active', 'archived'].includes(body.status)) return { error: 'Estado no válido' };
    out.status = body.status;
  } else if (!partial) {
    out.status = 'active';
  }
  return out;
}

async function buildClientStats(clientId, client, light = false) {
  const apptUrl =
    `${supabaseRest('appointments')}?client_id=eq.${encodeURIComponent(clientId)}` +
    `&select=id,service_name,service_slug,starts_at,ends_at,status,channel,amount,notes` +
    `&order=starts_at.desc`;
  const res = await fetch(apptUrl, { headers: supabaseHeaders() });
  const appts = (await res.json()) || [];
  const list = Array.isArray(appts) ? appts : [];

  const countable = list.filter((a) => a.status === 'completed' || a.status === 'confirmed');
  const totalSpent = countable.reduce((s, a) => s + (Number(a.amount) || 0), 0);
  const visitCount = countable.length;

  // Frecuencia media en días entre visitas (ordenado ascendente por fecha)
  let avgDaysBetween = null;
  if (visitCount >= 2) {
    const sorted = [...countable].sort(
      (a, b) => new Date(a.starts_at) - new Date(b.starts_at),
    );
    let sum = 0;
    for (let i = 1; i < sorted.length; i++) {
      sum += (new Date(sorted[i].starts_at) - new Date(sorted[i - 1].starts_at)) / 86400000;
    }
    avgDaysBetween = Math.round(sum / (sorted.length - 1));
  }

  const lastVisit = countable[0]?.starts_at || null;
  const treatmentsMap = {};
  for (const a of countable) {
    const key = a.service_name || 'Sin tratamiento';
    if (!treatmentsMap[key]) treatmentsMap[key] = { name: key, count: 0, spent: 0 };
    treatmentsMap[key].count += 1;
    treatmentsMap[key].spent += Number(a.amount) || 0;
  }
  const treatments = Object.values(treatmentsMap).sort((a, b) => b.count - a.count);

  const base = {
    ...client,
    stats: {
      visitCount,
      totalSpent,
      avgDaysBetween,
      lastVisit,
      frequencyLabel:
        avgDaysBetween == null
          ? visitCount === 0
            ? 'Sin visitas'
            : 'Primera visita / aún no hay patrón'
          : avgDaysBetween <= 7
            ? `Cada ~${avgDaysBetween} días`
            : avgDaysBetween <= 45
              ? `Cada ~${Math.round(avgDaysBetween / 7)} semanas`
              : `Cada ~${Math.round(avgDaysBetween / 30)} meses`,
    },
    treatments,
  };

  if (!light) base.appointments = list;
  return base;
}
