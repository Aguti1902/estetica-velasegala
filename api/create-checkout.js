// Crea una sesión de pago Stripe Checkout (sin SDK, usando REST API)
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amount, buyerName, buyerEmail, recipientName, message } = req.body;

  const VALID_AMOUNTS = [50, 100, 200];
  if (!VALID_AMOUNTS.includes(Number(amount))) {
    return res.status(400).json({ error: 'Importe no válido' });
  }
  if (!buyerEmail || !buyerName) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const origin = req.headers.origin || process.env.SITE_URL || 'https://esteticavelasegala.com';

  try {
    const params = new URLSearchParams({
      'payment_method_types[]': 'card',
      'line_items[0][price_data][currency]': 'eur',
      'line_items[0][price_data][product_data][name]': `Tarjeta Regalo Vela Segalà ${amount}€`,
      'line_items[0][price_data][product_data][description]': 'Tarjeta de regalo para tratamientos estéticos',
      'line_items[0][price_data][unit_amount]': String(Number(amount) * 100),
      'line_items[0][quantity]': '1',
      'mode': 'payment',
      'customer_email': buyerEmail,
      'success_url': `${origin}/tarjetas-regalo/confirmacion?session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url': `${origin}/tarjetas-regalo`,
      'metadata[amount]': String(amount),
      'metadata[buyerName]': buyerName,
      'metadata[buyerEmail]': buyerEmail,
      'metadata[recipientName]': recipientName || '',
      'metadata[message]': (message || '').substring(0, 499),
    });

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      console.error('Stripe error:', session);
      return res.status(500).json({ error: session.error?.message || 'Error de Stripe' });
    }

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('create-checkout error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
