import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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

export default function AboutPage() {
  const { t, lang } = useLang()

  const teamEs = [
    { name: 'Dra. Maribel Segalà', role: 'Directora Médica', spec: 'Medicina Estética Facial, Corporal, Regenerativa y Antienvejecimiento', img: '/images/woman-receiving-beauty-treatment-at-a-clinic-2026-03-16-06-05-53-utc.jpg' },
    { name: 'Sara Puig', role: 'Especialista en Láser', spec: 'Depilación Láser e IPL', img: '/images/woman-receiving-neck-treatment-in-medical-setting-2026-03-19-05-26-26-utc.jpg' },
  ]
  const teamCa = [
    { name: 'Dra. Maribel Segalà', role: 'Directora Mèdica', spec: 'Medicina Estètica Facial, Corporal, Regenerativa i Antienvelliment', img: '/images/woman-receiving-beauty-treatment-at-a-clinic-2026-03-16-06-05-53-utc.jpg' },
    { name: 'Sara Puig', role: 'Especialista en Làser', spec: 'Depilació Làser i IPL', img: '/images/woman-receiving-neck-treatment-in-medical-setting-2026-03-19-05-26-26-utc.jpg' },
  ]
  const team = lang === 'es' ? teamEs : teamCa

  return (
    <>
      {/* Hero */}
      <div style={{ background: '#0d0d0d', padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="container">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="label-white" style={{ marginBottom: '1.25rem' }}>
            — {t.about.badge}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="section-title-white">
            {t.about.title}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: '520px', marginTop: '1rem' }}>
            {t.about.text1}
          </motion.p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: '#f5f5f5', padding: '0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5px', background: '#e8e8e8' }} className="stats-grid">
            {t.about.stats.map((s, i) => (
              <div key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f5f5f5', padding: '2.5rem', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', fontWeight: 600, color: '#0d0d0d', lineHeight: 1 }}>
                  <CountUp value={s.value} />
                </div>
                <div className="label" style={{ marginTop: '10px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          .stats-grid { grid-template-columns: repeat(4, 1fr); }
          @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        `}</style>
      </div>

      {/* Historia */}
      <section style={{ background: '#fff', padding: 'clamp(5rem, 10vw, 7rem) 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5rem', alignItems: 'center' }} className="about-story-grid">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div style={{ position: 'relative' }}>
                <img src="/images/xMedicina-estetica.jpg" alt="Clínica" style={{ width: '100%', objectFit: 'cover', display: 'block', maxHeight: '500px' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)' }} />
              </div>
            </motion.div>
            <div>
              <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="label" style={{ marginBottom: '1.25rem' }}>
                — {lang === 'es' ? 'Nuestra historia' : 'La nostra història'}
              </motion.p>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="section-title" style={{ marginBottom: '1.5rem' }}>
                {lang === 'es' ? 'Medicina con propósito' : 'Medicina amb propòsit'}
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} style={{ fontSize: '0.95rem', color: '#6b7280', lineHeight: 1.9, marginBottom: '1.25rem' }}>
                {t.about.text1}
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }} style={{ fontSize: '0.95rem', color: '#6b7280', lineHeight: 1.9, marginBottom: '2.5rem' }}>
                {t.about.text2}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
                <Link to="/contacto" className="btn-dark">
                  {lang === 'es' ? 'Pedir cita' : 'Demanar cita'}
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
        <style>{`
          .about-story-grid { grid-template-columns: repeat(2, 1fr); }
          @media (max-width: 768px) { .about-story-grid { grid-template-columns: 1fr !important; gap: 3rem !important; } }
        `}</style>
      </section>

      {/* Equipo */}
      <section style={{ background: '#f5f5f5', padding: 'clamp(5rem, 10vw, 7rem) 0' }}>
        <div className="container">
          <div style={{ marginBottom: '3rem' }}>
            <p className="label" style={{ marginBottom: '1.25rem' }}>— {lang === 'es' ? 'Nuestro equipo' : 'El nostre equip'}</p>
            <h2 className="section-title">{lang === 'es' ? 'Profesionales especializados' : 'Professionals especialitzats'}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5px', background: '#e8e8e8' }} className="team-grid">
            {team.map((member, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ background: '#fff', overflow: 'hidden' }}>
                <div style={{ height: '280px', overflow: 'hidden' }}>
                  <img src={member.img} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%)' }} loading="lazy" />
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 600, color: '#0d0d0d', marginBottom: '4px' }}>{member.name}</h3>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0d0d0d', marginBottom: '4px' }}>{member.role}</div>
                  <div style={{ fontSize: '0.82rem', color: '#a3a3a3' }}>{member.spec}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <style>{`
          .team-grid { grid-template-columns: repeat(3, 1fr); }
          @media (max-width: 768px) { .team-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>
    </>
  )
}
