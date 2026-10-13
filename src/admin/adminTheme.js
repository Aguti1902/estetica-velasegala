/** Estilos compartidos del panel (tema claro, alineado con la web) */
export const adminTheme = {
  pageBg: '#ffffff',
  sidebarBg: '#fafafa',
  cardBg: '#ffffff',
  subtleBg: '#f2ebe3',
  border: '#d4c2ad',
  borderStrong: '#d0d0d0',
  text: '#1f1814',
  textMuted: '#5c4030',
  accent: '#8b5e3c',
  accentHover: '#b8956a',
  danger: '#c53030',
  inputBg: '#ffffff',
}

export const adminNavLink = (active) => ({
  padding: '12px 16px',
  fontSize: '13px',
  textDecoration: 'none',
  color: active ? '#fff' : adminTheme.text,
  background: active ? adminTheme.text : 'transparent',
  borderRadius: '4px',
  fontWeight: active ? 600 : 400,
})
