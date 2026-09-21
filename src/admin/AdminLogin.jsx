import { useState } from 'react'
import { motion } from 'framer-motion'
import { adminTheme as t } from './adminTheme'

export default function AdminLogin({ onSubmit, pwdError, setPwdError }) {
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(pwd)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: t.pageBg, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%', maxWidth: '400px', textAlign: 'center',
        }}
      >
        <img
          src="/logo.png"
          alt="Estetica Segala"
          style={{ display: 'block', margin: '0 auto 32px', maxWidth: '220px', width: '100%', height: 'auto' }}
        />
        <div style={{
          background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: '8px',
          padding: '40px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}
        >
          <h1 style={{
            fontFamily: 'Georgia, serif', fontSize: '1.35rem', fontWeight: 400,
            color: t.text, marginBottom: '28px',
          }}
          >
            Acceso al panel
          </h1>
          <form onSubmit={handleSubmit}>
            <label style={{
              display: 'block', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
              color: t.textMuted, marginBottom: '8px', textAlign: 'left',
            }}
            >
              Contraseña
            </label>
            <input
              type="password"
              value={pwd}
              onChange={(e) => { setPwd(e.target.value); setPwdError(false) }}
              placeholder="••••••••"
              autoFocus
              style={{
                width: '100%', padding: '14px 16px', background: t.inputBg,
                border: `1.5px solid ${pwdError ? t.danger : t.border}`,
                borderRadius: '4px', color: t.text, fontSize: '16px',
                outline: 'none', marginBottom: '8px', boxSizing: 'border-box',
              }}
            />
            {pwdError && (
              <p style={{ color: t.danger, fontSize: '13px', marginBottom: '12px', textAlign: 'left' }}>Contraseña incorrecta</p>
            )}
            <button
              type="submit"
              disabled={loading || !pwd}
              style={{
                width: '100%', padding: '14px', background: t.text, color: '#fff',
                border: 'none', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase',
                cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
                marginTop: '8px', borderRadius: '4px', fontWeight: 600,
              }}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
