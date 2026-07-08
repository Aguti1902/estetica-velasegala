// Panel de administración: listar y marcar tarjetas como usadas
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Password');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Verificar contraseña de admin
  const adminPwd = req.headers['x-admin-password'];
  if (adminPwd !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const base = `${process.env.SUPABASE_URL}/rest/v1/gift_cards`;
  const headers = {
    'apikey': process.env.SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  };

  // GET: listar todas las tarjetas (con filtros opcionales)
  if (req.method === 'GET') {
    const { search, used } = req.query;
    let query = `${base}?select=*&order=created_at.desc`;
    if (used === 'true') query += '&is_used=eq.true';
    if (used === 'false') query += '&is_used=eq.false';
    if (search) query += `&or=(code.ilike.*${search}*,buyer_email.ilike.*${search}*,buyer_name.ilike.*${search}*)`;

    const response = await fetch(query, { headers });
    const data = await response.json();
    return res.status(response.ok ? 200 : 500).json(data);
  }

  // PATCH: marcar tarjeta como usada o no usada
  if (req.method === 'PATCH') {
    const { code, is_used, used_by } = req.body;
    if (!code) return res.status(400).json({ error: 'Falta el código' });

    const updateUrl = `${base}?code=eq.${encodeURIComponent(code)}`;
    const updateData = {
      is_used: Boolean(is_used),
      used_at: is_used ? new Date().toISOString() : null,
      used_by: is_used ? (used_by || 'Admin') : null,
    };

    const response = await fetch(updateUrl, {
      method: 'PATCH',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    return res.status(response.ok ? 200 : 500).json(data);
  }

  return res.status(405).end();
}
