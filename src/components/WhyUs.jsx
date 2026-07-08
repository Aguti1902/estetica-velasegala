import { motion } from 'framer-motion'
import { useLang } from '../context/LanguageContext'

const featureIcons = [
  <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
  <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
  <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>,
  <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.4"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>,
  <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 0-9 3.582-9 8s4.03 8 9 8c.56 0 1.108-.048 1.639-.138.5.501 1.26.787 2.044.737C17.769 19.487 20 17.5 20 15.5c0-.663-.22-1.274-.598-1.773A8 8 0 0021 11c0-4.418-4.03-8-9-8z" /></svg>,
]

export default function WhyUs() {
  const { t } = useLang()
  const w = t.whyUs

  return (
    <section style={{ background: 'var(--cream)', padding: 'clamp(5rem, 10vw, 8rem) 0' }}>
      <div className="container">

        {/* Cabecera centrada */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5rem)', maxWidth: '620px', margin: '0 auto clamp(3rem,6vw,5rem)' }}>
          <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' }}>
            — {w.badge} —
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, color: 'var(--black)', lineHeight: 1.15, marginBottom: '1rem' }}>
            {w.title}
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            style={{ fontSize: '0.95rem', color: 'var(--warm-600)', lineHeight: 1.7 }}>
            {w.subtitle}
          </motion.p>
        </div>

        {/* Grid 3x2 con icono + texto */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', background: 'var(--warm-200)' }} className="whyus-grid">
          {w.features.map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }} transition={{ delay: i * 0.07 }}
              style={{ background: '#fff', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: '52px', height: '52px', background: 'var(--warm-100)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                {featureIcons[i]}
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 500, color: 'var(--black)', lineHeight: 1.3 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--warm-600)', lineHeight: 1.7 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .whyus-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 900px) { .whyus-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px) { .whyus-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
