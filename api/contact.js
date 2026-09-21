import { supabaseConfigured, supabaseHeaders, supabaseRest } from './_lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, phone, service, clinic, message, source } = req.body || {};
  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email no válido' });
  }

  if (!supabaseConfigured()) {
    console.warn('contact: Supabase no configurado');
    return res.status(503).json({ error: 'Servicio temporalmente no disponible' });
  }

  const row = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    service: service?.trim() || null,
    clinic: clinic?.trim() || null,
    message: message?.trim() || null,
    source: source?.trim() || 'contact',
    status: 'new',
  };

  const response = await fetch(supabaseRest('contact_submissions'), {
    method: 'POST',
    headers: supabaseHeaders('return=representation'),
    body: JSON.stringify(row),
  });
  const data = await response.json();
  if (!response.ok) {
    console.error('contact insert', data);
    return res.status(500).json({ error: 'No se pudo guardar el mensaje' });
  }

  if (process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFY_EMAIL) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL || 'Estetica Segala <onboarding@resend.dev>',
          to: [process.env.CONTACT_NOTIFY_EMAIL],
          subject: `Nuevo contacto web: ${row.name}`,
          text: [
            `Nombre: ${row.name}`,
            `Email: ${row.email}`,
            row.phone && `Teléfono: ${row.phone}`,
            row.service && `Tratamiento: ${row.service}`,
            row.clinic && `Clínica: ${row.clinic}`,
            row.message && `\nMensaje:\n${row.message}`,
          ]
            .filter(Boolean)
            .join('\n'),
        }),
      });
    } catch (e) {
      console.warn('contact email notify failed', e);
    }
  }

  return res.status(201).json({ ok: true, id: data[0]?.id });
}
