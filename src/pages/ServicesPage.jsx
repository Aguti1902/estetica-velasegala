import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLang } from '../context/LanguageContext'
import { servicesData } from '../data/services'

export default function ServicesPage() {
  const { lang } = useLang()
  const services = servicesData[lang]
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [...new Set(services.map(s => s.category))]
  const filtered = activeCategory === 'all' ? services : services.filter(s => s.category === activeCategory)

  const categoryLabels = {
    es: { all: 'Todos', facial: 'Facial', corporal: 'Corporal', medics: 'Médico-Estético', laser: 'Láser' },
    ca: { all: 'Tots', facial: 'Facial', corporal: 'Corporal', medics: 'Mèdic-Estètic', laser: 'Làser' },
  }

  return (
    <>
      {/* Page Hero */}
      <div style={{ background: '#0d0d0d', padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="container">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="label-white" style={{ marginBottom: '1.25rem' }}>
            — {lang === 'es' ? 'Nuestros tratamientos' : 'Els nostres tractaments'}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="section-title-white">
            {lang === 'es' ? 'Servicios' : 'Serveis'}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: '520px', marginTop: '1rem' }}>
            {lang === 'es'
              ? 'Medicina estética avanzada con enfoque en resultados naturales y bienestar integral.'
              : 'Medicina estètica avançada amb enfocament en resultats naturals i benestar integral.'}
          </motion.p>
        </div>
      </div>

      {/* Filtros + Grid */}
      <section style={{ background: '#f5f5f5', padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="container">
          {/* Filtros */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '3rem' }}>
            {['all', ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 20px', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
                  border: `1.5px solid ${activeCategory === cat ? '#0d0d0d' : '#d0d0d0'}`,
                  background: activeCategory === cat ? '#0d0d0d' : 'transparent',
                  color: activeCategory === cat ? '#fff' : '#6b7280',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {categoryLabels[lang][cat] || cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5px', background: 'transparent' }} className="services-page-grid">
            {filtered.map((service, i) => (
              <ServiceRow key={service.id} service={service} index={i} lang={lang} />
            ))}
          </div>
        </div>
        <style>{`
          .services-page-grid { grid-template-columns: repeat(3, 1fr); }
          @media (max-width: 900px) { .services-page-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 540px) { .services-page-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>
    </>
  )
}

function ServiceRow({ service, index, lang }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: (index % 3) * 0.07 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? '#0d0d0d' : '#fff', border: '1.5px solid #e8e8e8', transition: 'background 0.3s, border-color 0.3s', borderColor: hovered ? '#0d0d0d' : '#e8e8e8' }}
    >
      <Link to={`/servicios/${service.slug}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
        {service.image && (
          <div style={{ height: '200px', overflow: 'hidden' }}>
            <img src={service.image} alt={service.name} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.5s' }} />
          </div>
        )}
        <div style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: hovered ? 'rgba(255,255,255,0.4)' : '#a3a3a3', transition: 'color 0.3s' }}>
              {service.categoryLabel}
            </span>
            <span style={{ fontSize: '0.65rem', color: hovered ? 'rgba(255,255,255,0.5)' : '#a3a3a3', border: `1px solid ${hovered ? 'rgba(255,255,255,0.15)' : '#e8e8e8'}`, padding: '3px 8px', transition: 'all 0.3s' }}>
              {service.duration}
            </span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 600, color: hovered ? '#fff' : '#0d0d0d', lineHeight: 1.2, marginBottom: '0.5rem', transition: 'color 0.3s' }}>
            {service.name}
          </h3>
          <p style={{ fontSize: '0.83rem', color: hovered ? 'rgba(255,255,255,0.6)' : '#6b7280', lineHeight: 1.6, marginBottom: '1.25rem', transition: 'color 0.3s' }}>
            {service.description}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: hovered ? 'rgba(255,255,255,0.7)' : '#0d0d0d', transition: 'color 0.3s' }}>{service.price}</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: hovered ? '#fff' : '#0d0d0d', borderBottom: `1px solid ${hovered ? 'rgba(255,255,255,0.4)' : '#0d0d0d'}`, paddingBottom: '1px', transition: 'all 0.3s' }}>
              {lang === 'es' ? 'Ver más' : 'Veure més'} →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
