import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function GiftCardSuccessPage() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) { setError('No se encontró la sesión de pago.'); setLoading(false); return; }

    // Polling para dar tiempo al webhook de Stripe a procesar
    let attempts = 0;
    const poll = async () => {
      attempts++;
      try {
        const res = await fetch(`/api/gift-cards?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setCard(data);
          setLoading(false);
          return;
        }
      } catch {}

      if (attempts < 10) {
        setTimeout(poll, 2000);
      } else {
        setError('La tarjeta se está procesando. Recibirás un email con todos los detalles en breve.');
        setLoading(false);
      }
    };

    setTimeout(poll, 3000); // espera inicial de 3s
  }, [sessionId]);

  const downloadPDF = () => {
    if (!card) return;
    const html = buildGiftCardHTML(card);
    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.open();
    w.document.write(html);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 600);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', paddingTop: '80px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '3px solid var(--warm-200)',
          borderTopColor: '#c9a882',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: '#7a6352', fontSize: '15px' }}>Procesando tu pago...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error && !card) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px', paddingTop: '80px' }}>
        <p style={{ fontSize: '40px', marginBottom: '16px' }}>📧</p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, marginBottom: '16px', color: '#1a1a1a' }}>
          ¡Pago completado!
        </h2>
        <p style={{ color: '#7a6352', maxWidth: '480px', lineHeight: 1.7 }}>{error}</p>
        <Link to="/" className="btn-primary" style={{ marginTop: '32px', display: 'inline-block', padding: '14px 32px', textDecoration: 'none', fontSize: '13px', letterSpacing: '2px' }}>
          VOLVER AL INICIO
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', paddingTop: '80px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '60px 24px' }}>

        {/* Cabecera de éxito */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <svg width="32" height="32" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 400, color: '#1a1a1a', marginBottom: '12px' }}>
            ¡Tarjeta enviada!
          </h1>
          <p style={{ color: '#7a6352', fontSize: '16px' }}>
            Hemos enviado la tarjeta regalo a <strong>{card?.buyerEmail}</strong>
          </p>
        </motion.div>

        {/* Tarjeta visual */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            borderRadius: '16px',
            padding: '48px',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          }}>
            {/* Decoración */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(201,168,130,0.08)' }} />
            <div style={{ position: 'absolute', bottom: '-70px', left: '30%', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(201,168,130,0.05)' }} />

            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
              <div>
                <p style={{ color: '#c9a882', fontSize: '10px', letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Vela Segalà Estètica
                </p>
                <p style={{ color: '#888', fontSize: '12px' }}>Viladecans, Barcelona</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#c9a882', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase' }}>Tarjeta Regalo</p>
              </div>
            </div>

            <div style={{ position: 'relative', textAlign: 'center', padding: '32px 0' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '4.5rem', color: 'white', fontWeight: 700, lineHeight: 1, marginBottom: '8px' }}>
                {card?.amount}€
              </p>
              {card?.recipientName && (
                <p style={{ color: '#b89e87', fontSize: '15px', marginBottom: '4px' }}>
                  Para: <span style={{ color: 'white' }}>{card.recipientName}</span>
                </p>
              )}
            </div>

            <div style={{ position: 'relative', borderTop: '1px solid #333', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ color: '#555', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Código de canje
                </p>
                <p style={{
                  fontFamily: 'monospace', fontSize: '1.5rem', color: '#c9a882',
                  letterSpacing: '4px', fontWeight: 700,
                }}>
                  {card?.code}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#555', fontSize: '11px' }}>Sin fecha de caducidad</p>
              </div>
            </div>
          </div>

          {/* Mensaje personal */}
          {card?.message && (
            <div style={{
              background: 'white', border: '1px solid var(--warm-200)', borderRadius: '4px',
              padding: '24px 28px', marginBottom: '32px',
              borderLeft: '3px solid var(--accent)',
            }}>
              <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#b89e87', marginBottom: '10px' }}>
                Mensaje personal
              </p>
              <p style={{ color: '#7a6352', fontStyle: 'italic', lineHeight: 1.7 }}>
                "{card.message}"
              </p>
            </div>
          )}

          {/* Acciones */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '48px', flexWrap: 'wrap' }}>
            <motion.button
              onClick={downloadPDF}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary"
              style={{ flex: 1, padding: '14px', fontSize: '13px', letterSpacing: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              DESCARGAR PDF
            </motion.button>

            <motion.button
              onClick={() => {
                navigator.clipboard.writeText(card?.code || '');
                alert('Código copiado al portapapeles');
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                flex: 1, padding: '14px', fontSize: '13px', letterSpacing: '2px',
                border: '1px solid #1a1a1a', background: 'transparent', cursor: 'pointer',
                borderRadius: '2px', color: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
              COPIAR CÓDIGO
            </motion.button>
          </div>

          {/* Info */}
          <div style={{ background: 'white', border: '1px solid var(--warm-200)', borderRadius: '4px', padding: '28px' }}>
            <h3 style={{ fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: '16px' }}>
              ¿Cómo canjear tu tarjeta?
            </h3>
            {[
              'Llama o escribe para reservar tu cita en Vela Segalà Viladecans.',
              'El día de la visita, presenta este email o el PDF con el código.',
              'El equipo verificará el código y aplicará el descuento.',
              'Puedes usar el saldo en varias visitas si el importe es mayor.',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: '#1a1a1a', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 600, flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <p style={{ color: '#7a6352', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{step}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/" style={{ color: '#b89e87', fontSize: '13px', textDecoration: 'none', letterSpacing: '2px' }}>
              ← VOLVER AL INICIO
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Genera el HTML para el PDF imprimible
function buildGiftCardHTML(card) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Tarjeta Regalo Vela Segalà – ${card.amount}€</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4 landscape; margin: 0; }
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    background: #f9f6f1;
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; padding: 40px;
  }
  .card {
    width: 260mm; max-width: 100%;
    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
    border-radius: 16px;
    padding: 50px 60px;
    position: relative;
    overflow: hidden;
    color: white;
  }
  .circle1 { position: absolute; top: -60px; right: -60px; width: 260px; height: 260px; border-radius: 50%; background: rgba(201,168,130,0.08); }
  .circle2 { position: absolute; bottom: -80px; left: 35%; width: 220px; height: 220px; border-radius: 50%; background: rgba(201,168,130,0.05); }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; position: relative; }
  .brand { }
  .brand-name { font-size: 20px; letter-spacing: 6px; text-transform: uppercase; font-weight: 300; color: white; }
  .brand-sub { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #c9a882; margin-top: 4px; }
  .label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: #c9a882; text-align: right; }
  .body { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; position: relative; }
  .amount { font-size: 96px; font-weight: 700; line-height: 1; color: white; }
  .recipient { text-align: right; }
  .recipient-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #888; margin-bottom: 8px; }
  .recipient-name { font-size: 22px; color: white; font-weight: 300; margin-bottom: 16px; }
  .message { font-style: italic; color: #b89e87; font-size: 14px; max-width: 280px; line-height: 1.6; text-align: right; }
  .footer { border-top: 1px solid #333; padding-top: 28px; display: flex; justify-content: space-between; align-items: flex-end; position: relative; }
  .code-section { }
  .code-label { font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: #666; margin-bottom: 8px; }
  .code { font-family: 'Courier New', monospace; font-size: 28px; letter-spacing: 6px; color: #c9a882; font-weight: 700; }
  .meta { text-align: right; }
  .meta p { font-size: 11px; color: #555; margin-bottom: 4px; letter-spacing: 1px; }
  .no-print { }
  @media print {
    body { background: transparent; padding: 0; }
    .card { width: 100%; border-radius: 0; }
  }
</style>
</head>
<body>
<div class="card">
  <div class="circle1"></div>
  <div class="circle2"></div>

  <div class="header">
    <div class="brand">
      <div class="brand-name">Vela Segalà</div>
      <div class="brand-sub">Estètica · Viladecans</div>
    </div>
    <div class="label">Tarjeta Regalo</div>
  </div>

  <div class="body">
    <div class="amount">${card.amount}€</div>
    <div class="recipient">
      ${card.recipientName ? `<div class="recipient-label">Para</div><div class="recipient-name">${card.recipientName}</div>` : ''}
      ${card.message ? `<div class="message">"${card.message}"</div>` : ''}
    </div>
  </div>

  <div class="footer">
    <div class="code-section">
      <div class="code-label">Código de canje</div>
      <div class="code">${card.code}</div>
    </div>
    <div class="meta">
      <p>esteticavelasegala.com</p>
      <p>Sin fecha de caducidad</p>
      <p>Válida para cualquier tratamiento</p>
      <p style="color:#444; margin-top:8px; font-size:9px;">Emitida el ${new Date(card.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
  </div>
</div>
<script>
  // Auto-print si se abre solo para eso
</script>
</body>
</html>`;
}
