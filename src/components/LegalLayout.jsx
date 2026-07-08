import { motion } from 'framer-motion'

export default function LegalLayout({ label, title, updated, sections }) {
  return (
    <>
      <div style={{ background: '#0d0d0d', padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="container">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="label-white" style={{ marginBottom: '1.25rem' }}>
            — {label}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="section-title-white">
            {title}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '1rem', letterSpacing: '0.06em' }}>
            {updated}
          </motion.p>
        </div>
      </div>

      <section style={{ background: '#f5f5f5', padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="container" style={{ maxWidth: '760px' }}>
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.04 }}
              style={{ background: '#fff', padding: 'clamp(1.5rem, 3vw, 2.5rem)', marginBottom: '2px', borderLeft: '3px solid #0d0d0d' }}
            >
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 600, color: '#0d0d0d', marginBottom: '1rem' }}>
                {section.title}
              </h2>
              <div style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.9, whiteSpace: 'pre-line' }}>
                {section.body}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  )
}
