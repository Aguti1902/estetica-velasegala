import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from './useAdminAuth'
import AdminLogin from './AdminLogin'
import { adminTheme as t, adminNavLink, FONT_IMPORT } from './adminTheme'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true, icon: IconHome },
  { to: '/admin/calendario', label: 'Agenda', icon: IconCalendar },
  { to: '/admin/clientas', label: 'Clientas', icon: IconUsers },
  { to: '/admin/seguimiento', label: 'Seguimiento', icon: IconBell },
  { to: '/admin/informes', label: 'Informes', icon: IconChart },
  { to: '/admin/tareas', label: 'Tareas', icon: IconCheck },
  { to: '/admin/inventario', label: 'Inventario', icon: IconBox },
  { to: '/admin/tratamientos', label: 'Tratamientos', icon: IconSpark },
  { to: '/admin/organizacion', label: 'Organización', icon: IconLayers },
  { to: '/admin/contacto', label: 'Contacto', icon: IconMail },
  { to: '/admin/tarjetas', label: 'Tarjetas regalo', icon: IconGift },
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
    <div
      className="admin-layout-root"
      style={{
        minHeight: '100vh',
        background: t.pageBgGlow,
        color: t.text,
        display: 'flex',
        fontFamily: t.font,
      }}
    >
      <link rel="stylesheet" href={FONT_IMPORT} />
      <style>{`
        .admin-layout-root, .admin-layout-root * { box-sizing: border-box; }
        .admin-nav-link:hover { background: rgba(255,255,255,0.85) !important; color: ${t.text} !important; }
        .admin-nav-link-active:hover { background: linear-gradient(135deg, ${t.accentSoft}, rgba(255,255,255,0.95)) !important; }
        @keyframes adminFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .admin-main-panel { animation: adminFadeUp 0.35s ease both; }
        @media (max-width: 860px) {
          .admin-layout-root { flex-direction: column !important; }
          .admin-layout-aside {
            width: 100% !important; min-height: auto !important;
            position: static !important; border-right: none !important;
            border-bottom: 1px solid ${t.border} !important;
            border-radius: 0 0 ${t.radiusXl}px ${t.radiusXl}px !important;
          }
          .admin-layout-nav { flex-direction: row !important; flex-wrap: wrap !important; }
          .admin-layout-nav a { flex: 1 1 140px; }
        }
      `}</style>

      <aside
        className="admin-layout-aside"
        style={{
          width: 272,
          flexShrink: 0,
          background: t.sidebarBg,
          backdropFilter: 'blur(16px)',
          borderRight: `1px solid ${t.border}`,
          display: 'flex',
          flexDirection: 'column',
          padding: '22px 16px',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          minHeight: '100vh',
          boxShadow: '4px 0 32px rgba(28,25,23,0.03)',
        }}
      >
        <Link to="/admin" style={{ display: 'block', textAlign: 'center', marginBottom: 28, textDecoration: 'none' }}>
          <div style={{
            background: '#fff',
            borderRadius: t.radiusLg,
            padding: '16px 12px',
            border: `1px solid ${t.border}`,
            boxShadow: t.shadow,
          }}
          >
            <img
              src="/logo.png"
              alt="Estetica Segala"
              style={{ maxWidth: '100%', height: 'auto', maxHeight: 64, objectFit: 'contain' }}
            />
            <p style={{
              margin: '10px 0 0',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: t.textMuted,
              fontWeight: 600,
            }}
            >
              Studio · Panel
            </p>
          </div>
        </Link>

        <nav className="admin-layout-nav" style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {NAV.map(({ to, label, end, icon: Icon }) => {
            const active = end ? location.pathname === to : location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={`admin-nav-link${active ? ' admin-nav-link-active' : ''}`}
                style={adminNavLink(active)}
              >
                <span style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  display: 'grid',
                  placeItems: 'center',
                  background: active ? t.accent : t.subtleBg,
                  color: active ? '#fff' : t.textMuted,
                  flexShrink: 0,
                }}
                >
                  <Icon size={16} />
                </span>
                {label}
              </Link>
            )
          })}
        </nav>

        <div style={{
          marginTop: 20,
          padding: 14,
          borderRadius: t.radiusLg,
          background: t.subtleBg,
          border: `1px solid ${t.border}`,
        }}
        >
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12.5,
              color: t.textMuted,
              marginBottom: 12,
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            <IconExternal size={14} /> Ver web pública
          </a>
          <button
            type="button"
            onClick={logout}
            style={{
              width: '100%',
              padding: '11px 12px',
              background: '#fff',
              border: `1px solid ${t.borderStrong}`,
              color: t.text,
              fontSize: 12.5,
              cursor: 'pointer',
              borderRadius: t.radiusPill,
              fontWeight: 600,
              fontFamily: t.font,
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main
        className="admin-main-panel"
        key={location.pathname}
        style={{
          flex: 1,
          padding: 'clamp(16px, 2.2vw, 28px)',
          minWidth: 0,
          overflow: 'auto',
          width: '100%',
        }}
      >
        <Outlet context={{ pwd }} />
      </main>
    </div>
  )
}

function IconHome({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 11.5 12 4l9 7.5" /><path d="M5 10.5V20h14v-9.5" />
    </svg>
  )
}
function IconCalendar({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}
function IconUsers({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="8" r="3.5" /><path d="M2.5 19c.8-3.2 3-5 6.5-5s5.7 1.8 6.5 5" /><circle cx="17.5" cy="9" r="2.5" /><path d="M16 14.5c2.2.4 3.7 1.7 4.2 4" />
    </svg>
  )
}
function IconSpark({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  )
}
function IconLayers({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" />
    </svg>
  )
}
function IconMail({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 8 8 5 8-5" />
    </svg>
  )
}
function IconGift({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="9" width="18" height="12" rx="2" /><path d="M12 9v12M3 13h18M7.5 9c0-2 1.5-3.5 3-3.5S12 7.5 12 9M12 9c0-1.5.8-3.5 2.5-3.5S17.5 7 17.5 9" />
    </svg>
  )
}
function IconChart({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19V5M10 19V9M16 19v-6M22 19H2" />
    </svg>
  )
}
function IconBell({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" /><path d="M10 21h4" />
    </svg>
  )
}
function IconCheck({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="3" /><path d="m8 12 2.5 2.5L16 9" />
    </svg>
  )
}
function IconBox({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 8.5 12 3l9 5.5V19l-9 5-9-5V8.5Z" /><path d="M12 13v11M3 8.5l9 4.5 9-4.5" />
    </svg>
  )
}
function IconExternal({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 4h6v6M20 4 10 14" /><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    </svg>
  )
}
