import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { adminFetch } from '../../admin/useAdminAuth'
import {
  adminTheme as t,
  uiCard,
  uiPageTitle,
  uiBtnGhost,
} from '../../admin/adminTheme'
import DateRangeFilter from '../../admin/DateRangeFilter'
import { getPresetRange, rangeToInputs } from '../../admin/dateRange'
import { channelMeta, statusMeta, toDateKey } from '../../admin/clinicHours'

function euro(n) {
  return `${Number(n || 0).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€`
}

const thCell = {
  textAlign: 'left',
  color: t.textMuted,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  padding: '8px 6px',
  borderBottom: `1px solid ${t.border}`,
}
const tdCell = {
  padding: '9px 6px',
  borderBottom: `1px solid ${t.border}`,
  fontSize: 13,
}

export default function AdminReportsPage() {
  const { pwd } = useOutletContext()
  const initial = getPresetRange('month')
  const inputs = rangeToInputs(initial.from, initial.to)
  const [preset, setPreset] = useState('month')
  const [from, setFrom] = useState(inputs.from)
  const [to, setTo] = useState(inputs.to)
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const range = useMemo(() => getPresetRange(preset, from, to), [preset, from, to])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminFetch(
        `/api/admin/appointments?from=${encodeURIComponent(range.from.toISOString())}&to=${encodeURIComponent(new Date(range.to.getTime() + 1).toISOString())}&include_cancelled=true`,
        pwd,
      )
      if (res.ok) {
        const data = await res.json()
        setAppts(Array.isArray(data) ? data : [])
      } else {
        setError('No se pudieron cargar los datos')
      }
    } finally {
      setLoading(false)
    }
  }, [pwd, range.from, range.to])

  useEffect(() => { load() }, [load])

  const report = useMemo(() => {
    const inRange = appts.filter((a) => {
      const d = new Date(a.starts_at)
      return d >= range.from && d <= range.to
    })
    const completed = inRange.filter((a) => a.status === 'completed' || a.status === 'confirmed')
    const noShow = inRange.filter((a) => a.status === 'no_show')
    const cancelled = inRange.filter((a) => a.status === 'cancelled')
    const revenue = completed.reduce((s, a) => s + (Number(a.amount) || 0), 0)
    const ticket = completed.length ? revenue / completed.length : 0

    const byDay = {}
    for (const a of completed) {
      const k = toDateKey(new Date(a.starts_at))
      if (!byDay[k]) byDay[k] = { date: k, count: 0, revenue: 0 }
      byDay[k].count += 1
      byDay[k].revenue += Number(a.amount) || 0
    }
    const days = Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date))

    const byTreatment = {}
    for (const a of completed) {
      const name = a.service_name || 'Sin tratamiento'
      if (!byTreatment[name]) byTreatment[name] = { name, count: 0, revenue: 0 }
      byTreatment[name].count += 1
      byTreatment[name].revenue += Number(a.amount) || 0
    }
    const treatments = Object.values(byTreatment).sort((a, b) => b.revenue - a.revenue)

    const byChannel = {}
    for (const a of completed) {
      const id = a.channel || 'other'
      if (!byChannel[id]) byChannel[id] = { id, count: 0, revenue: 0 }
      byChannel[id].count += 1
      byChannel[id].revenue += Number(a.amount) || 0
    }
    const channels = Object.values(byChannel)
      .map((c) => ({ ...c, ...channelMeta(c.id) }))
      .sort((a, b) => b.count - a.count)

    const byStatus = {}
    for (const a of inRange) {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1
    }

    return {
      total: inRange.length,
      completed: completed.length,
      noShow: noShow.length,
      cancelled: cancelled.length,
      revenue,
      ticket,
      noShowRate: inRange.length ? Math.round((noShow.length / inRange.length) * 100) : 0,
      days,
      treatments,
      channels,
      byStatus,
    }
  }, [appts, range.from, range.to])

  const applyPreset = (id) => {
    setPreset(id)
    if (id !== 'custom') {
      const r = getPresetRange(id)
      const inp = rangeToInputs(r.from, r.to)
      setFrom(inp.from)
      setTo(inp.to)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={uiPageTitle}>Informes</h2>
          <p style={{ color: t.textMuted, margin: '6px 0 0', fontSize: 14 }}>
            Ingresos, asistencia y rendimiento · {range.label}
          </p>
        </div>
        <button type="button" onClick={load} style={uiBtnGhost}>{loading ? 'Cargando…' : 'Actualizar'}</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <DateRangeFilter
          preset={preset}
          from={from}
          to={to}
          onPreset={applyPreset}
          onFrom={setFrom}
          onTo={setTo}
        />
      </div>

      {error && (
        <div style={{ marginBottom: 12, padding: 12, background: t.dangerSoft, color: t.danger, borderRadius: t.radius, fontSize: 13 }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
        <Stat label="Citas" value={report.total} />
        <Stat label="Ingresos" value={euro(report.revenue)} accent />
        <Stat label="Ticket medio" value={euro(report.ticket)} />
        <Stat label="Completadas / conf." value={report.completed} />
        <Stat label="No asistieron" value={report.noShow} />
        <Stat label="Canceladas" value={report.cancelled} />
        <Stat label="% no-show" value={`${report.noShowRate}%`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        <section style={uiCard({ padding: 20 })}>
          <h3 style={h3}>Por día</h3>
          {report.days.length === 0 ? <Empty /> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr><th style={thCell}>Fecha</th><th style={thCell}>Citas</th><th style={thCell}>Ingresos</th></tr>
              </thead>
              <tbody>
                {report.days.map((d) => (
                  <tr key={d.date}>
                    <td style={tdCell}>{new Date(`${d.date}T12:00:00`).toLocaleDateString('es-ES')}</td>
                    <td style={tdCell}>{d.count}</td>
                    <td style={tdCell}>{euro(d.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section style={uiCard({ padding: 20 })}>
          <h3 style={h3}>Por tratamiento</h3>
          {report.treatments.length === 0 ? <Empty /> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr><th style={thCell}>Tratamiento</th><th style={thCell}>Citas</th><th style={thCell}>Ingresos</th></tr>
              </thead>
              <tbody>
                {report.treatments.map((d) => (
                  <tr key={d.name}>
                    <td style={tdCell}>{d.name}</td>
                    <td style={tdCell}>{d.count}</td>
                    <td style={tdCell}>{euro(d.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section style={uiCard({ padding: 20 })}>
          <h3 style={h3}>Por canal</h3>
          {report.channels.length === 0 ? <Empty /> : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {report.channels.map((c) => (
                <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '10px 0', borderBottom: `1px solid ${t.border}`, fontSize: 13 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                    {c.label}
                  </span>
                  <strong>{c.count} · {euro(c.revenue)}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={uiCard({ padding: 20 })}>
          <h3 style={h3}>Estados</h3>
          {Object.keys(report.byStatus).length === 0 ? <Empty /> : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {Object.entries(report.byStatus).map(([id, count]) => {
                const st = statusMeta(id)
                return (
                  <li key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${t.border}`, fontSize: 13 }}>
                    <span style={{ color: st.color, fontWeight: 650 }}>{st.label}</span>
                    <strong>{count}</strong>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div style={uiCard({ padding: '14px 16px' })}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.textMuted }}>{label}</div>
      <div style={{ fontFamily: t.fontDisplay, fontSize: '1.45rem', fontWeight: 600, marginTop: 6, color: accent ? t.success : t.text }}>{value}</div>
    </div>
  )
}

function Empty() {
  return <p style={{ color: t.textMuted, fontSize: 13, margin: '12px 0' }}>Sin datos en este periodo</p>
}

const h3 = { margin: '0 0 12px', fontFamily: t.fontDisplay, fontWeight: 500, fontSize: '1.15rem' }
