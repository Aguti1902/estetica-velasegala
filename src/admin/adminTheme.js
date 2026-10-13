/** Estilos compartidos del panel (tema claro, alineado con la web) */
export const adminTheme = {
  pageBg: '#ffffff',
  sidebarBg: '#fafafa',
  cardBg: '#ffffff',
  subtleBg: '#f9f6f1',
  border: '#e8d9c8',
  borderStrong: '#d0d0d0',
  text: '#1a1a1a',
  textMuted: '#7a6352',
  accent: '#c9a882',
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
