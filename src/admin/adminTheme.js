/** Design system del panel admin — look SaaS claro, redondeado */
export const adminTheme = {
  pageBg: '#f0eeeb',
  pageBgGlow:
    'radial-gradient(1200px 600px at 10% -10%, rgba(201,168,130,0.28), transparent 55%), radial-gradient(900px 500px at 100% 0%, rgba(120,140,160,0.12), transparent 50%), #f0eeeb',
  sidebarBg: 'rgba(255,255,255,0.78)',
  cardBg: '#ffffff',
  subtleBg: '#f7f4f0',
  border: 'rgba(28, 25, 23, 0.08)',
  borderStrong: 'rgba(28, 25, 23, 0.14)',
  text: '#1c1917',
  textMuted: '#78716c',
  accent: '#c9a882',
  accentSoft: 'rgba(201, 168, 130, 0.18)',
  accentHover: '#b8956a',
  accentDark: '#8a6d4b',
  success: '#059669',
  successSoft: 'rgba(5, 150, 105, 0.12)',
  warning: '#d97706',
  warningSoft: 'rgba(217, 119, 6, 0.12)',
  info: '#0e7490',
  infoSoft: 'rgba(14, 116, 144, 0.12)',
  danger: '#dc2626',
  dangerSoft: 'rgba(220, 38, 38, 0.1)',
  inputBg: '#ffffff',
  radius: 14,
  radiusSm: 10,
  radiusLg: 22,
  radiusXl: 28,
  radiusPill: 999,
  shadow: '0 4px 20px rgba(28, 25, 23, 0.05)',
  shadowMd: '0 8px 28px rgba(28, 25, 23, 0.07)',
  shadowLg: '0 18px 50px rgba(28, 25, 23, 0.12)',
  font: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
  fontDisplay: '"Fraunces", Georgia, serif',
}

export const adminNavLink = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '11px 14px',
  fontSize: 13.5,
  textDecoration: 'none',
  color: active ? adminTheme.text : adminTheme.textMuted,
  background: active
    ? `linear-gradient(135deg, ${adminTheme.accentSoft}, rgba(255,255,255,0.9))`
    : 'transparent',
  border: active ? `1px solid ${adminTheme.borderStrong}` : '1px solid transparent',
  borderRadius: adminTheme.radius,
  fontWeight: active ? 650 : 500,
  boxShadow: active ? adminTheme.shadow : 'none',
  transition: 'background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease',
})

export const uiCard = (extra = {}) => ({
  background: adminTheme.cardBg,
  border: `1px solid ${adminTheme.border}`,
  borderRadius: adminTheme.radiusLg,
  boxShadow: adminTheme.shadow,
  ...extra,
})

export const uiInput = {
  width: '100%',
  padding: '12px 14px',
  border: `1.5px solid ${adminTheme.borderStrong}`,
  borderRadius: adminTheme.radiusSm,
  fontSize: 14,
  boxSizing: 'border-box',
  background: adminTheme.inputBg,
  color: adminTheme.text,
  fontFamily: adminTheme.font,
  outline: 'none',
}

export const uiBtnPrimary = {
  padding: '7px 14px',
  background: `linear-gradient(135deg, ${adminTheme.text} 0%, #3f3a36 100%)`,
  color: '#fff',
  border: 'none',
  borderRadius: adminTheme.radiusPill,
  cursor: 'pointer',
  fontSize: 12.5,
  fontWeight: 650,
  fontFamily: adminTheme.font,
  boxShadow: '0 2px 8px rgba(28,25,23,0.12)',
  lineHeight: 1.2,
}

export const uiBtnGhost = {
  padding: '6px 12px',
  background: '#fff',
  border: `1px solid ${adminTheme.borderStrong}`,
  borderRadius: adminTheme.radiusPill,
  cursor: 'pointer',
  fontSize: 12.5,
  color: adminTheme.text,
  fontFamily: adminTheme.font,
  fontWeight: 550,
  lineHeight: 1.2,
}

export const uiPageTitle = {
  fontFamily: adminTheme.fontDisplay,
  fontWeight: 500,
  fontSize: 'clamp(1.6rem, 2.5vw, 2rem)',
  margin: 0,
  color: adminTheme.text,
  letterSpacing: '-0.02em',
}

export const FONT_IMPORT =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'
