import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'

export default function Hero() {
  const { t } = useLang()
  const h = t.hero

  return (
    <section style={{ background: 'var(--cream)', minHeight: '92vh', display: 'flex', alignItems: 'stretch', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%' }} className="hero-split">

        {/* Imagen — izquierda */}
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: 'easeOut' }}
          style={{ position: 'relative', overflow: 'hidden', minHeight: '600px' }}>
          <img
            src="/images/woman-receiving-beauty-treatment-at-a-clinic-2026-03-16-06-05-53-utc.jpg"
            alt="Tratamiento estético Viladecans"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', position: 'absolute', inset: 0 }}
          />
          {/* Overlay degradado */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(249,246,241,0) 60%, var(--cream) 100%)' }} />
          {/* Badge sobre imagen */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            style={{ position: 'absolute', bottom: '2.5rem', left: '2rem', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', padding: '1rem 1.5rem', borderLeft: '3px solid var(--accent)' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--warm-400)', marginBottom: '4px' }}>Viladecans, Barcelona</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--black)' }}>C/ Mare de Déu de Sales, 67C</div>
          </motion.div>
        </motion.div>

        {/* Texto — derecha */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(3rem, 6vw, 6rem) clamp(2rem, 5vw, 5rem)' }}>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '28px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
            {h.badge}
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', fontWeight: 500, lineHeight: 1.08, color: 'var(--black)', marginBottom: '1.75rem', letterSpacing: '-0.01em' }}>
            {h.headline}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ fontSize: '1rem', color: 'var(--warm-600)', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: '420px' }}>
            {h.subheadline}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link to="/contacto" className="btn-dark">{h.cta1}</Link>
            <Link to="/servicios"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--black)', textDecoration: 'none', padding: '14px 0', borderBottom: '1.5px solid var(--warm-200)', transition: 'border-color 0.2s, color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--warm-200)'; e.currentTarget.style.color = 'var(--black)' }}>
              {h.cta2}
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
            style={{ display: 'flex', gap: '0', borderTop: '1px solid var(--warm-200)', paddingTop: '2rem' }}>
            {[
              { val: h.stat1, label: h.stat1Label },
              { val: h.stat2, label: h.stat2Label },
              { val: h.stat3, label: h.stat3Label },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, paddingRight: i < 2 ? '1.5rem' : 0, borderRight: i < 2 ? '1px solid var(--warm-200)' : 'none', paddingLeft: i > 0 ? '1.5rem' : 0 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 500, color: 'var(--black)', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--warm-400)', marginTop: '4px', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <style>{`
        .hero-split { grid-template-columns: 1fr 1fr; }
        @media (max-width: 900px) {
          .hero-split { grid-template-columns: 1fr; }
          .hero-split > div:first-child { min-height: 50vw; }
        }
      `}</style>
    </section>
  )
}
