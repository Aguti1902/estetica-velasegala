import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLang } from '../context/LanguageContext'
import { servicesData } from '../data/services'

export default function Services() {
  const { t, lang } = useLang()
  const services = servicesData[lang]
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = ['all', ...new Set(services.map(s => s.category))]
  const filtered = activeCategory === 'all' ? services : services.filter(s => s.category === activeCategory)

  return (
    <section id="servicios" style={{ background: '#f5f5f5', padding: 'clamp(5rem, 10vw, 7rem) 0' }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: '4rem' }}>
          <motion.p
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="label" style={{ marginBottom: '1.25rem' }}
          >— {t.services.badge}</motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="section-title" style={{ maxWidth: '600px', marginBottom: '1rem' }}
          >{t.services.title}</motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            style={{ fontSize: '0.95rem', color: '#6b7280', lineHeight: 1.7, maxWidth: '520px' }}
          >{t.services.subtitle}</motion.p>
        </div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '3rem' }}
        >
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 20px',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                border: `1.5px solid ${activeCategory === cat ? '#0d0d0d' : '#d0d0d0'}`,
                background: activeCategory === cat ? '#0d0d0d' : 'transparent',
                color: activeCategory === cat ? '#fff' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat === 'all' ? (lang === 'es' ? 'Todos' : 'Tots') : t.services.categories[cat]}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5px', background: '#e8e8e8' }}>
          {filtered.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} t={t} />
          ))}
        </div>

      </div>
    </section>
  )
}

function ServiceCard({ service, index, t }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: (index % 6) * 0.07 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? '#0d0d0d' : '#fff', transition: 'background 0.3s', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {service.image && (
        <div style={{ height: '200px', overflow: 'hidden' }}>
          <img src={service.image} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.5s', filter: hovered ? 'grayscale(30%)' : 'none' }} />
        </div>
      )}
      <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: hovered ? 'rgba(255,255,255,0.4)' : '#a3a3a3', transition: 'color 0.3s' }}>
            {service.categoryLabel}
          </span>
          <span style={{ fontSize: '0.65rem', color: hovered ? 'rgba(255,255,255,0.5)' : '#a3a3a3', border: `1px solid ${hovered ? 'rgba(255,255,255,0.15)' : '#e8e8e8'}`, padding: '3px 8px', transition: 'all 0.3s' }}>
            {service.duration}
          </span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, color: hovered ? '#fff' : '#0d0d0d', lineHeight: 1.2, marginBottom: '0.75rem', transition: 'color 0.3s' }}>
          {service.name}
        </h3>
        <p style={{ fontSize: '0.85rem', color: hovered ? 'rgba(255,255,255,0.6)' : '#6b7280', lineHeight: 1.7, flex: 1, marginBottom: '1.5rem', transition: 'color 0.3s' }}>
          {service.description}
        </p>
        <Link
          to={`/servicios/${service.slug}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: hovered ? '#fff' : '#0d0d0d', textDecoration: 'none',
            borderBottom: `1px solid ${hovered ? 'rgba(255,255,255,0.4)' : '#0d0d0d'}`,
            paddingBottom: '2px', width: 'fit-content', transition: 'all 0.3s'
          }}
        >
          {t.services.bookBtn} →
        </Link>
      </div>
    </motion.div>
  )
}
