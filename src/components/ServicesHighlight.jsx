import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLang } from '../context/LanguageContext'
import { servicesData } from '../data/services'

export default function ServicesHighlight() {
  const { t, lang } = useLang()
  const services = servicesData[lang].slice(0, 6)

  return (
    <section style={{ background: '#fff', padding: 'clamp(5rem, 10vw, 8rem) 0' }}>
      <div className="container">

        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
              {t.services.badge}
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, color: 'var(--black)', lineHeight: 1.1 }}>
              {t.services.title}
            </motion.h2>
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Link to="/servicios"
              style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--black)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--warm-200)', paddingBottom: '2px', transition: 'color 0.2s, border-color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--black)'; e.currentTarget.style.borderColor = 'var(--warm-200)' }}>
              {t.services.viewAll}
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </motion.div>
        </div>

        {/* Grid de cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="services-highlight-grid">
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} lang={lang} bookLabel={t.services.bookBtn} />
          ))}
        </div>
      </div>

      <style>{`
        .services-highlight-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 900px) { .services-highlight-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 767px) { .services-highlight-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}

function ServiceCard({ service, index, lang, bookLabel }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }} transition={{ delay: index * 0.08 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? 'var(--cream)' : '#fff', border: '1px solid var(--warm-200)', borderRadius: '4px', transition: 'all 0.3s', transform: hovered ? 'translateY(-4px)' : 'translateY(0)', boxShadow: hovered ? '0 16px 40px rgba(201,168,130,0.18)' : '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      <Link to={`/servicios/${service.slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Imagen */}
        {service.image && (
          <div style={{ height: '210px', overflow: 'hidden', position: 'relative' }}>
            <img src={service.image} alt={service.name} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.5s' }} />
            {/* Badge categoría sobre imagen */}
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(255,255,255,0.92)', padding: '4px 10px', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--warm-600)' }}>
              {service.categoryLabel}
            </div>
          </div>
        )}

        {/* Contenido */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--black)', lineHeight: 1.2 }}>
              {service.name}
            </h3>
            <span style={{ fontSize: '0.62rem', color: 'var(--warm-400)', background: 'var(--warm-100)', padding: '3px 8px', borderRadius: '2px', flexShrink: 0, marginLeft: '8px' }}>
              {service.duration}
            </span>
          </div>

          <p style={{ fontSize: '0.83rem', color: 'var(--warm-600)', lineHeight: 1.65, marginBottom: '1.25rem', flex: 1 }}>
            {service.description}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--warm-100)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--black)' }}>{service.price}</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: hovered ? 'var(--accent)' : 'var(--black)', display: 'flex', alignItems: 'center', gap: '5px', transition: 'color 0.2s' }}>
              {lang === 'es' ? 'Ver más' : 'Veure més'}
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
