import { useState } from 'react'
import { motion } from 'framer-motion'

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
      minHeight: '100vh', background: '#1a1a1a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: '#222', border: '1px solid #333', borderRadius: '8px',
          padding: '48px', width: '100%', maxWidth: '420px',
        }}
      >
        <p style={{ color: '#c9a882', fontSize: '10px', letterSpacing: '5px', textTransform: 'uppercase', textAlign: 'center', marginBottom: '8px' }}>
          Estetica Segala
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 400, color: 'white', textAlign: 'center', marginBottom: '40px' }}>
          Panel Administración
        </h1>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>
            Contraseña
          </label>
          <input
            type="password"
            value={pwd}
            onChange={(e) => { setPwd(e.target.value); setPwdError(false) }}
            placeholder="••••••••"
            autoFocus
            style={{
              width: '100%', padding: '12px 16px', background: '#2d2d2d',
              border: `1px solid ${pwdError ? '#c00' : '#444'}`,
              borderRadius: '4px', color: 'white', fontSize: '16px',
              outline: 'none', marginBottom: '8px', boxSizing: 'border-box',
              fontFamily: 'monospace', letterSpacing: '4px',
            }}
          />
          {pwdError && (
            <p style={{ color: '#f66', fontSize: '12px', marginBottom: '12px' }}>Contraseña incorrecta</p>
          )}
          <button
            type="submit"
            disabled={loading || !pwd}
            style={{
              width: '100%', padding: '14px', background: '#c9a882', color: '#1a1a1a',
              border: 'none', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
              cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
