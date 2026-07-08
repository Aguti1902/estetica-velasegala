import { useLang } from '../context/LanguageContext'

const items = {
  es: ['Médicos certificados', '+200 reseñas 5★', 'Cita en 24h', 'Tecnología avanzada', 'Atención personalizada', 'Sant Celoni, BCN'],
  ca: ['Metges certificats', '+200 ressenyes 5★', 'Cita en 24h', 'Tecnologia avançada', 'Atenció personalitzada', 'Sant Celoni, BCN'],
}

export default function TrustStrip() {
  const { lang } = useLang()
  const list = items[lang]

  return (
    <div style={{ background: '#0d0d0d', padding: '1.1rem 0', overflow: 'hidden' }}>
      <div className="container">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem' }}>
          {list.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '4px', height: '4px', background: 'rgba(255,255,255,0.3)', display: 'inline-block' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
