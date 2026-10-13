import { useState } from 'react'
import { motion } from 'framer-motion'
import { adminTheme as t, FONT_IMPORT, uiBtnPrimary, uiInput } from './adminTheme'

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
      minHeight: '100vh',
      background: t.pageBgGlow,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: t.font,
    }}
    >
      <link rel="stylesheet" href={FONT_IMPORT} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}
      >
        <div style={{
          background: t.cardBg,
          border: `1px solid ${t.border}`,
          borderRadius: t.radiusXl,
          padding: '40px 36px',
          boxShadow: t.shadowLg,
        }}
        >
          <div style={{
            width: 72,
            height: 72,
            margin: '0 auto 20px',
            borderRadius: 22,
            background: t.subtleBg,
            border: `1px solid ${t.border}`,
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
          }}
          >
            <img src="/logo.png" alt="" style={{ width: '70%', height: 'auto' }} />
          </div>
          <h1 style={{
            fontFamily: t.fontDisplay,
            fontSize: '1.55rem',
            fontWeight: 500,
            color: t.text,
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}
          >
            Estetica Segala
          </h1>
          <p style={{ margin: '0 0 28px', color: t.textMuted, fontSize: 14 }}>
            Accede al panel de gestión
          </p>
          <form onSubmit={handleSubmit}>
            <label style={{
              display: 'block',
              fontSize: 12,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: t.textMuted,
              marginBottom: 8,
              textAlign: 'left',
              fontWeight: 600,
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
                ...uiInput,
                borderColor: pwdError ? t.danger : t.borderStrong,
                marginBottom: 8,
                borderRadius: t.radius,
              }}
            />
            {pwdError && (
              <p style={{ color: t.danger, fontSize: 13, marginBottom: 12, textAlign: 'left' }}>
                Contraseña incorrecta
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !pwd}
              style={{
                ...uiBtnPrimary,
                width: '100%',
                marginTop: 12,
                opacity: loading || !pwd ? 0.65 : 1,
                cursor: loading ? 'wait' : 'pointer',
              }}
            >
              {loading ? 'Entrando…' : 'Entrar al panel'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
