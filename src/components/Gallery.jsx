import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../context/LanguageContext'

const images = [
  { src: '/images/woman-receiving-beauty-treatment-at-a-clinic-2026-03-16-06-05-53-utc.jpg', alt: 'Tratamiento facial' },
  { src: '/images/woman-receives-facial-treatment-at-medical-spa-2026-03-10-01-10-01-utc.jpg', alt: 'Medical spa' },
  { src: '/images/lip-augmentation-procedure-close-up-with-injectabl-2026-03-10-03-57-02-utc.jpeg', alt: 'Labios' },
  { src: '/images/beautician-makes-botox-injections-in-the-area-betw-2026-03-10-01-10-37-utc.jpg', alt: 'Bótox' },
  { src: '/images/woman-receiving-injection-in-beauty-clinic-2026-04-13-03-04-46-utc.jpg', alt: 'Clínica' },
  { src: '/images/woman-receiving-neck-treatment-in-medical-setting-2026-03-19-05-26-26-utc.jpg', alt: 'Cuello' },
  { src: '/images/xMedicina-estetica.jpg', alt: 'Medicina estética' },
  { src: '/images/rellenos-faciales-agb.jpg', alt: 'Rellenos' },
]

export default function Gallery() {
  const { t } = useLang()
  const [lightbox, setLightbox] = useState(null)

  return (
    <section id="galeria" style={{ background: '#0d0d0d', padding: 'clamp(5rem, 10vw, 7rem) 0' }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="label-white" style={{ marginBottom: '1.25rem' }}
            >— {t.gallery.badge}</motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="section-title-white"
            >{t.gallery.title}</motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', maxWidth: '300px', lineHeight: 1.7 }}
          >{t.gallery.subtitle}</motion.p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5px', background: '#333' }} className="gallery-grid">
          {images.map((img, i) => (
            <GalleryItem key={i} img={img} i={i} onClick={() => setLightbox(img)} />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ position: 'relative', maxWidth: '900px', width: '100%', maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            >
              <img src={lightbox.src} alt={lightbox.alt} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              <button
                onClick={() => setLightbox(null)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', width: '36px', height: '36px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
              >✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .gallery-grid { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 1024px) { .gallery-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 640px) { .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </section>
  )
}

function GalleryItem({ img, i, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', background: '#1a1a1a' }}
    >
      <img
        src={img.src} alt={img.alt}
        style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block', transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.5s', filter: hovered ? 'grayscale(20%)' : 'none' }}
        loading="lazy"
      />
      <div style={{ position: 'absolute', inset: 0, background: hovered ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0)', transition: 'background 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {hovered && (
          <div style={{ width: '36px', height: '36px', border: '1.5px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem' }}>+</div>
        )}
      </div>
    </motion.div>
  )
}
