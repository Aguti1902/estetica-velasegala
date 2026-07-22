// Webhook de Stripe: genera código único, guarda en Supabase, envía email
import { createHmac } from 'crypto';

export const config = { api: { bodyParser: false } };

// Lee el body crudo (necesario para verificar la firma de Stripe)
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Verifica la firma del webhook de Stripe
function verifyStripeSignature(payload, sigHeader, secret) {
  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [k, v] = part.split('=');
    acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts['t'];
  const signature = parts['v1'];
  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac('sha256', secret).update(signedPayload).digest('hex');
  return expected === signature;
}

// Genera un código de tarjeta única: VS-XXXX-XXXX
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `VS-${part(4)}-${part(4)}`;
}

// Guarda la tarjeta en Supabase via REST
async function saveGiftCard(data) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/gift_cards`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(result));
  return Array.isArray(result) ? result[0] : result;
}

async function getGiftCardBySessionId(sessionId) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/gift_cards?stripe_session_id=eq.${encodeURIComponent(sessionId)}&select=*&limit=1`;
  const response = await fetch(url, {
    headers: {
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data[0] || null;
}

function isDuplicateError(err) {
  const message = String(err.message || err);
  return message.includes('duplicate') || message.includes('23505') || message.includes('unique');
}

function assertEnv() {
  const required = [
    'STRIPE_WEBHOOK_SECRET',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RESEND_API_KEY',
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
  }
}

// Envía el email con los datos de la tarjeta
async function sendGiftCardEmail(card) {
  const emailHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Georgia', serif; background: #f9f6f1; margin: 0; padding: 40px 20px; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.08); }
  .header { background: #1a1a1a; color: white; padding: 40px; text-align: center; }
  .header h1 { font-size: 24px; letter-spacing: 6px; text-transform: uppercase; margin: 0 0 8px; font-weight: 300; }
  .header p { color: #c9a882; letter-spacing: 3px; font-size: 12px; margin: 0; }
  .body { padding: 50px 40px; }
  .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 24px; }
  .card-box { border: 2px solid #c9a882; border-radius: 4px; padding: 32px; text-align: center; margin: 32px 0; background: #fdf8f3; }
  .card-amount { font-size: 56px; font-weight: 700; color: #1a1a1a; line-height: 1; margin-bottom: 8px; }
  .card-label { font-size: 11px; letter-spacing: 4px; color: #7a6352; text-transform: uppercase; margin-bottom: 24px; }
  .card-code { font-family: 'Courier New', monospace; font-size: 22px; letter-spacing: 6px; color: #c9a882; font-weight: 700; background: white; padding: 12px 24px; border-radius: 4px; border: 1px solid #e8d9c8; display: inline-block; margin-top: 8px; }
  .code-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #b89e87; margin-bottom: 8px; }
  .info { color: #7a6352; font-size: 15px; line-height: 1.8; margin-bottom: 24px; }
  .message-box { background: #f9f6f1; border-left: 3px solid #c9a882; padding: 16px 20px; margin: 24px 0; font-style: italic; color: #7a6352; border-radius: 0 4px 4px 0; }
  .contact { text-align: center; padding: 32px; border-top: 1px solid #e8d9c8; }
  .contact p { color: #b89e87; font-size: 13px; margin: 4px 0; }
  .footer { background: #1a1a1a; color: #7a6352; text-align: center; padding: 24px; font-size: 11px; letter-spacing: 2px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Vela Segalà</h1>
    <p>ESTÈTICA · VILADECANS</p>
  </div>
  <div class="body">
    <p class="greeting">Hola ${card.buyer_name},</p>
    <p class="info">Gracias por tu compra. Aquí tienes tu tarjeta regalo para disfrutar en nuestra clínica estética de Viladecans.</p>
    
    <div class="card-box">
      <div class="card-amount">${card.amount}€</div>
      <div class="card-label">Tarjeta Regalo · Vela Segalà</div>
      <div class="code-label">Código de canje</div>
      <div class="card-code">${card.code}</div>
    </div>

    ${card.recipient_name ? `<p class="info"><strong>Para:</strong> ${card.recipient_name}</p>` : ''}
    ${card.message ? `<div class="message-box">"${card.message}"</div>` : ''}
    
    <p class="info">
      Presenta este código (o muestra este email) en nuestra clínica para canjear la tarjeta. 
      La tarjeta no tiene fecha de caducidad y es válida para cualquier tratamiento.
    </p>
  </div>
  <div class="contact">
    <p><strong>Vela Segalà Estètica</strong></p>
    <p>Viladecans, Barcelona</p>
    <p>esteticavelasegala.com</p>
  </div>
  <div class="footer">
    <p>TARJETA REGALO · NO REEMBOLSABLE · VÁLIDA PARA CUALQUIER TRATAMIENTO</p>
  </div>
</div>
</body>
</html>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Vela Segalà <info@esteticavelasegala.com>',
      to: [card.buyer_email],
      subject: `Tu tarjeta regalo de ${card.amount}€ – Vela Segalà`,
      html: emailHTML,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Email error:', err);
    throw new Error(`Error enviando email: ${err}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    assertEnv();
  } catch (err) {
    console.error('Webhook config error:', err.message);
    return res.status(500).json({ error: err.message });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig) return res.status(400).json({ error: 'Sin firma' });

  const rawBody = await getRawBody(req);
  const rawString = rawBody.toString('utf8');

  if (!verifyStripeSignature(rawString, sig, process.env.STRIPE_WEBHOOK_SECRET)) {
    return res.status(400).json({ error: 'Firma inválida' });
  }

  let event;
  try {
    event = JSON.parse(rawString);
  } catch {
    return res.status(400).json({ error: 'JSON inválido' });
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true, ignored: true });
  }

  try {
    const session = event.data.object;

    if (session.payment_status !== 'paid') {
      return res.status(200).json({ received: true, ignored: true, reason: 'not_paid' });
    }

    const existing = await getGiftCardBySessionId(session.id);
    if (existing) {
      return res.status(200).json({ received: true, duplicate: true, code: existing.code });
    }

    const meta = session.metadata || {};
    const amount = Number(meta.amount);

    if (![50, 100, 200].includes(amount)) {
      throw new Error(`Importe inválido en metadata: ${meta.amount}`);
    }
    if (!meta.buyerEmail || !meta.buyerName) {
      throw new Error('Faltan buyerEmail o buyerName en metadata');
    }

    let saved;
    for (let i = 0; i < 5; i++) {
      const code = generateCode();
      try {
        saved = await saveGiftCard({
          code,
          amount,
          stripe_session_id: session.id,
          buyer_name: meta.buyerName,
          buyer_email: meta.buyerEmail,
          recipient_name: meta.recipientName || null,
          message: meta.message || null,
          is_used: false,
        });
        break;
      } catch (err) {
        if (!isDuplicateError(err)) throw err;
      }
    }

    if (!saved) {
      throw new Error('No se pudo generar un código único tras varios intentos');
    }

    await sendGiftCardEmail(saved);
    return res.status(200).json({ received: true, code: saved.code });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'Error procesando webhook' });
  }
}
