import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../context/LanguageContext'

export default function Testimonials() {
  const { t } = useLang()
  const [current, setCurrent] = useState(0)
  const items = t.testimonials.items
  const perPage = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3
  const totalPages = Math.ceil(items.length / perPage)
  const visible = items.slice(current * perPage, current * perPage + perPage)

  return (
    <section style={{ background: '#f5f5f5', padding: 'clamp(5rem, 10vw, 7rem) 0' }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="label" style={{ marginBottom: '1.25rem' }}>
              — {t.testimonials.badge}
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="section-title">
              {t.testimonials.title}
            </motion.h2>
          </div>

          {/* Google badge */}
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '12px 20px', border: '1px solid #e8e8e8' }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '3px' }}>
                {[1,2,3,4,5].map(i => <svg key={i} width="10" height="10" viewBox="0 0 20 20" fill="#0d0d0d"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#0d0d0d', letterSpacing: '0.05em' }}>4.9 · +200 reseñas</div>
            </div>
          </motion.div>
        </div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5px', background: '#e8e8e8', marginBottom: '2rem' }} className="test-grid"
          >
            {visible.map((item, i) => (
              <div key={i} style={{ background: '#fff', padding: '2rem' }}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '1.25rem' }}>
                  {[1,2,3,4,5].map(j => <svg key={j} width="12" height="12" viewBox="0 0 20 20" fill="#0d0d0d"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                </div>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontStyle: 'italic', color: '#0d0d0d', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                  "{item.text}"
                </p>
                <div style={{ paddingTop: '1rem', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>{item.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d0d0d', letterSpacing: '0.04em' }}>{item.name}</div>
                    <div style={{ fontSize: '0.65rem', color: '#a3a3a3', marginTop: '2px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{item.service}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Paginación */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              style={{ width: current === i ? '32px' : '8px', height: '2px', background: current === i ? '#0d0d0d' : '#d0d0d0', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
          ))}
        </div>
      </div>

      <style>{`
        .test-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 768px) { .test-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}
