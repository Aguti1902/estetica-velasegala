import { useParams, Link, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../context/LanguageContext'
import { servicesData } from '../data/services'

export default function ServiceDetailPage() {
  const { slug } = useParams()
  const { lang } = useLang()
  const services = servicesData[lang]
  const service = services.find(s => s.slug === slug)

  if (!service) return <Navigate to="/servicios" replace />

  const related = services.filter(s => s.category === service.category && s.id !== service.id).slice(0, 3)

  return (
    <>
      {/* Hero */}
      <div style={{ background: '#0d0d0d', padding: 'clamp(4rem, 8vw, 6rem) 0', position: 'relative', overflow: 'hidden' }}>
        {service.image && (
          <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
            <img src={service.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <Link to="/" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >{lang === 'es' ? 'Inicio' : 'Inici'}</Link>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem' }}>/</span>
            <Link to="/servicios" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >{lang === 'es' ? 'Servicios' : 'Serveis'}</Link>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem' }}>/</span>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{service.name}</span>
          </div>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="label-white" style={{ marginBottom: '1.25rem' }}>
            — {service.categoryLabel}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="section-title-white">
            {service.name}
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />
              <div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2px' }}>{lang === 'es' ? 'Duración' : 'Durada'}</div>
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>{service.duration}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />
              <div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2px' }}>Precio</div>
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>{service.price}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contenido principal */}
      <section style={{ background: '#fff', padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '4rem', alignItems: 'start' }} className="detail-grid">

            {/* Izquierda */}
            <div>
              {/* Descripción */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, color: '#0d0d0d', marginBottom: '1rem' }}>
                  {lang === 'es' ? '¿En qué consiste?' : 'En què consisteix?'}
                </h2>
                <span style={{ display: 'block', width: '40px', height: '1.5px', background: '#0d0d0d', marginBottom: '1.5rem' }} />
                <p style={{ fontSize: '1rem', color: '#6b7280', lineHeight: 1.9 }}>{service.longDescription}</p>
              </motion.div>

              {/* Galería de imágenes */}
              {service.gallery && service.gallery.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '3rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, color: '#0d0d0d', marginBottom: '1rem' }}>
                    {lang === 'es' ? 'Galería del tratamiento' : 'Galeria del tractament'}
                  </h2>
                  <span style={{ display: 'block', width: '40px', height: '1.5px', background: '#0d0d0d', marginBottom: '1.5rem' }} />
                  <ServiceGallery images={service.gallery} name={service.name} />
                </motion.div>
              )}

              {/* Pasos */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, color: '#0d0d0d', marginBottom: '1rem' }}>
                  {lang === 'es' ? 'Cómo funciona' : 'Com funciona'}
                </h2>
                <span style={{ display: 'block', width: '40px', height: '1.5px', background: '#0d0d0d', marginBottom: '1.5rem' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5px', background: '#e8e8e8' }}>
                  {service.steps.map((step, i) => (
                    <div key={i} style={{ background: '#fff', padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                      <div style={{ width: '32px', height: '32px', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontSize: '0.85rem', fontWeight: 600 }}>{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#0d0d0d', marginBottom: '4px' }}>{step.title}</h3>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 }}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Beneficios */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, color: '#0d0d0d', marginBottom: '1rem' }}>
                  {lang === 'es' ? 'Beneficios' : 'Beneficis'}
                </h2>
                <span style={{ display: 'block', width: '40px', height: '1.5px', background: '#0d0d0d', marginBottom: '1.5rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: '#e8e8e8' }} className="benefits-grid">
                  {service.benefits.map((b, i) => (
                    <div key={i} style={{ background: '#fff', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '6px', height: '6px', background: '#0d0d0d', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.875rem', color: '#0d0d0d', fontWeight: 500 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* FAQ */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, color: '#0d0d0d', marginBottom: '1rem' }}>
                  {lang === 'es' ? 'Preguntas frecuentes' : 'Preguntes freqüents'}
                </h2>
                <span style={{ display: 'block', width: '40px', height: '1.5px', background: '#0d0d0d', marginBottom: '1.5rem' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5px', background: '#e8e8e8' }}>
                  {service.faq.map((item, i) => (
                    <FaqItem key={i} question={item.q} answer={item.a} />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Derecha — Sidebar */}
            <div className="detail-sidebar">
              {/* CTA card */}
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                style={{ background: '#0d0d0d', padding: '2rem', marginBottom: '1.5px', position: 'sticky', top: '90px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '0.75rem', lineHeight: 1.2 }}>
                  {lang === 'es' ? 'Reservar cita' : 'Reservar cita'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {lang === 'es' ? 'Pide tu cita y te asesoramos.' : 'Demana la teva cita i t\'assessorem.'}
                </p>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>{lang === 'es' ? 'Duración' : 'Durada'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>{service.duration}</div>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Precio</div>
                  <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{service.price}</div>
                </div>
                <Link to="/contacto" className="btn-light" style={{ width: '100%', justifyContent: 'center' }}>
                  {lang === 'es' ? 'Pedir cita' : 'Demanar cita'}
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <a href={`tel:+34938675822`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: '0.06em' }}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {lang === 'es' ? 'O llámanos' : 'O truca\'ns'}
                </a>
              </motion.div>
            </div>

          </div>
        </div>
        <style>{`
          .detail-grid { grid-template-columns: 3fr 1fr; }
          .benefits-grid { grid-template-columns: repeat(2, 1fr); }
          @media (max-width: 900px) {
            .detail-grid { grid-template-columns: 1fr !important; }
            .detail-sidebar { order: -1; position: static !important; }
          }
          @media (max-width: 767px) {
            .benefits-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* Imagen principal si existe */}
      {service.image && (
        <div style={{ background: '#f5f5f5', padding: '0' }}>
          <div style={{ maxHeight: '500px', overflow: 'hidden' }}>
            <img src={service.image} alt={service.name} style={{ width: '100%', height: 'clamp(220px, 50vw, 500px)', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      )}

      {/* Servicios relacionados */}
      {related.length > 0 && (
        <section style={{ background: '#fff', padding: 'clamp(4rem, 8vw, 5rem) 0' }}>
          <div className="container">
            <div style={{ marginBottom: '2.5rem' }}>
              <p className="label" style={{ marginBottom: '1rem' }}>— {lang === 'es' ? 'Misma categoría' : 'Mateixa categoria'}</p>
              <h2 className="section-title">{lang === 'es' ? 'Tratamientos relacionados' : 'Tractaments relacionats'}</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5px', background: '#e8e8e8' }} className="related-grid">
              {related.map((s, i) => (
                <RelatedCard key={s.id} service={s} index={i} lang={lang} />
              ))}
            </div>
          </div>
          <style>{`
            .related-grid { grid-template-columns: repeat(3, 1fr); }
            .service-gallery-grid { grid-template-columns: repeat(3, 1fr); }
            @media (max-width: 768px) {
              .related-grid { grid-template-columns: repeat(2, 1fr) !important; }
              .service-gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
            }
            @media (max-width: 480px) {
              .related-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </section>
      )}
    </>
  )
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#fff' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '1rem' }}
      >
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0d0d0d', flex: 1 }}>{question}</span>
        <span style={{ fontSize: '1.2rem', color: '#a3a3a3', flexShrink: 0, transform: open ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.2s', lineHeight: 1 }}>+</span>
      </button>
      {open && (
        <div style={{ padding: '0 1.5rem 1.25rem', fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.7, borderTop: '1px solid #f0f0f0' }}>
          {answer}
        </div>
      )}
    </div>
  )
}

function ServiceGallery({ images, name }) {
  const [selected, setSelected] = useState(null)

  return (
    <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }} className="service-gallery-grid">
        {images.map((src, i) => (
          <button key={i} onClick={() => setSelected(i)}
            style={{ padding: 0, border: 'none', cursor: 'pointer', overflow: 'hidden', aspectRatio: '4/3', background: '#f0f0f0', position: 'relative' }}>
            <img src={src} alt={`${name} ${i + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.25)'; e.currentTarget.querySelector('svg').style.opacity = '1' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.querySelector('svg').style.opacity = '0' }}>
              <svg width="24" height="24" fill="none" stroke="#fff" viewBox="0 0 24 24" style={{ opacity: 0, transition: 'opacity 0.3s' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <button onClick={() => setSelected(null)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {selected > 0 && (
              <button onClick={e => { e.stopPropagation(); setSelected(s => s - 1) }}
                style={{ position: 'absolute', left: '1.5rem', background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
            )}
            <motion.img key={selected} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              src={images[selected]} alt={`${name} ${selected + 1}`}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', display: 'block' }}
            />
            {selected < images.length - 1 && (
              <button onClick={e => { e.stopPropagation(); setSelected(s => s + 1) }}
                style={{ position: 'absolute', right: '1.5rem', background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
            )}
            <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
              {images.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setSelected(i) }}
                  style={{ width: i === selected ? '20px' : '6px', height: '6px', background: i === selected ? '#fff' : 'rgba(255,255,255,0.35)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', borderRadius: 0 }} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function RelatedCard({ service, index, lang }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? '#0d0d0d' : '#fff', transition: 'background 0.3s' }}
    >
      <Link to={`/servicios/${service.slug}`} style={{ textDecoration: 'none', display: 'block', padding: '1.75rem' }}>
        <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: hovered ? 'rgba(255,255,255,0.4)' : '#a3a3a3', marginBottom: '0.5rem', transition: 'color 0.3s' }}>
          {service.duration}
        </div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 600, color: hovered ? '#fff' : '#0d0d0d', lineHeight: 1.2, marginBottom: '0.5rem', transition: 'color 0.3s' }}>
          {service.name}
        </h3>
        <p style={{ fontSize: '0.82rem', color: hovered ? 'rgba(255,255,255,0.55)' : '#6b7280', lineHeight: 1.5, marginBottom: '1rem', transition: 'color 0.3s' }}>
          {service.description.slice(0, 90)}...
        </p>
        <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: hovered ? '#fff' : '#0d0d0d', borderBottom: `1px solid ${hovered ? 'rgba(255,255,255,0.4)' : '#0d0d0d'}`, paddingBottom: '1px', transition: 'all 0.3s' }}>
          {lang === 'es' ? 'Ver tratamiento' : 'Veure tractament'} →
        </span>
      </Link>
    </motion.div>
  )
}
