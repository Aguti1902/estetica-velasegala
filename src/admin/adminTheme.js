/** Estilos compartidos del panel (tema claro, alineado con la web) */
export const adminTheme = {
  pageBg: '#ffffff',
  sidebarBg: '#fafafa',
  cardBg: '#ffffff',
  subtleBg: '#f5f5f5',
  border: '#e8e8e8',
  borderStrong: '#d0d0d0',
  text: '#0d0d0d',
  textMuted: '#6b7280',
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
