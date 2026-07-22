import { useState } from 'react';
import { motion } from 'framer-motion';
import GiftCardEmbeddedCheckout from '../components/GiftCardEmbeddedCheckout';

const AMOUNTS = [50, 100, 200];

const TRUST_ITEMS = [
  {
    title: 'Envío instantáneo',
    text: 'Recibes la tarjeta en tu email en segundos, listo para regalar',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    title: 'Sin fecha de caducidad',
    text: 'Úsala cuando quieras, no hay prisa ni límite de tiempo',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Pago 100% seguro',
    text: 'Procesado por Stripe con cifrado SSL. No guardamos datos de tarjeta',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: 'Válida en clínica',
    text: 'Canjeable en cualquier tratamiento de Vela Segalà Viladecans',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    title: 'Personalizable',
    text: 'Añade el nombre y un mensaje para que el regalo sea único',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L18 8.625" />
      </svg>
    ),
  },
  {
    title: 'PDF descargable',
    text: 'Descarga e imprime la tarjeta en papel para un regalo más especial',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    title: 'Atención experta',
    text: 'Más de 15 años de experiencia en medicina y estética avanzada',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    title: 'Flexibilidad total',
    text: 'Puedes dividir el saldo en varias visitas si el importe es mayor al tratamiento',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
];

const AMOUNT_PERKS = {
  50: ['1–2 tratamientos faciales', 'Peeling químico', 'Hidratación profunda'],
  100: ['Pack 2–3 sesiones', 'Tratamiento corporal', 'Mesoterapia facial'],
  200: ['Pack premium completo', 'Medicina estética', 'Remodelación corporal'],
};

export default function GiftCardsPage() {
  const [selected, setSelected] = useState(100);
  const [step, setStep] = useState(1); // 1: importe, 2: datos, 3: pago embebido
  const [form, setForm] = useState({
    buyerName: '',
    buyerEmail: '',
    recipientName: '',
    message: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleContinue = () => {
    setStep(2);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    if (!form.buyerName.trim() || !form.buyerEmail.trim()) {
      setError('Completa tu nombre y email para continuar');
      return;
    }
    setError('');
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const checkoutData = {
    amount: selected,
    buyerName: form.buyerName.trim(),
    buyerEmail: form.buyerEmail.trim(),
    recipientName: form.recipientName.trim(),
    message: form.message.trim(),
  };

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh' }}>

      {/* Hero — imagen de fondo con overlay */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 'clamp(280px, 50vw, 420px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Imagen de fondo */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=1600&q=80)',
          backgroundSize: 'cover', backgroundPosition: 'center 30%',
          filter: 'brightness(0.35)',
        }} />
        {/* Overlay degradado */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(26,26,26,0.6) 0%, rgba(26,26,26,0.85) 100%)',
        }} />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ position: 'relative', textAlign: 'center', padding: 'clamp(60px, 10vw, 100px) 20px clamp(40px, 8vw, 80px)', color: 'white' }}
        >
          <p style={{ letterSpacing: '6px', fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '16px' }}>
            Vela Segalà · Viladecans
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 400, margin: '0 0 20px', lineHeight: 1.1 }}>
            Tarjetas Regalo
          </h1>
          <p style={{ color: '#c9b49a', fontSize: '17px', maxWidth: '480px', margin: '0 auto 36px', lineHeight: 1.7 }}>
            Regala bienestar y belleza. El detalle perfecto para quien más quieres.
          </p>
          {/* Pillars rápidos */}
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['50€ · 100€ · 200€', 'Sin fecha de caducidad', 'Email instantáneo'].map(t => (
              <span key={t} style={{
                fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)', borderLeft: '2px solid #c9a882', paddingLeft: '10px',
              }}>{t}</span>
            ))}
          </div>
        </motion.div>
      </section>

      <div style={{ maxWidth: step === 3 ? '960px' : '800px', margin: '0 auto', padding: '60px 24px' }}>

        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, textAlign: 'center', marginBottom: '8px', color: '#1a1a1a' }}>
              Elige el importe
            </h2>
            <p style={{ textAlign: 'center', color: '#7a6352', marginBottom: '48px' }}>
              Todas las tarjetas son válidas para cualquier tratamiento, sin fecha de caducidad.
            </p>

            {/* Tarjetas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '48px' }}>
              {AMOUNTS.map(amt => (
                <motion.button
                  key={amt}
                  onClick={() => setSelected(amt)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: selected === amt ? '#1a1a1a' : 'white',
                    color: selected === amt ? 'white' : '#1a1a1a',
                    border: selected === amt ? '2px solid #1a1a1a' : '2px solid var(--warm-200)',
                    borderRadius: '4px',
                    padding: '36px 28px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {selected === amt && (
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}

                  <div style={{
                    fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase',
                    color: selected === amt ? '#c9a882' : '#b89e87', marginBottom: '12px',
                  }}>
                    Tarjeta Regalo
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-serif)', fontSize: '3rem', fontWeight: 700, lineHeight: 1,
                    marginBottom: '20px',
                    color: selected === amt ? 'white' : '#1a1a1a',
                  }}>
                    {amt}€
                  </div>

                  <div style={{ borderTop: `1px solid ${selected === amt ? '#333' : 'var(--warm-200)'}`, paddingTop: '16px' }}>
                    {AMOUNT_PERKS[amt].map(perk => (
                      <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <div style={{
                          width: '4px', height: '4px', borderRadius: '50%',
                          background: selected === amt ? '#c9a882' : '#b89e87',
                          flexShrink: 0,
                        }} />
                        <span style={{ fontSize: '13px', color: selected === amt ? '#ccc' : '#7a6352' }}>
                          {perk}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Bloque imagen + tarjeta visual */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              borderRadius: '12px', overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
              marginBottom: '48px',
            }} className="gift-preview-grid">
              {/* Imagen */}
              <div style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80)',
                backgroundSize: 'cover', backgroundPosition: 'center',
                minHeight: '220px',
              }} />
              {/* Tarjeta */}
              <div style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                padding: '36px', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(201,168,130,0.08)' }} />
                <div>
                  <p style={{ color: '#c9a882', fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Vela Segalà Estètica
                  </p>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', color: 'white', fontWeight: 700, margin: 0, lineHeight: 1 }}>
                    {selected}€
                  </p>
                  <p style={{ color: '#555', fontSize: '12px', marginTop: '8px' }}>
                    Tarjeta de regalo · Viladecans
                  </p>
                </div>
                <div style={{ borderTop: '1px solid #333', paddingTop: '16px' }}>
                  <p style={{ color: '#c9a882', fontFamily: 'monospace', fontSize: '14px', letterSpacing: '4px', fontWeight: 700 }}>
                    VS–XXXX–XXXX
                  </p>
                  <p style={{ color: '#555', fontSize: '11px', marginTop: '4px' }}>
                    Sin fecha de caducidad
                  </p>
                </div>
              </div>
            </div>

            <style>{`
  .gift-preview-grid { grid-template-columns: 1fr 1fr; }
  @media(max-width:600px){ .gift-preview-grid { grid-template-columns: 1fr; } }
  .gift-step2-grid { grid-template-columns: 1fr 340px; }
  @media(max-width:900px){ .gift-step2-grid { grid-template-columns: 1fr !important; gap: 32px !important; } }
  @media(max-width:900px){ .gift-step2-grid .gift-summary-box { position: static !important; order: -1; } }
`}</style>

            <div style={{ textAlign: 'center' }}>
              <motion.button
                onClick={handleContinue}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary"
                style={{ padding: '16px 48px', fontSize: '14px', letterSpacing: '2px' }}
              >
                CONTINUAR — {selected}€
              </motion.button>
            </div>
          </motion.div>
        ) : step === 2 ? (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Botón volver */}
            <button
              onClick={() => setStep(1)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                color: '#7a6352', fontSize: '14px', marginBottom: '40px',
                padding: 0,
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Volver y cambiar importe
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '48px', alignItems: 'start' }} className="gift-step2-grid">

              {/* Formulario */}
              <form onSubmit={handleContinueToPayment}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, marginBottom: '32px', color: '#1a1a1a' }}>
                  Datos del comprador
                </h2>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Tu nombre *</label>
                  <input name="buyerName" required value={form.buyerName} onChange={handleChange} placeholder="María García" style={inputStyle} />
                </div>
                <div style={{ marginBottom: '32px' }}>
                  <label style={labelStyle}>Tu email * <span style={{ color: '#b89e87', fontWeight: 400 }}>(recibirás la tarjeta aquí)</span></label>
                  <input name="buyerEmail" type="email" required value={form.buyerEmail} onChange={handleChange} placeholder="tu@email.com" style={inputStyle} />
                </div>

                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '24px', color: '#1a1a1a', paddingTop: '16px', borderTop: '1px solid var(--warm-200)' }}>
                  Personalizar (opcional)
                </h2>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Nombre de la persona que recibe el regalo</label>
                  <input name="recipientName" value={form.recipientName} onChange={handleChange} placeholder="Ana López" style={inputStyle} />
                </div>
                <div style={{ marginBottom: '32px' }}>
                  <label style={labelStyle}>Mensaje personal</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="¡Feliz cumpleaños! Espero que disfrutes de este capricho..."
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                {error && (
                  <div style={{ background: '#fff0f0', border: '1px solid #fcc', borderRadius: '4px', padding: '12px 16px', marginBottom: '20px', color: '#c00', fontSize: '14px' }}>
                    {error}
                  </div>
                )}

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary"
                  style={{ width: '100%', padding: '16px', fontSize: '14px', letterSpacing: '2px' }}
                >
                  CONTINUAR AL PAGO — {selected}€
                </motion.button>

                <p style={{ textAlign: 'center', color: '#b89e87', fontSize: '12px', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Pago embebido y seguro con Stripe
                </p>
              </form>

              {/* Resumen */}
              <div className="gift-summary-box" style={{
                background: 'white',
                border: '1px solid var(--warm-200)',
                borderRadius: '4px',
                padding: '32px',
                position: 'sticky',
                top: '100px',
              }}>
                <p style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#b89e87', marginBottom: '20px' }}>
                  Resumen
                </p>
                <div style={{
                  background: '#1a1a1a', borderRadius: '8px', padding: '28px', marginBottom: '24px',
                }}>
                  <p style={{ color: '#c9a882', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Tarjeta Regalo
                  </p>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'white', fontWeight: 700, margin: 0 }}>
                    {selected}€
                  </p>
                  <p style={{ color: '#555', fontSize: '12px', marginTop: '6px' }}>
                    Vela Segalà Estètica · Viladecans
                  </p>
                </div>

                {AMOUNT_PERKS[selected].map(perk => (
                  <div key={perk} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <svg width="16" height="16" style={{ flexShrink: 0, color: '#c9a882', marginTop: '2px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span style={{ fontSize: '14px', color: '#7a6352' }}>{perk}</span>
                  </div>
                ))}

                <div style={{ borderTop: '1px solid var(--warm-200)', marginTop: '20px', paddingTop: '20px' }}>
                  {[
                    ['Sin fecha de caducidad', true],
                    ['Válida para cualquier tratamiento', true],
                    ['Recibirás la tarjeta por email', true],
                    ['No es reembolsable', false],
                  ].map(([text, ok]) => (
                    <div key={text} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: ok ? '#4caf50' : '#f44336', fontSize: '14px', flexShrink: 0 }}>{ok ? '✓' : '×'}</span>
                      <span style={{ fontSize: '13px', color: '#7a6352' }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => { setStep(2); setError(''); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                color: '#7a6352', fontSize: '14px', marginBottom: '32px',
                padding: 0,
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Volver y editar datos
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px', alignItems: 'start' }} className="gift-step3-grid">
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, marginBottom: '8px', color: '#1a1a1a' }}>
                  Completa el pago
                </h2>
                <p style={{ color: '#7a6352', marginBottom: '28px', fontSize: '15px' }}>
                  Tarjeta regalo de {selected}€ · {form.buyerEmail}
                </p>

                {error && (
                  <div style={{ background: '#fff0f0', border: '1px solid #fcc', borderRadius: '4px', padding: '12px 16px', marginBottom: '20px', color: '#c00', fontSize: '14px' }}>
                    {error}
                  </div>
                )}

                <div style={{
                  background: 'white',
                  border: '1px solid var(--warm-200)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  padding: '8px',
                }}>
                  <GiftCardEmbeddedCheckout
                    key={`${selected}-${form.buyerEmail}`}
                    checkoutData={checkoutData}
                    onError={setError}
                  />
                </div>
              </div>

              <div className="gift-summary-box" style={{
                background: 'white',
                border: '1px solid var(--warm-200)',
                borderRadius: '4px',
                padding: '28px',
                position: 'sticky',
                top: '100px',
              }}>
                <p style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', color: '#b89e87', marginBottom: '16px' }}>
                  Resumen
                </p>
                <div style={{
                  background: '#1a1a1a', borderRadius: '8px', padding: '24px', marginBottom: '20px',
                }}>
                  <p style={{ color: '#c9a882', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Tarjeta Regalo
                  </p>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'white', fontWeight: 700, margin: 0 }}>
                    {selected}€
                  </p>
                </div>
                <p style={{ fontSize: '13px', color: '#7a6352', marginBottom: '6px' }}><strong>Comprador:</strong> {form.buyerName}</p>
                {form.recipientName && (
                  <p style={{ fontSize: '13px', color: '#7a6352', marginBottom: '6px' }}><strong>Para:</strong> {form.recipientName}</p>
                )}
                {form.message && (
                  <p style={{ fontSize: '13px', color: '#7a6352', fontStyle: 'italic', lineHeight: 1.5 }}>"{form.message}"</p>
                )}
              </div>
            </div>

            <style>{`
  .gift-step3-grid { grid-template-columns: 1fr 300px; }
  @media(max-width:900px){
    .gift-step3-grid { grid-template-columns: 1fr !important; }
    .gift-step3-grid .gift-summary-box { position: static !important; order: -1; }
  }
`}</style>
          </motion.div>
        )}
      </div>

      {/* Sección de confianza */}
      <section style={{ background: 'white', borderTop: '1px solid var(--warm-200)', padding: '72px 24px' }}>
        <style>{`
  .trust-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 40px 32px;
  }
  @media (max-width: 768px) {
    .trust-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 32px 16px;
    }
    .trust-grid > .trust-item:nth-child(n+7) {
      display: none;
    }
  }
`}</style>
        <p style={{ textAlign: 'center', fontSize: '10px', letterSpacing: '5px', textTransform: 'uppercase', color: '#b89e87', marginBottom: '48px' }}>
          Por qué elegir Vela Segalà
        </p>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', textAlign: 'center' }} className="trust-grid">
          {TRUST_ITEMS.map(item => (
            <div key={item.title} className="trust-item">
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'var(--warm-50)', border: '1px solid var(--warm-200)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', color: '#c9a882',
              }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#1a1a1a' }}>{item.title}</h3>
              <p style={{ fontSize: '13px', color: '#7a6352', lineHeight: 1.6 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#7a6352',
  marginBottom: '8px',
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  border: '1px solid var(--warm-200)',
  borderRadius: '4px',
  fontSize: '15px',
  fontFamily: 'var(--font-sans)',
  background: 'white',
  color: '#1a1a1a',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};
