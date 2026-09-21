import { Link } from 'react-router-dom'

const cards = [
  {
    to: '/admin/tratamientos',
    title: 'Tratamientos',
    desc: 'Edita textos, precios e imágenes de cada servicio (español y catalán).',
  },
  {
    to: '/admin/contacto',
    title: 'Mensajes de contacto',
    desc: 'Consulta solicitudes del formulario y márcalas como leídas o archivadas.',
  },
  {
    to: '/admin/tarjetas',
    title: 'Tarjetas regalo',
    desc: 'Busca códigos, compradores y marca tarjetas como usadas.',
  },
  {
    to: '/',
    title: 'Ver web pública',
    desc: 'Abre la página principal en una pestaña nueva.',
    external: true,
  },
]

export default function AdminDashboardPage() {
  return (
    <div>
      <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '1.75rem', marginBottom: '8px' }}>
        Bienvenido
      </h2>
      <p style={{ color: '#888', marginBottom: '32px', maxWidth: '560px', lineHeight: 1.6 }}>
        Desde aquí puedes gestionar el contenido de la web sin tocar código. Los cambios en tratamientos se publican al guardar (la web los carga automáticamente).
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {cards.map((c) => {
          const inner = (
            <div style={{
              background: '#1e1e1e', border: '1px solid #333', padding: '24px', height: '100%',
              transition: 'border-color 0.2s',
            }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', color: '#c9a882' }}>{c.title}</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#aaa', lineHeight: 1.5 }}>{c.desc}</p>
            </div>
          )
          if (c.external) {
            return (
              <a key={c.to} href={c.to} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                {inner}
              </a>
            )
          }
          return (
            <Link key={c.to} to={c.to} style={{ textDecoration: 'none' }}>
              {inner}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
