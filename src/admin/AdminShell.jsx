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
    <div className="admin-layout-root" style={{ minHeight: '100vh', background: '#141414', color: '#eee', display: 'flex' }}>
      <style>{`
        @media (max-width: 768px) {
          .admin-layout-root { flex-direction: column !important; }
          .admin-layout-aside { width: 100% !important; min-height: auto !important; position: static !important; }
          .admin-layout-nav { flex-direction: row !important; flex-wrap: wrap !important; }
        }
      `}</style>
      <aside
        className="admin-layout-aside"
        style={{
          width: '260px', flexShrink: 0, background: '#1a1a1a', borderRight: '1px solid #2a2a2a',
          display: 'flex', flexDirection: 'column', padding: '24px 16px',
          position: 'sticky', top: 0, alignSelf: 'flex-start', minHeight: '100vh',
        }}
      >
        <Link to="/admin" style={{ display: 'block', textAlign: 'center', marginBottom: '28px', textDecoration: 'none' }}>
          <img
            src="/logo.png"
            alt="Estetica Segala"
            style={{ maxWidth: '100%', height: 'auto', maxHeight: '72px', objectFit: 'contain' }}
          />
          <p style={{
            margin: '12px 0 0', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase',
            color: '#888',
          }}
          >
            Panel de gestión
          </p>
        </Link>

        <nav className="admin-layout-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {NAV.map(({ to, label, end }) => {
            const active = end ? location.pathname === to : location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                style={{
                  padding: '12px 16px', fontSize: '13px', textDecoration: 'none',
                  color: active ? '#141414' : '#ccc',
                  background: active ? '#c9a882' : 'transparent',
                  borderRadius: '4px',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #2a2a2a' }}>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '12px', textDecoration: 'none' }}
          >
            Ver web pública ↗
          </a>
          <button
            type="button"
            onClick={logout}
            style={{
              width: '100%', padding: '10px', background: 'transparent', border: '1px solid #444',
              color: '#888', fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 'clamp(20px, 4vw, 32px)', minWidth: 0, overflow: 'auto' }}>
        <Outlet context={{ pwd }} />
      </main>
    </div>
  )
}
