import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'

const content = {
  es: {
    eyebrow: 'Atención personalizada',
    title: 'Reserva tu\ncita ahora',
    subtitle: 'Te hacemos una valoración personalizada y te recomendamos el tratamiento más adecuado para ti.',
    cta: 'Reservar cita',
    note: 'Disponibilidad inmediata · Atención personalizada',
  },
  ca: {
    eyebrow: 'Atenció personalitzada',
    title: 'Reserva la teva\ncita ara',
    subtitle: 'Et fem una valoració personalitzada i et recomanem el tractament més adequat per a tu.',
    cta: 'Reservar cita',
    note: 'Disponibilitat immediata · Atenció personalitzada',
  },
}

export default function CtaBanner() {
  const { lang } = useLang()
  const c = content[lang]

  return (
    <section style={{ background: 'var(--cream)', padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: '0', background: '#fff', border: '1px solid var(--warm-200)', overflow: 'hidden', borderRadius: '4px', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}
          className="cta-banner-grid">

          {/* Izquierda — imagen */}
          <div style={{ overflow: 'hidden', position: 'relative', minHeight: '320px' }}>
            <img src="/images/woman-receiving-injection-in-beauty-clinic-2026-04-13-03-04-46-utc.jpg"
              alt="Reservar cita" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', position: 'absolute', inset: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(249,246,241,0.1) 0%, rgba(255,255,255,0.5) 100%)' }} />
          </div>

          {/* Divisor vertical */}
          <div style={{ background: 'var(--warm-200)' }} />

          {/* Derecha — texto */}
          <div style={{ padding: 'clamp(2.5rem, 5vw, 4rem)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
              {c.eyebrow}
            </p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 500, color: 'var(--black)', lineHeight: 1.1, whiteSpace: 'pre-line', marginBottom: '1.25rem' }}>
              {c.title}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--warm-600)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '380px' }}>
              {c.subtitle}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
              <Link to="/contacto" className="btn-dark">
                {c.cta}
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
              <span style={{ fontSize: '0.68rem', color: 'var(--warm-400)', letterSpacing: '0.08em' }}>{c.note}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        .cta-banner-grid { grid-template-columns: 1fr 1px 1fr; }
        @media (max-width: 768px) {
          .cta-banner-grid { grid-template-columns: 1fr !important; }
          .cta-banner-grid > div:nth-child(1) { min-height: 240px; }
          .cta-banner-grid > div:nth-child(2) { display: none; }
        }
      `}</style>
    </section>
  )
}
