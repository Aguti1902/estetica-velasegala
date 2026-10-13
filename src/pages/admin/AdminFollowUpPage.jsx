import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { adminFetch } from '../../admin/useAdminAuth'
import {
  adminTheme as t,
  uiCard,
  uiPageTitle,
  uiBtnGhost,
  uiBtnPrimary,
} from '../../admin/adminTheme'
import { formatTime, toDateKey } from '../../admin/clinicHours'

const DAYS_OPTIONS = [
  { id: 30, label: '30 días' },
  { id: 45, label: '45 días' },
  { id: 60, label: '60 días' },
  { id: 90, label: '90 días' },
]

export default function AdminFollowUpPage() {
  const { pwd } = useOutletContext()
  const [clients, setClients] = useState([])
  const [appts, setAppts] = useState([])
  const [days, setDays] = useState(45)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const now = new Date()
      const from = new Date(now)
      from.setDate(from.getDate() - 14)
      const to = new Date(now)
      to.setDate(to.getDate() + 21)
      const [cRes, aRes] = await Promise.all([
        adminFetch('/api/admin/clients?limit=400', pwd),
        adminFetch(
          `/api/admin/appointments?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}&include_cancelled=true`,
          pwd,
        ),
      ])
      if (cRes.ok) {
        const data = await cRes.json()
        setClients(Array.isArray(data) ? data.filter((c) => c.status !== 'archived') : [])
      } else {
        setError('¿Ejecutaste supabase-clients.sql?')
      }
      if (aRes.ok) {
        const data = await aRes.json()
        setAppts(Array.isArray(data) ? data : [])
      }
    } finally {
      setLoading(false)
    }
  }, [pwd])

  useEffect(() => { load() }, [load])

  const data = useMemo(() => {
    const now = new Date()
    const cutoff = new Date(now)
    cutoff.setDate(cutoff.getDate() - days)

    const inactive = clients
      .map((c) => {
        const last = c.stats?.lastVisit ? new Date(c.stats.lastVisit) : null
        const daysSince = last ? Math.floor((now - last) / 86400000) : null
        return { ...c, last, daysSince }
      })
      .filter((c) => !c.last || c.last < cutoff)
      .sort((a, b) => {
        if (a.last == null && b.last == null) return a.name.localeCompare(b.name)
        if (a.last == null) return -1
        if (b.last == null) return 1
        return a.last - b.last
      })

    const pending = appts
      .filter((a) => a.status === 'pending' && new Date(a.starts_at) >= now)
      .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))

    const noShows = appts
      .filter((a) => a.status === 'no_show')
      .sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at))
      .slice(0, 20)

    const todayKey = toDateKey(now)
    const today = appts
      .filter((a) => toDateKey(new Date(a.starts_at)) === todayKey && a.status !== 'cancelled')
      .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))

    return { inactive, pending, noShows, today }
  }, [clients, appts, days])

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={uiPageTitle}>Seguimiento</h2>
          <p style={{ color: t.textMuted, margin: '6px 0 0', fontSize: 14 }}>
            Clientas inactivas, citas por confirmar y no-shows
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {DAYS_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setDays(o.id)}
              style={{
                ...uiBtnGhost,
                background: days === o.id ? t.text : '#fff',
                color: days === o.id ? '#fff' : t.text,
              }}
            >
              Sin visita {o.label}
            </button>
          ))}
          <button type="button" onClick={load} style={uiBtnGhost}>{loading ? '…' : 'Actualizar'}</button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 12, padding: 12, background: t.dangerSoft, color: t.danger, borderRadius: t.radius, fontSize: 13 }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
        <Kpi label="Inactivas" value={data.inactive.length} hint={`+ de ${days} días`} />
        <Kpi label="Por confirmar" value={data.pending.length} hint="Estado pendiente" />
        <Kpi label="No-shows recientes" value={data.noShows.length} hint="Últimas semanas" />
        <Kpi label="Citas hoy" value={data.today.length} hint="Activas" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        <section style={uiCard({ padding: 20 })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={h3}>Clientas a reactivar</h3>
            <Link to="/admin/clientas" style={link}>Ver clientas</Link>
          </div>
          {data.inactive.length === 0 ? (
            <p style={empty}>Ninguna clienta inactiva con este filtro 🎉</p>
          ) : (
            <ul style={list}>
              {data.inactive.slice(0, 40).map((c) => (
                <li key={c.id} style={row}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <strong style={{ fontSize: 14 }}>{c.name}</strong>
                    <div style={{ fontSize: 12, color: t.textMuted }}>
                      {c.phone || 'Sin teléfono'}
                      {' · '}
                      {c.last
                        ? `Última visita hace ${c.daysSince} días`
                        : 'Sin visitas registradas'}
                    </div>
                  </div>
                  {c.phone && (
                    <a
                      href={`https://wa.me/${String(c.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${c.name.split(' ')[0]}, te escribimos de Estetica Segala. ¿Te gustaría reservar tu próximo tratamiento?`)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ ...uiBtnPrimary, textDecoration: 'none', fontSize: 11, padding: '6px 10px' }}
                    >
                      WhatsApp
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={uiCard({ padding: 20 })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={h3}>Citas por confirmar</h3>
            <Link to="/admin/calendario" style={link}>Agenda</Link>
          </div>
          {data.pending.length === 0 ? (
            <p style={empty}>No hay citas pendientes</p>
          ) : (
            <ul style={list}>
              {data.pending.map((a) => (
                <li key={a.id} style={row}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{a.client_name}</strong>
                    <div style={{ fontSize: 12, color: t.textMuted }}>
                      {new Date(a.starts_at).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {' · '}{formatTime(new Date(a.starts_at))}
                      {a.service_name ? ` · ${a.service_name}` : ''}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={uiCard({ padding: 20 })}>
          <h3 style={{ ...h3, marginBottom: 12 }}>No han asistido</h3>
          {data.noShows.length === 0 ? (
            <p style={empty}>Sin no-shows recientes</p>
          ) : (
            <ul style={list}>
              {data.noShows.map((a) => (
                <li key={a.id} style={row}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{a.client_name}</strong>
                    <div style={{ fontSize: 12, color: t.textMuted }}>
                      {new Date(a.starts_at).toLocaleDateString('es-ES')}
                      {' · '}{formatTime(new Date(a.starts_at))}
                      {a.service_name ? ` · ${a.service_name}` : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: t.warning }}>No-show</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function Kpi({ label, value, hint }) {
  return (
    <div style={uiCard({ padding: '14px 16px' })}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.textMuted }}>{label}</div>
      <div style={{ fontFamily: t.fontDisplay, fontSize: '1.6rem', fontWeight: 600, marginTop: 6 }}>{value}</div>
      <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{hint}</div>
    </div>
  )
}

const h3 = { margin: 0, fontFamily: t.fontDisplay, fontWeight: 500, fontSize: '1.15rem' }
const link = { fontSize: 12.5, fontWeight: 650, color: t.accentDark, textDecoration: 'none' }
const list = { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }
const row = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
  padding: '12px 14px', borderRadius: t.radius, background: t.subtleBg, border: `1px solid ${t.border}`,
}
const empty = { color: t.textMuted, fontSize: 13, margin: '8px 0' }
