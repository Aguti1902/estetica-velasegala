import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { useLang } from '../context/LanguageContext'

function CountUp({ value, duration = 1800 }) {
  const [display, setDisplay] = useState('0')
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  useEffect(() => {
    if (!inView) return
    const match = value.match(/(\D*)(\d+)(\D*)/)
    if (!match) { setDisplay(value); return }
    const [, prefix, num, suffix] = match
    const target = parseInt(num, 10)
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(`${prefix}${Math.floor(eased * target)}${suffix}`)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, value, duration])

  return <span ref={ref}>{display}</span>
}

export default function About() {
  const { t } = useLang()

  return (
    <section id="sobre" style={{ background: '#fff', padding: 'clamp(5rem, 10vw, 7rem) 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5rem', alignItems: 'start' }} className="about-grid">

          {/* Izquierda */}
          <div>
            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="label" style={{ marginBottom: '1.25rem' }}>
              — {t.about.badge}
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="section-title" style={{ marginBottom: '2rem' }}>
              {t.about.title}
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} style={{ fontSize: '0.95rem', color: '#6b7280', lineHeight: 1.8, marginBottom: '1.25rem' }}>
              {t.about.text1}
            </motion.p>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }} style={{ fontSize: '0.95rem', color: '#6b7280', lineHeight: 1.8, marginBottom: '2.5rem' }}>
              {t.about.text2}
            </motion.p>
            <motion.a initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} href="#contacte" className="btn-dark">
              {t.about.cta}
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </motion.a>
          </div>

          {/* Derecha */}
          <div>
            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5px', background: '#e8e8e8', marginBottom: '2rem' }}>
              {t.about.stats.map((s, i) => (
                <div key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f5f5f5', padding: '2rem', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', fontWeight: 600, color: '#0d0d0d', lineHeight: 1 }}>
                    <CountUp value={s.value} />
                  </div>
                  <div className="label" style={{ marginTop: '8px' }}>{s.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Imágenes */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5px', background: '#e8e8e8' }}>
              <div style={{ gridColumn: 'span 2', overflow: 'hidden', height: '200px' }}>
                <img src="/images/xMedicina-estetica.jpg" alt="Equipo" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ overflow: 'hidden', height: '150px' }}>
                <img src="/images/Descubriendo-el-Mundo-de-la-Medicina-Estetica-5-Razones-para-Estudiar-y-Especializarse.png" alt="Medicina" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ overflow: 'hidden', height: '150px' }}>
                <img src="/images/f.elconfidencial.com_original_b9b_ea4_a59_b9bea4a59982ec0ee5565a7a23a04f3e.jpg" alt="Clínica" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      <style>{`
        .about-grid { grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 768px) { .about-grid { grid-template-columns: 1fr !important; gap: 3rem !important; } }
      `}</style>
    </section>
  )
}
