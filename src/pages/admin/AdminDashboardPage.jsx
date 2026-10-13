import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { adminFetch } from '../../admin/useAdminAuth'
import {
  adminTheme as t,
  uiCard,
  uiPageTitle,
  uiBtnPrimary,
  uiBtnGhost,
} from '../../admin/adminTheme'
import DateRangeFilter from '../../admin/DateRangeFilter'
import { getPresetRange, rangeToInputs, startOfDay, endOfDay } from '../../admin/dateRange'
import { channelMeta, formatTime, toDateKey } from '../../admin/clinicHours'

function euro(n) {
  return `${Number(n || 0).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}€`
}

export default function AdminDashboardPage() {
  const { pwd } = useOutletContext()
  const initial = getPresetRange('month')
  const initialInputs = rangeToInputs(initial.from, initial.to)
  const [preset, setPreset] = useState('month')
  const [fromInput, setFromInput] = useState(initialInputs.from)
  const [toInput, setToInput] = useState(initialInputs.to)
  const [loading, setLoading] = useState(true)
  const [appts, setAppts] = useState([])
  const [clients, setClients] = useState([])
  const [messages, setMessages] = useState([])
  const [cards, setCards] = useState([])

  const range = useMemo(
    () => getPresetRange(preset, fromInput, toInput),
    [preset, fromInput, toInput],
  )

  const applyPreset = (id) => {
    setPreset(id)
    if (id !== 'custom') {
      const r = getPresetRange(id)
      const inp = rangeToInputs(r.from, r.to)
      setFromInput(inp.from)
      setToInput(inp.to)
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // margen para próximas citas fuera del periodo
      const fetchFrom = new Date(range.from)
      fetchFrom.setDate(fetchFrom.getDate() - 7)
      const fetchTo = new Date(range.to)
      fetchTo.setDate(fetchTo.getDate() + 21)

      const [aRes, cRes, mRes, gRes] = await Promise.all([
        adminFetch(
          `/api/admin/appointments?from=${encodeURIComponent(startOfDay(fetchFrom).toISOString())}&to=${encodeURIComponent(endOfDay(fetchTo).toISOString())}&include_cancelled=true`,
          pwd,
        ),
        adminFetch('/api/admin/clients?limit=300', pwd),
        adminFetch('/api/admin/contact?limit=100', pwd),
        adminFetch('/api/admin/cards', pwd),
      ])

      if (aRes.ok) {
        const data = await aRes.json()
        setAppts(Array.isArray(data) ? data : [])
      }
      if (cRes.ok) {
        const data = await cRes.json()
        setClients(Array.isArray(data) ? data.filter((c) => c.status !== 'archived') : [])
      }
      if (mRes.ok) {
        const data = await mRes.json()
        setMessages(Array.isArray(data) ? data : [])
      }
      if (gRes.ok) {
        const data = await gRes.json()
        setCards(Array.isArray(data) ? data : [])
      }
    } finally {
      setLoading(false)
    }
  }, [pwd, range.from, range.to])

  useEffect(() => { load() }, [load])

  const stats = useMemo(() => {
    const now = new Date()
    const todayKey = toDateKey(now)
    const inPeriod = appts.filter((a) => {
      const d = new Date(a.starts_at)
      return d >= range.from && d <= range.to
    })
    const active = inPeriod.filter((a) => a.status !== 'cancelled')
    const countable = inPeriod.filter((a) => a.status === 'confirmed' || a.status === 'completed')
    const revenue = countable.reduce((s, a) => s + (Number(a.amount) || 0), 0)
    const noShows = inPeriod.filter((a) => a.status === 'no_show').length

    const today = appts
      .filter((a) => a.status !== 'cancelled' && toDateKey(new Date(a.starts_at)) === todayKey)
      .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))

    const upcoming = appts
      .filter((a) => a.status !== 'cancelled' && new Date(a.starts_at) >= now)
      .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
      .slice(0, 6)

    const barDays = []
    const cursor = new Date(range.from)
    const end = new Date(range.to)
    // limitar barras a 31 días para no saturar
    let guard = 0
    while (cursor <= end && guard < 31) {
      const key = toDateKey(cursor)
      const count = active.filter((a) => toDateKey(new Date(a.starts_at)) === key).length
      barDays.push({
        key,
        day: cursor.getDate(),
        dow: cursor.getDay(),
        label: cursor.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''),
        count,
        isToday: key === todayKey,
      })
      cursor.setDate(cursor.getDate() + 1)
      guard += 1
    }
    const maxBar = Math.max(1, ...barDays.map((b) => b.count))

    const channels = {}
    for (const a of countable) {
      const ch = a.channel || 'other'
      channels[ch] = (channels[ch] || 0) + 1
    }
    const channelList = Object.entries(channels)
      .map(([id, count]) => ({ ...channelMeta(id), id, count }))
      .sort((a, b) => b.count - a.count)

    const treatments = {}
    for (const a of countable) {
      const name = a.service_name || 'Sin tratamiento'
      if (!treatments[name]) treatments[name] = { name, count: 0, spent: 0 }
      treatments[name].count += 1
      treatments[name].spent += Number(a.amount) || 0
    }
    const topTreatments = Object.values(treatments)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const unread = messages.filter((m) => m.status === 'new').length
    const giftRevenue = cards.reduce((s, c) => s + (Number(c.amount) || 0), 0)
    const giftUnused = cards.filter((c) => !c.is_used).length

    const clientSpend = clients
      .map((c) => ({ name: c.name, spent: Number(c.stats?.totalSpent) || 0, visits: c.stats?.visitCount || 0 }))
      .filter((c) => c.spent > 0 || c.visits > 0)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5)

    return {
      periodCount: active.length,
      periodRevenue: revenue,
      periodAppts: countable.length,
      noShows,
      todayCount: today.length,
      clientsCount: clients.length,
      unread,
      giftRevenue,
      giftUnused,
      giftTotal: cards.length,
      upcoming,
      barDays,
      maxBar,
      channelList,
      topTreatments,
      clientSpend,
      todayList: today,
      rangeLabel: range.label,
    }
  }, [appts, clients, messages, cards, range])

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }, [])

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .admin-dash-split { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(260px, 0.9fr); gap: 16px; margin-bottom: 16px; }
        .admin-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(168px, 1fr)); gap: 12px; margin-bottom: 16px; }
        .admin-kpi-card { transition: transform 0.16s ease, box-shadow 0.16s ease; }
        .admin-kpi-card:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(28,25,23,0.08); }
        .admin-heat-cell { transition: transform 0.12s ease; }
        .admin-heat-cell:hover { transform: translateY(-1px); }
        @media (max-width: 900px) {
          .admin-dash-split { grid-template-columns: 1fr; }
        }
      `}</style>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 16,
        alignItems: 'flex-end',
      }}
      >
        <div>
          <p style={{
            margin: '0 0 6px',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: t.accentDark,
          }}
          >
            Dashboard
          </p>
          <h2 style={uiPageTitle}>{greeting}, Natalia</h2>
          <p style={{ color: t.textMuted, margin: '8px 0 0', fontSize: 14.5 }}>
            Resumen · {stats.rangeLabel} · {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/admin/calendario" style={{ ...uiBtnPrimary, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            + Nueva cita
          </Link>
          <button type="button" onClick={load} style={uiBtnGhost}>
            {loading ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <DateRangeFilter
          preset={preset}
          from={fromInput}
          to={toInput}
          onPreset={applyPreset}
          onFrom={setFromInput}
          onTo={setToInput}
        />
      </div>

      {/* KPI row */}
      <div className="admin-kpi-grid">
        <Kpi
          label="Citas hoy"
          value={loading ? '—' : stats.todayCount}
          hint="En agenda"
          tone="accent"
          to="/admin/calendario"
        />
        <Kpi
          label="Citas periodo"
          value={loading ? '—' : stats.periodCount}
          hint={stats.rangeLabel}
          tone="info"
          to="/admin/calendario"
        />
        <Kpi
          label="Ingresos periodo"
          value={loading ? '—' : euro(stats.periodRevenue)}
          hint={`${stats.periodAppts} citas facturadas`}
          tone="success"
          to="/admin/informes"
        />
        <Kpi
          label="No-shows"
          value={loading ? '—' : stats.noShows}
          hint="En el periodo"
          tone="warning"
          to="/admin/seguimiento"
        />
        <Kpi
          label="Clientas"
          value={loading ? '—' : stats.clientsCount}
          hint="En la base de datos"
          tone="warm"
          to="/admin/clientas"
        />
        <Kpi
          label="Mensajes nuevos"
          value={loading ? '—' : stats.unread}
          hint="Formulario web"
          tone="warning"
          to="/admin/contacto"
        />
        <Kpi
          label="Tarjetas regalo"
          value={loading ? '—' : euro(stats.giftRevenue)}
          hint={`${stats.giftUnused} sin canjear / ${stats.giftTotal}`}
          tone="gift"
          to="/admin/tarjetas"
        />
      </div>

      <div className="admin-dash-split">
        {/* Activity chart */}
        <section style={uiCard({ padding: 24, minWidth: 0, overflow: 'hidden' })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
            <div>
              <h3 style={sectionTitle}>Actividad del periodo</h3>
              <p style={sectionSub}>
                {stats.barDays.length > 10 ? 'Calendario de citas' : 'Citas por día'} · {stats.rangeLabel}
              </p>
            </div>
            <Link to="/admin/calendario" style={linkQuiet}>Ver agenda →</Link>
          </div>
          <ActivityChart days={stats.barDays} max={stats.maxBar} />
        </section>

        {/* Channels */}
        <section style={uiCard({ padding: 24 })}>
          <h3 style={sectionTitle}>Origen de citas</h3>
          <p style={{ ...sectionSub, marginBottom: 18 }}>Canales de captación</p>
          {stats.channelList.length === 0 ? (
            <Empty hint="Aún no hay citas con canal registrado" />
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.channelList.map((ch) => {
                const total = stats.channelList.reduce((s, x) => s + x.count, 0) || 1
                const pct = Math.round((ch.count / total) * 100)
                return (
                  <li key={ch.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: ch.color }} />
                        {ch.label}
                      </span>
                      <span style={{ color: t.textMuted }}>{ch.count} · {pct}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: t.subtleBg, overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: ch.color,
                        transition: 'width 0.4s ease',
                      }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
      }}
      >
        {/* Today / upcoming */}
        <section style={uiCard({ padding: 24 })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={sectionTitle}>Hoy en agenda</h3>
              <p style={sectionSub}>{stats.todayCount} cita(s)</p>
            </div>
            <Link to="/admin/calendario" style={linkQuiet}>Abrir</Link>
          </div>
          {stats.todayList.length === 0 ? (
            <Empty hint="Sin citas para hoy · ¡día libre o reserva nueva!" />
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.todayList.map((a) => (
                <li key={a.id} style={rowItem}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: t.accentSoft,
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: 12,
                    color: t.accentDark,
                    flexShrink: 0,
                  }}
                  >
                    {formatTime(new Date(a.starts_at))}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: 'block', fontSize: 14 }}>{a.client_name}</strong>
                    <span style={{ fontSize: 12.5, color: t.textMuted }}>
                      {a.service_name || 'Cita'}{a.amount ? ` · ${euro(a.amount)}` : ''}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {stats.upcoming.length > 0 && (
            <>
              <h4 style={{ ...sectionTitle, fontSize: 14, margin: '22px 0 12px' }}>Próximas</h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.upcoming.slice(0, 4).map((a) => (
                  <li key={a.id} style={{ ...rowItem, padding: '10px 12px' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <strong style={{ fontSize: 13.5 }}>{a.client_name}</strong>
                      <div style={{ fontSize: 12, color: t.textMuted }}>
                        {new Date(a.starts_at).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {' · '}{formatTime(new Date(a.starts_at))}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 650,
                      padding: '5px 10px',
                      borderRadius: 999,
                      background: t.subtleBg,
                      color: t.textMuted,
                      whiteSpace: 'nowrap',
                    }}
                    >
                      {a.service_name || 'Cita'}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* Top treatments */}
        <section style={uiCard({ padding: 24 })}>
          <h3 style={sectionTitle}>Tratamientos top</h3>
          <p style={{ ...sectionSub, marginBottom: 16 }}>Más reservados del periodo</p>
          {stats.topTreatments.length === 0 ? (
            <Empty hint="Cuando registres citas con tratamiento, aparecerán aquí" />
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {stats.topTreatments.map((tr, i) => (
                <li key={tr.name} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: i < stats.topTreatments.length - 1 ? `1px solid ${t.border}` : 'none',
                }}
                >
                  <span style={{
                    width: 32,
                    height: 32,
                    borderRadius: 11,
                    background: i === 0 ? t.accent : t.subtleBg,
                    color: i === 0 ? '#fff' : t.textMuted,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                  >
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 13.5, display: 'block' }}>{tr.name}</strong>
                    <span style={{ fontSize: 12, color: t.textMuted }}>{tr.count} citas</span>
                  </div>
                  <strong style={{ fontSize: 14 }}>{euro(tr.spent)}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Top clients */}
        <section style={uiCard({ padding: 24 })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={sectionTitle}>Clientas top</h3>
              <p style={sectionSub}>Por gasto acumulado</p>
            </div>
            <Link to="/admin/clientas" style={linkQuiet}>Ver todas</Link>
          </div>
          {stats.clientSpend.length === 0 ? (
            <Empty hint="Vincula clientas a las citas para ver el ranking" />
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.clientSpend.map((c) => (
                <li key={c.name} style={rowItem}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${t.accentSoft}, #fff)`,
                    border: `1px solid ${t.border}`,
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                    color: t.accentDark,
                  }}
                  >
                    {(c.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 14 }}>{c.name}</strong>
                    <div style={{ fontSize: 12, color: t.textMuted }}>{c.visits} visitas</div>
                  </div>
                  <strong style={{ color: t.success }}>{euro(c.spent)}</strong>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Quick links */}
      <div style={{
        marginTop: 20,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12,
      }}
      >
        {[
          { to: '/admin/calendario', title: 'Agenda', desc: 'Reservas y horarios' },
          { to: '/admin/informes', title: 'Informes', desc: 'Ingresos y métricas' },
          { to: '/admin/seguimiento', title: 'Seguimiento', desc: 'Reactivar clientas' },
          { to: '/admin/tareas', title: 'Tareas', desc: 'To-do de la clínica' },
          { to: '/admin/inventario', title: 'Inventario', desc: 'Stock y alertas' },
          { to: '/admin/clientas', title: 'Clientas', desc: 'Fichas y frecuencia' },
          { to: '/admin/tratamientos', title: 'Tratamientos', desc: 'Precios y textos' },
          { to: '/admin/contacto', title: 'Bandeja', desc: 'Mensajes web' },
          { to: '/admin/tarjetas', title: 'Gift cards', desc: 'Ventas Stripe' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={{
              ...uiCard({ padding: '18px 20px' }),
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <strong style={{ display: 'block', fontSize: 14.5, marginBottom: 4 }}>{item.title}</strong>
            <span style={{ fontSize: 12.5, color: t.textMuted }}>{item.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function Kpi({ label, value, hint, tone, to }) {
  const tones = {
    accent: { bg: t.accentSoft, fg: t.accentDark },
    info: { bg: t.infoSoft, fg: t.info },
    success: { bg: t.successSoft, fg: t.success },
    warm: { bg: 'rgba(180,120,90,0.12)', fg: '#9a6b4a' },
    warning: { bg: t.warningSoft, fg: t.warning },
    gift: { bg: 'rgba(100,116,139,0.12)', fg: '#475569' },
  }
  const c = tones[tone] || tones.accent
  const Comp = to ? Link : 'div'
  const linkProps = to ? { to, style: { textDecoration: 'none', color: 'inherit' } } : {}
  return (
    <Comp {...linkProps}>
      <div className="admin-kpi-card" style={uiCard({
        padding: '16px 16px 14px',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0,
      })}
      >
        <div style={{
          position: 'absolute',
          top: -20,
          right: -16,
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: c.bg,
        }}
        />
        <p style={{
          margin: 0,
          fontSize: 11.5,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: t.textMuted,
        }}
        >
          {label}
        </p>
        <p style={{
          margin: '10px 0 4px',
          fontFamily: t.fontDisplay,
          fontSize: '1.85rem',
          fontWeight: 600,
          letterSpacing: '-0.03em',
          color: t.text,
          lineHeight: 1,
        }}
        >
          {value}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: c.fg, fontWeight: 600 }}>{hint}</p>
      </div>
    </Comp>
  )
}

function heatColor(count, max) {
  if (!count) return '#f6f3ef'
  const ratio = count / Math.max(max, 1)
  if (ratio > 0.75) return '#8a6d4b'
  if (ratio > 0.4) return '#c9a882'
  return '#ead9c4'
}

function ActivityChart({ days, max }) {
  if (!days.length) return <Empty hint="Sin días en este periodo" />
  if (days.length <= 10) return <ShortBars days={days} max={max} />
  return <MonthHeatmap days={days} max={max} />
}

function ShortBars({ days, max }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
      gap: 8,
      alignItems: 'end',
      height: 168,
      paddingTop: 8,
    }}
    >
      {days.map((d) => (
        <div key={d.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end', minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: d.count ? t.text : t.textMuted }}>{d.count || '·'}</span>
          <div style={{
            width: '100%',
            maxWidth: 36,
            height: d.count ? `${Math.max(18, (d.count / max) * 108)}px` : 6,
            borderRadius: 999,
            background: d.isToday
              ? `linear-gradient(180deg, ${t.accent} 0%, ${t.accentDark} 100%)`
              : d.count
                ? 'linear-gradient(180deg, #e7e2db 0%, #cfc6bb 100%)'
                : '#efeae4',
            boxShadow: d.isToday ? '0 8px 16px rgba(201,168,130,0.35)' : 'none',
          }}
          />
          <span style={{
            fontSize: 11,
            fontWeight: d.isToday ? 700 : 500,
            color: d.isToday ? t.text : t.textMuted,
            textTransform: 'capitalize',
          }}
          >
            {d.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function MonthHeatmap({ days, max }) {
  const weeks = []
  let week = Array(7).fill(null)
  for (const d of days) {
    const col = d.dow === 0 ? 6 : d.dow - 1
    if (col === 0 && week.some(Boolean)) {
      weeks.push(week)
      week = Array(7).fill(null)
    }
    week[col] = d
  }
  if (week.some(Boolean)) weeks.push(week)

  const weekTotals = weeks.map((w, i) => ({
    label: `S${i + 1}`,
    count: w.reduce((s, d) => s + (d?.count || 0), 0),
  }))

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: 6,
        marginBottom: 6,
      }}
      >
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: t.textMuted, letterSpacing: '0.04em' }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {weeks.map((w, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
            {w.map((d, di) => (
              d ? (
                <div
                  key={d.key}
                  className="admin-heat-cell"
                  title={`${d.day} · ${d.count} cita${d.count === 1 ? '' : 's'}`}
                  style={{
                    minHeight: 52,
                    borderRadius: 14,
                    background: heatColor(d.count, max),
                    color: d.count && d.count / Math.max(max, 1) > 0.4 ? '#fff' : t.text,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    border: d.isToday ? `2px solid ${t.text}` : '1px solid transparent',
                    boxShadow: d.isToday ? '0 6px 16px rgba(28,25,23,0.12)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>{d.day}</span>
                  <span style={{ fontSize: 10, fontWeight: 650, opacity: d.count ? 1 : 0.45 }}>
                    {d.count ? `${d.count}` : '·'}
                  </span>
                </div>
              ) : (
                <div key={`e-${wi}-${di}`} />
              )
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16, alignItems: 'center' }}>
        {weekTotals.map((w) => (
          <span key={w.label} style={{
            padding: '5px 10px',
            borderRadius: 999,
            background: t.subtleBg,
            border: `1px solid ${t.border}`,
            fontSize: 12,
            color: t.textMuted,
            fontWeight: 650,
          }}
          >
            {w.label} · {w.count}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: t.textMuted }}>
          {[0, 1, 2, 3].map((n) => (
            <span key={n} title={n ? `${n}+` : '0'} style={{
              width: 12, height: 12, borderRadius: 4, background: heatColor(n, 3),
              border: '1px solid rgba(28,25,23,0.06)',
            }}
            />
          ))}
          menos → más
        </span>
      </div>
    </div>
  )
}

function Empty({ hint }) {
  return (
    <div style={{
      padding: '28px 16px',
      textAlign: 'center',
      borderRadius: t.radius,
      background: t.subtleBg,
      color: t.textMuted,
      fontSize: 13,
      lineHeight: 1.5,
    }}
    >
      {hint}
    </div>
  )
}

const sectionTitle = {
  margin: 0,
  fontFamily: t.fontDisplay,
  fontWeight: 500,
  fontSize: '1.2rem',
  letterSpacing: '-0.02em',
}
const sectionSub = {
  margin: '4px 0 0',
  fontSize: 12.5,
  color: t.textMuted,
}
const linkQuiet = {
  fontSize: 12.5,
  fontWeight: 650,
  color: t.accentDark,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
}
const rowItem = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 14px',
  borderRadius: t.radius,
  background: t.subtleBg,
  border: `1px solid ${t.border}`,
}
