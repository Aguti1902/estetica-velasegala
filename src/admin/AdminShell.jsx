import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from './useAdminAuth'
import AdminLogin from './AdminLogin'

const NAV = [
  { to: '/admin', label: 'Inicio', end: true },
  { to: '/admin/tratamientos', label: 'Tratamientos' },
  { to: '/admin/contacto', label: 'Contacto' },
  { to: '/admin/tarjetas', label: 'Tarjetas regalo' },
]

export default function AdminShell() {
  const { authed, pwd, pwdError, setPwdError, verifyLogin, logout } = useAdminAuth()
  const location = useLocation()

  if (!authed) {
    return (
      <AdminLogin
        onSubmit={verifyLogin}
        pwdError={pwdError}
        setPwdError={setPwdError}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#141414', color: '#eee' }}>
      <header style={{
        borderBottom: '1px solid #2a2a2a', padding: '16px 24px',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px',
        justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ margin: 0, fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase', color: '#c9a882' }}>
            Estetica Segala
          </p>
          <h1 style={{ margin: '4px 0 0', fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '1.25rem' }}>
            Administración
          </h1>
        </div>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {NAV.map(({ to, label, end }) => {
            const active = end ? location.pathname === to : location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                style={{
                  padding: '8px 14px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px',
                  textDecoration: 'none', color: active ? '#141414' : '#ccc',
                  background: active ? '#c9a882' : '#222', border: '1px solid #333',
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>
        <button
          type="button"
          onClick={logout}
          style={{
            padding: '8px 14px', background: 'transparent', border: '1px solid #444',
            color: '#888', fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase',
          }}
        >
          Salir
        </button>
      </header>
      <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Outlet context={{ pwd }} />
      </main>
    </div>
  )
}
