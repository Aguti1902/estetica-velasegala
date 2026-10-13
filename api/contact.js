import { supabaseConfigured, supabaseHeaders, supabaseRest } from './_lib/supabase.js';

// Formulario de contacto → envía email a la clínica vía Resend
// Destino (quién recibe): vela@velasegala.com
// Remitente técnico: NO usa vela@ (Resend exige un "from" verificado distinto)
const CLINIC_EMAIL = process.env.CONTACT_EMAIL || 'vela@velasegala.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Formulario Web <onboarding@resend.dev>';

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, service, clinic, message, source } = req.body || {};

  if (!name?.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return res.status(400).json({ error: 'El email no es válido' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY no configurada');
    return res.status(500).json({ error: 'Servicio de email no configurado' });
  }

  const trimmedName = String(name).trim();
  const trimmedEmail = String(email).trim().toLowerCase();

  if (supabaseConfigured()) {
    const row = {
      name: trimmedName,
      email: trimmedEmail,
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
  }

  const safeName = escapeHtml(trimmedName);
  const safeEmail = escapeHtml(trimmedEmail);
  const safePhone = escapeHtml(String(phone || '').trim()) || '—';
  const safeService = escapeHtml(String(service || '').trim()) || 'No especificado';
  const safeClinic = escapeHtml(String(clinic || '').trim()) || '—';
  const safeMessage = escapeHtml(String(message || '').trim()).replace(/\n/g, '<br>') || '—';

  const emailHTML = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family: Georgia, serif; background: #f2ebe3; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.08);">
    <div style="background: #1f1814; color: white; padding: 32px 40px; text-align: center;">
      <h1 style="font-size: 22px; letter-spacing: 4px; text-transform: uppercase; margin: 0 0 6px; font-weight: 300;">Nuevo mensaje web</h1>
      <p style="color: #8b5e3c; letter-spacing: 2px; font-size: 12px; margin: 0;">Vela Segalà · Viladecans</p>
    </div>
    <div style="padding: 40px;">
      <p style="color: #5c4030; font-size: 15px; line-height: 1.7; margin: 0 0 28px;">
        Has recibido un nuevo mensaje desde el formulario de contacto de <strong>esteticavelasegala.com</strong>.
      </p>
      <table style="width: 100%; border-collapse: collapse; font-size: 15px; color: #1f1814;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #d4c2ad; color: #9a7355; width: 140px; vertical-align: top;">Nombre</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #d4c2ad;"><strong>${safeName}</strong></td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #d4c2ad; color: #9a7355; vertical-align: top;">Email</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #d4c2ad;"><a href="mailto:${safeEmail}" style="color: #1f1814;">${safeEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #d4c2ad; color: #9a7355; vertical-align: top;">Teléfono</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #d4c2ad;">${safePhone}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #d4c2ad; color: #9a7355; vertical-align: top;">Servicio</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #d4c2ad;">${safeService}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #d4c2ad; color: #9a7355; vertical-align: top;">Clínica</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #d4c2ad;">${safeClinic}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #9a7355; vertical-align: top;">Mensaje</td>
          <td style="padding: 12px 0; line-height: 1.6;">${safeMessage}</td>
        </tr>
      </table>
    </div>
    <div style="background: #f2ebe3; padding: 20px 40px; text-align: center; font-size: 12px; color: #9a7355;">
      Responde directamente a este email para contactar con el cliente.
    </div>
  </div>
</body>
</html>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [CLINIC_EMAIL],
        reply_to: trimmedEmail,
        subject: `Nuevo contacto web: ${trimmedName}`,
        html: emailHTML,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return res.status(502).json({ error: 'No se pudo enviar el mensaje. Inténtalo de nuevo.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ error: 'Error interno al enviar el mensaje' });
  }
}
