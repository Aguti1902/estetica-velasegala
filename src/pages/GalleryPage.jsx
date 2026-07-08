import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../context/LanguageContext'

const images = [
  { src: '/images/woman-receiving-beauty-treatment-at-a-clinic-2026-03-16-06-05-53-utc.jpg', alt: 'Tratamiento facial', category: 'facial' },
  { src: '/images/woman-receives-facial-treatment-at-medical-spa-2026-03-10-01-10-01-utc.jpg', alt: 'Medical spa', category: 'facial' },
  { src: '/images/lip-augmentation-procedure-close-up-with-injectabl-2026-03-10-03-57-02-utc.jpeg', alt: 'Labios', category: 'facial' },
  { src: '/images/beautician-makes-botox-injections-in-the-area-betw-2026-03-10-01-10-37-utc.jpg', alt: 'Bótox', category: 'facial' },
  { src: '/images/woman-receiving-injection-in-beauty-clinic-2026-04-13-03-04-46-utc.jpg', alt: 'Clínica', category: 'corporal' },
  { src: '/images/woman-receiving-neck-treatment-in-medical-setting-2026-03-19-05-26-26-utc.jpg', alt: 'Cuello', category: 'corporal' },
  { src: '/images/xMedicina-estetica.jpg', alt: 'Medicina estética', category: 'clinica' },
  { src: '/images/rellenos-faciales-agb.jpg', alt: 'Rellenos', category: 'facial' },
  { src: '/images/Descubriendo-el-Mundo-de-la-Medicina-Estetica-5-Razones-para-Estudiar-y-Especializarse.png', alt: 'Estética', category: 'clinica' },
  { src: '/images/f.elconfidencial.com_original_b9b_ea4_a59_b9bea4a59982ec0ee5565a7a23a04f3e.jpg', alt: 'Medicina', category: 'clinica' },
]

export default function GalleryPage() {
  const { lang } = useLang()
  const [lightbox, setLightbox] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')

  const filters = {
    es: [{ id: 'all', label: 'Todas' }, { id: 'facial', label: 'Facial' }, { id: 'corporal', label: 'Corporal' }, { id: 'clinica', label: 'Clínica' }],
    ca: [{ id: 'all', label: 'Totes' }, { id: 'facial', label: 'Facial' }, { id: 'corporal', label: 'Corporal' }, { id: 'clinica', label: 'Clínica' }],
  }

  const filtered = activeFilter === 'all' ? images : images.filter(i => i.category === activeFilter)

  return (
    <>
      {/* Page Hero */}
      <div style={{ background: '#0d0d0d', padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="container">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="label-white" style={{ marginBottom: '1.25rem' }}>
            — {lang === 'es' ? 'Nuestro trabajo' : 'La nostra feina'}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="section-title-white">
            {lang === 'es' ? 'Galería' : 'Galeria'}
          </motion.h1>
        </div>
      </div>

      {/* Galería */}
      <section style={{ background: '#0d0d0d', padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="container">
          {/* Filtros */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {filters[lang].map(f => (
              <button key={f.id} onClick={() => setActiveFilter(f.id)}
                style={{ padding: '8px 20px', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', border: `1.5px solid ${activeFilter === f.id ? '#fff' : 'rgba(255,255,255,0.2)'}`, background: activeFilter === f.id ? '#fff' : 'transparent', color: activeFilter === f.id ? '#0d0d0d' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.2s' }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px', background: '#333' }} className="gallery-full-grid">
            {filtered.map((img, i) => (
              <GalleryItem key={img.src} img={img} i={i} onClick={() => setLightbox(img)} />
            ))}
          </div>
        </div>

        <AnimatePresence>
          {lightbox && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
              onClick={() => setLightbox(null)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                style={{ position: 'relative', maxWidth: '900px', width: '100%', maxHeight: '90vh' }}
                onClick={e => e.stopPropagation()}>
                <img src={lightbox.src} alt={lightbox.alt} style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '90vh' }} />
                <button onClick={() => setLightbox(null)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', width: '36px', height: '36px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>✕</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <style>{`
        .gallery-full-grid { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 1024px) { .gallery-full-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 640px) { .gallery-full-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </>
  )
}

function GalleryItem({ img, i, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: (i % 4) * 0.05 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', background: '#1a1a1a' }}>
      <img src={img.src} alt={img.alt} loading="lazy"
        style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block', transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.5s' }} />
      <div style={{ position: 'absolute', inset: 0, background: hovered ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)', transition: 'background 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {hovered && <div style={{ width: '36px', height: '36px', border: '1.5px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem' }}>+</div>}
      </div>
    </motion.div>
  )
}
