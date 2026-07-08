import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLang } from '../context/LanguageContext'
import { servicesData } from '../data/services'

export default function Contact() {
  const { t, lang } = useLang()
  const services = servicesData[lang]
  const f = t.contact.form
  const info = t.contact.info
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '', privacy: false })
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
    <section id="contacte" style={{ background: '#f5f5f5', padding: 'clamp(5rem, 10vw, 7rem) 0' }}>
      <div className="container">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="label" style={{ marginBottom: '1.25rem' }}>
            — {t.contact.badge}
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="section-title">
            {t.contact.title}
          </motion.h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2px', background: '#e8e8e8' }} className="contact-grid">

          {/* Formulario */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ background: '#fff', padding: 'clamp(2rem, 4vw, 3rem)' }}>
            {submitted ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <svg width="22" height="22" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 400, color: '#0d0d0d', marginBottom: '0.5rem' }}>{f.successMsg}</h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }} className="form-row">
                  <Field label={f.name} required>
                    <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} style={inputStyle(errors.name)} placeholder="Maria García"
                      onFocus={e => e.target.style.borderColor = '#0d0d0d'} onBlur={e => e.target.style.borderColor = errors.name ? '#e53e3e' : '#e8e8e8'} />
                  </Field>
                  <Field label={f.email} required>
                    <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} style={inputStyle(errors.email)} placeholder="maria@email.com"
                      onFocus={e => e.target.style.borderColor = '#0d0d0d'} onBlur={e => e.target.style.borderColor = errors.email ? '#e53e3e' : '#e8e8e8'} />
                  </Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }} className="form-row">
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
                  <textarea rows={4} value={form.message} onChange={e => handleChange('message', e.target.value)} style={{ ...inputStyle(false), resize: 'none' }} placeholder={f.messagePlaceholder}
                    onFocus={e => e.target.style.borderColor = '#0d0d0d'} onBlur={e => e.target.style.borderColor = '#e8e8e8'} />
                </Field>

                <div onClick={() => handleChange('privacy', !form.privacy)} style={{ display: 'flex', gap: '12px', cursor: 'pointer', alignItems: 'flex-start' }}>
                  <div style={{ width: '18px', height: '18px', border: `1.5px solid ${form.privacy ? '#0d0d0d' : errors.privacy ? '#e53e3e' : '#d0d0d0'}`, background: form.privacy ? '#0d0d0d' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', transition: 'all 0.15s' }}>
                    {form.privacy && <svg width="10" height="10" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5, userSelect: 'none' }}>
                    {f.privacy}{' '}
                    <Link to="/politica-privacitat" onClick={e => e.stopPropagation()} style={{ color: '#0d0d0d', fontWeight: 600 }}>{f.privacyLink}</Link>
                  </span>
                </div>

                <button type="submit" className="btn-dark" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
                  {f.submit}
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </button>
              </form>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: '#e8e8e8' }}>
            {[
              { label: info.addressLabel, value: info.address },
              { label: info.phoneLabel, value: t.topbar.phone, href: `tel:${t.topbar.phone.replace(/\s/g, '')}` },
              { label: 'WhatsApp', value: t.topbar.whatsapp, href: `https://wa.me/34${t.topbar.whatsapp.replace(/\s/g, '')}` },
              { label: info.emailLabel, value: t.topbar.email, href: `mailto:${t.topbar.email}` },
              { label: info.scheduleLabel, value: info.schedule },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', padding: '1.5rem 1.75rem' }}>
                <div className="label" style={{ marginBottom: '6px' }}>{item.label}</div>
                {item.href
                  ? <a href={item.href} style={{ fontSize: '0.9rem', color: '#0d0d0d', fontWeight: 500, textDecoration: 'none' }}>{item.value}</a>
                  : <div style={{ fontSize: '0.9rem', color: '#0d0d0d', fontWeight: 500, whiteSpace: 'pre-line' }}>{item.value}</div>
                }
              </div>
            ))}
            <div style={{ flex: 1, overflow: 'hidden', minHeight: '160px' }}>
              <iframe
                title="Mapa Vela Segala Estètica"
                src="https://maps.google.com/maps?q=Pla%C3%A7a+1+d%27Octubre%2C+6%2C+08470+Sant+Celoni%2C+Barcelona&output=embed&z=17"
                width="100%" height="100%" style={{ border: 0, display: 'block', minHeight: '180px' }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .contact-grid { grid-template-columns: 3fr 2fr; }
        .form-row { grid-template-columns: repeat(2, 1fr); }
        @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 480px) { .form-row { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
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
