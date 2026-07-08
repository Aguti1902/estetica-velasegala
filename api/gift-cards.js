// API para consultar detalles de una tarjeta (por session_id, para la página de confirmación)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'Falta session_id' });

  const url = `${process.env.SUPABASE_URL}/rest/v1/gift_cards?stripe_session_id=eq.${encodeURIComponent(session_id)}&select=*`;

  const response = await fetch(url, {
    headers: {
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.length) {
    return res.status(404).json({ error: 'Tarjeta no encontrada' });
  }

  const card = data[0];
  // Solo devolver campos públicos
  return res.status(200).json({
    code: card.code,
    amount: card.amount,
    buyerName: card.buyer_name,
    buyerEmail: card.buyer_email,
    recipientName: card.recipient_name,
    message: card.message,
    createdAt: card.created_at,
  });
}
