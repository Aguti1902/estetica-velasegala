import { adminCors, requireAdmin } from '../_lib/adminAuth.js';
import { supabaseConfigured } from '../_lib/supabase.js';

const BUCKET = 'treatment-images';
const MAX_BYTES = 4 * 1024 * 1024;

export default async function handler(req, res) {
  adminCors(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  if (req.method !== 'POST') return res.status(405).end();

  if (!supabaseConfigured()) {
    return res.status(503).json({ error: 'Supabase no configurado' });
  }

  const { filename, contentType, dataBase64 } = req.body || {};
  if (!filename || !dataBase64) {
    return res.status(400).json({ error: 'filename y dataBase64 requeridos' });
  }

  const safeName = String(filename)
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .slice(0, 120);
  const path = `${Date.now()}-${safeName}`;

  let buffer;
  try {
    buffer = Buffer.from(dataBase64, 'base64');
  } catch {
    return res.status(400).json({ error: 'Base64 inválido' });
  }
  if (buffer.length > MAX_BYTES) {
    return res.status(400).json({ error: 'Imagen demasiado grande (máx. 4 MB)' });
  }

  const uploadUrl = `${process.env.SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: process.env.SUPABASE_ANON_KEY,
      'Content-Type': contentType || 'image/jpeg',
      'x-upsert': 'false',
    },
    body: buffer,
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('upload', err);
    return res.status(500).json({ error: 'Error al subir la imagen' });
  }

  const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  return res.status(200).json({ url: publicUrl, path });
}
