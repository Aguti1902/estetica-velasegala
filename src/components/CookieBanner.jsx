import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../context/LanguageContext'

const STORAGE_KEY = 'cookie-consent'

const content = {
  es: {
    text: 'Utilizamos cookies propias y de terceros para mejorar tu experiencia y analizar el uso de nuestra web. Puedes aceptar todas las cookies o rechazar las no esenciales.',
    privacyLink: 'Política de cookies',
    accept: 'Aceptar todo',
    reject: 'Rechazar',
  },
  ca: {
    text: "Utilitzem cookies pròpies i de tercers per millorar la teva experiència i analitzar l'ús del nostre web. Pots acceptar totes les cookies o rebutjar les no essencials.",
    privacyLink: 'Política de galetes',
    accept: 'Acceptar tot',
    reject: 'Rebutjar',
  },
}

export default function CookieBanner() {
  const { lang } = useLang()
  const [visible, setVisible] = useState(false)
  const c = content[lang]

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  const handleReject = () => {
    localStorage.setItem(STORAGE_KEY, 'rejected')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999,
            background: '#0d0d0d', borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="container" style={{ padding: '1.25rem clamp(1.5rem, 5vw, 4rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: '680px', margin: 0 }}>
              {c.text}{' '}
              <Link to="/politica-cookies" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                {c.privacyLink}
              </Link>
            </p>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={handleReject}
                style={{
                  padding: '9px 20px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: 'transparent', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
              >
                {c.reject}
              </button>
              <button
                onClick={handleAccept}
                style={{
                  padding: '9px 20px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: '#fff', color: '#0d0d0d', border: '1px solid #fff',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e8e8e8'; e.currentTarget.style.borderColor = '#e8e8e8' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#fff' }}
              >
                {c.accept}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
