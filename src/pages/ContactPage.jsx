import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../context/LanguageContext'
import { servicesData } from '../data/services'

export default function ContactPage() {
  const { t, lang } = useLang()
  const services = servicesData[lang]
  const f = t.contact.form
  const info = t.contact.info

  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', clinic: '', message: '', privacy: false })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = true
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = true
    if (!form.privacy) e.privacy = true
    return e
  }
  const handleSubmit = (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setSubmitted(true)
  }
  const handleChange = (field, value) => {
    setForm(p => ({ ...p, [field]: value }))
    setErrors(p => ({ ...p, [field]: false }))
  }

  const inputStyle = (err) => ({
    width: '100%', padding: '12px 14px', fontSize: '0.875rem', color: '#0d0d0d',
    background: '#fff', border: `1.5px solid ${err ? '#e53e3e' : '#e8e8e8'}`,
    outline: 'none', transition: 'border-color 0.2s', fontFamily: 'var(--font-sans)',
  })

  return (
    <>
      {/* Page Hero */}
      <div style={{ background: '#0d0d0d', padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="container">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="label-white" style={{ marginBottom: '1.25rem' }}>
            — {t.contact.badge}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="section-title-white">
            {t.contact.title}
          </motion.h1>
        </div>
      </div>

      {/* Contenido */}
      <section style={{ background: '#f5f5f5', padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2px', background: '#e8e8e8' }} className="contact-page-grid">

            {/* Formulario */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
              style={{ background: '#fff', padding: 'clamp(2rem, 4vw, 3rem)' }}>
              {submitted ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <svg width="22" height="22" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 400, color: '#0d0d0d', marginBottom: '0.5rem' }}>{f.successMsg}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{lang === 'es' ? 'Te contactaremos en menos de 24h.' : 'Et contactarem en menys de 24h.'}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 600, color: '#0d0d0d', marginBottom: '0.5rem' }}>
                    {lang === 'es' ? 'Escríbenos' : 'Escriu-nos'}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }} className="form-row-cp">
                    <Field label={f.name} required>
                      <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} style={inputStyle(errors.name)} placeholder="Maria García"
                        onFocus={e => e.target.style.borderColor = '#0d0d0d'} onBlur={e => e.target.style.borderColor = errors.name ? '#e53e3e' : '#e8e8e8'} />
                    </Field>
                    <Field label={f.email} required>
                      <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} style={inputStyle(errors.email)} placeholder="maria@email.com"
                        onFocus={e => e.target.style.borderColor = '#0d0d0d'} onBlur={e => e.target.style.borderColor = errors.email ? '#e53e3e' : '#e8e8e8'} />
                    </Field>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }} className="form-row-cp">
                    <Field label={f.phone}>
                      <input type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} style={inputStyle(false)} placeholder="600 000 000"
                        onFocus={e => e.target.style.borderColor = '#0d0d0d'} onBlur={e => e.target.style.borderColor = '#e8e8e8'} />
                    </Field>
                    <Field label={f.service}>
                      <select value={form.service} onChange={e => handleChange('service', e.target.value)} style={{ ...inputStyle(false), background: '#fff' }}
                        onFocus={e => e.target.style.borderColor = '#0d0d0d'} onBlur={e => e.target.style.borderColor = '#e8e8e8'}>
                        <option value="">{f.servicePlaceholder}</option>
                        {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </Field>
                  
                  </div>
                  <Field label={f.message}>
                    <textarea rows={5} value={form.message} onChange={e => handleChange('message', e.target.value)} style={{ ...inputStyle(false), resize: 'none' }} placeholder={f.messagePlaceholder}
                      onFocus={e => e.target.style.borderColor = '#0d0d0d'} onBlur={e => e.target.style.borderColor = '#e8e8e8'} />
                  </Field>
                  <div onClick={() => handleChange('privacy', !form.privacy)} style={{ display: 'flex', gap: '12px', cursor: 'pointer', alignItems: 'flex-start' }}>
                    <div style={{ width: '18px', height: '18px', border: `1.5px solid ${form.privacy ? '#0d0d0d' : errors.privacy ? '#e53e3e' : '#d0d0d0'}`, background: form.privacy ? '#0d0d0d' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', transition: 'all 0.15s' }}>
                      {form.privacy && <svg width="10" height="10" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5, userSelect: 'none' }}>
                      {f.privacy}{' '}<a href="#" onClick={e => e.stopPropagation()} style={{ color: '#0d0d0d', fontWeight: 600 }}>{f.privacyLink}</a>
                    </span>
                  </div>
                  <button type="submit" className="btn-dark" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                    {f.submit}
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </button>
                </form>
              )}
            </motion.div>

            {/* Info — Viladecans */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ background: '#0d0d0d', padding: '1.75rem' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1.25rem' }}>
                  Vela Segalà — Viladecans
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.5)" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{'C/ Mare de Déu de Sales, 67C\n08840 Viladecans, Barcelona'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.5)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    <div>
                      <a href="tel:936588406" style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, textDecoration: 'none', display: 'block' }}>93 658 84 06</a>
                      <a href="tel:644104257" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>644 10 42 57</a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.5)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    <a href="mailto:info@esteticavelasegala.com" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>info@esteticavelasegala.com</a>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.5)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>Lun–Vie: 9:00 – 20:30</span>
                  </div>
                </div>
              </div>
              <div style={{ flex: 1, overflow: 'hidden', minHeight: '260px' }}>
                <iframe title="Mapa Viladecans"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2994.8!2d2.00203!3d41.31558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a49bcf4b3a8c2f%3A0x0!2sCarrer%20de%20la%20Mare%20de%20D%C3%A9u%20de%20Sales%2C%2067%2C%2008840%20Viladecans%2C%20Barcelona!5e0!3m2!1ses!2ses!4v1699000000000!5m2!1ses!2ses"
                  width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '260px' }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            </motion.div>
          </div>
        </div>
        <style>{`
          .contact-page-grid { grid-template-columns: 3fr 2fr; }
          .form-row-cp { grid-template-columns: repeat(2, 1fr); }
          @media (max-width: 900px) { .contact-page-grid { grid-template-columns: 1fr !important; } }
          @media (max-width: 480px) { .form-row-cp { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>
    </>
  )
}

function Field({ label, children, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>
        {label}{required && <span style={{ color: '#0d0d0d', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
    </div>
  )
}
