import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { adminFetch } from '../../admin/useAdminAuth'
import {
  adminTheme as th,
  uiBtnPrimary,
  uiBtnGhost,
  uiInput,
  uiPageTitle,
} from '../../admin/adminTheme'
import { useServices } from '../../context/ServicesContext'
import {
  APPT_STATUSES,
  CLINIC,
  HOURS_LABEL,
  LEAD_CHANNELS,
  addMinutes,
  channelMeta,
  combineDateAndTime,
  daySlots,
  formatTime,
  isOpenDay,
  statusMeta,
  toDateKey,
  weekDaysMonFri,
} from '../../admin/clinicHours'

const SLOT_H = 48 // px por franja de 30 min

function emptyForm(defaults = {}) {
  const dateKey = defaults.dateKey || toDateKey(new Date())
  const start = defaults.startTime || '10:00'
  return {
    id: defaults.id || null,
    client_id: defaults.client_id || null,
    client_name: defaults.client_name || '',
    client_phone: defaults.client_phone || '',
    client_email: defaults.client_email || '',
    service_name: defaults.service_name || '',
    service_slug: defaults.service_slug || '',
    amount: defaults.amount ?? '',
    dateKey,
    startTime: start,
    endTime: defaults.endTime || addMinutes(combineDateAndTime(dateKey, start), 60).toTimeString().slice(0, 5),
    status: defaults.status || 'confirmed',
    channel: defaults.channel || 'whatsapp',
    notes: defaults.notes || '',
    employee: defaults.employee || CLINIC.employee,
    clientMode: defaults.client_id ? 'existing' : 'search', // search | existing | new
  }
}

export default function AdminCalendarPage() {
  const { pwd } = useOutletContext()
  const { servicesData } = useServices()
  const services = servicesData.es || []

  const [view, setView] = useState('day') // day | week
  const [anchor, setAnchor] = useState(() => {
    const d = new Date()
    if (!isOpenDay(d)) {
      // saltar a lunes siguiente si es finde
      const mon = weekDaysMonFri(d)[0]
      return mon
    }
    return d
  })
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCancelled, setShowCancelled] = useState(false)
  const [modal, setModal] = useState(null) // form object | null
  const [hoursOpen, setHoursOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [clientQuery, setClientQuery] = useState('')
  const [clientResults, setClientResults] = useState([])
  const [searchingClients, setSearchingClients] = useState(false)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const range = useMemo(() => {
    if (view === 'week') {
      const days = weekDaysMonFri(anchor)
      const from = new Date(days[0]); from.setHours(0, 0, 0, 0)
      const to = new Date(days[4]); to.setHours(23, 59, 59, 999)
      return { from, to, days }
    }
    const from = new Date(anchor); from.setHours(0, 0, 0, 0)
    const to = new Date(anchor); to.setHours(23, 59, 59, 999)
    return { from, to, days: [from] }
  }, [view, anchor])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams({
        from: range.from.toISOString(),
        to: new Date(range.to.getTime() + 1).toISOString(),
        include_cancelled: showCancelled ? 'true' : 'false',
      })
      const res = await adminFetch(`/api/admin/appointments?${q}`, pwd)
      if (res.ok) {
        const data = await res.json()
        setAppts(Array.isArray(data) ? data : [])
      } else {
        const err = await res.json().catch(() => ({}))
        setError(err.error || 'No se pudieron cargar las citas. ¿Ejecutaste el SQL de appointments en Supabase?')
      }
    } finally {
      setLoading(false)
    }
  }, [pwd, range.from, range.to, showCancelled])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!modal || modal.clientMode === 'existing') return
    if (!clientQuery.trim() || clientQuery.trim().length < 2) {
      setClientResults([])
      return
    }
    let cancelled = false
    setSearchingClients(true)
    const t = setTimeout(async () => {
      try {
        const res = await adminFetch(`/api/admin/clients?search=${encodeURIComponent(clientQuery.trim())}&limit=8`, pwd)
        if (!cancelled && res.ok) {
          const data = await res.json()
          setClientResults(Array.isArray(data) ? data.filter((c) => c.status !== 'archived') : [])
        }
      } finally {
        if (!cancelled) setSearchingClients(false)
      }
    }, 280)
    return () => { cancelled = true; clearTimeout(t) }
  }, [clientQuery, modal, pwd])

  const slots = useMemo(() => daySlots(), [])

  const goToday = () => {
    const d = new Date()
    setAnchor(isOpenDay(d) ? d : weekDaysMonFri(d)[0])
  }

  const shift = (dir) => {
    const d = new Date(anchor)
    if (view === 'week') d.setDate(d.getDate() + dir * 7)
    else {
      d.setDate(d.getDate() + dir)
      // saltar fines de semana
      while (!isOpenDay(d)) d.setDate(d.getDate() + dir)
    }
    setAnchor(d)
  }

  const openNew = (dateKey, startTime) => {
    setError('')
    setClientQuery('')
    setClientResults([])
    setModal(emptyForm({ dateKey, startTime }))
  }

  const openEdit = (appt) => {
    const start = new Date(appt.starts_at)
    const end = new Date(appt.ends_at)
    setError('')
    setClientQuery('')
    setClientResults([])
    setModal(emptyForm({
      id: appt.id,
      client_id: appt.client_id || null,
      client_name: appt.client_name,
      client_phone: appt.client_phone || '',
      client_email: appt.client_email || '',
      service_name: appt.service_name || '',
      service_slug: appt.service_slug || '',
      amount: appt.amount ?? '',
      dateKey: toDateKey(start),
      startTime: formatTime(start),
      endTime: formatTime(end),
      status: appt.status,
      channel: appt.channel,
      notes: appt.notes || '',
      employee: appt.employee || CLINIC.employee,
    }))
  }

  const pickClient = (c) => {
    setModal((m) => ({
      ...m,
      client_id: c.id,
      client_name: c.name,
      client_phone: c.phone || '',
      client_email: c.email || '',
      clientMode: 'existing',
    }))
    setClientQuery('')
    setClientResults([])
  }

  const clearClient = () => {
    setModal((m) => ({
      ...m,
      client_id: null,
      client_name: '',
      client_phone: '',
      client_email: '',
      clientMode: 'search',
    }))
    setClientQuery('')
  }

  const saveModal = async () => {
    if (!modal?.client_name?.trim()) {
      setError('Busca una clienta o crea una nueva')
      return
    }
    setSaving(true)
    setError('')
    try {
      const starts = combineDateAndTime(modal.dateKey, modal.startTime)
      const ends = combineDateAndTime(modal.dateKey, modal.endTime)
      const amountNum = modal.amount === '' || modal.amount == null ? 0 : Number(modal.amount)
      const payload = {
        client_id: modal.client_id || undefined,
        create_client: !modal.client_id,
        client_name: modal.client_name.trim(),
        client_phone: modal.client_phone,
        client_email: modal.client_email,
        service_name: modal.service_name,
        service_slug: modal.service_slug,
        amount: Number.isFinite(amountNum) ? amountNum : 0,
        starts_at: starts.toISOString(),
        ends_at: ends.toISOString(),
        status: modal.status,
        channel: modal.channel,
        notes: modal.notes,
        employee: CLINIC.employee,
      }
      const res = await adminFetch('/api/admin/appointments', pwd, {
        method: modal.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modal.id ? { id: modal.id, ...payload } : payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Error al guardar')
        return
      }
      setModal(null)
      showToast(modal.id ? 'Cita actualizada' : 'Cita creada')
      await load()
    } finally {
      setSaving(false)
    }
  }

  const cancelAppt = async () => {
    if (!modal?.id) return
    if (!window.confirm('¿Cancelar esta cita?')) return
    setSaving(true)
    try {
      const res = await adminFetch('/api/admin/appointments', pwd, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: modal.id, status: 'cancelled', client_name: modal.client_name, starts_at: combineDateAndTime(modal.dateKey, modal.startTime).toISOString(), ends_at: combineDateAndTime(modal.dateKey, modal.endTime).toISOString() }),
      })
      if (res.ok) {
        setModal(null)
        showToast('Cita cancelada')
        await load()
      }
    } finally {
      setSaving(false)
    }
  }

  const titleDate = view === 'week'
    ? (() => {
      const days = weekDaysMonFri(anchor)
      const a = days[0]; const b = days[4]
      return `${a.getDate()}–${b.getDate()} ${b.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
    })()
    : anchor.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const cancelledCount = appts.filter((a) => a.status === 'cancelled').length

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 200, background: th.pageBg,
          border: `1px solid ${th.border}`, padding: '14px 20px', fontSize: 14, borderRadius: th.radiusPill,
          boxShadow: th.shadowMd,
        }}
        >
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={uiPageTitle}>
            Calendario de reservas
          </h2>
          <p style={{ color: th.textMuted, margin: '8px 0 0', fontSize: 14 }}>
            Gestiona citas de {CLINIC.employee} · L–V {CLINIC.openHour}:00–{CLINIC.closeHour}:{String(CLINIC.closeMinute).padStart(2, '0')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" onClick={() => setHoursOpen(true)} style={btnGhost}>Horarios</button>
          <button type="button" onClick={() => openNew(toDateKey(isOpenDay(anchor) ? anchor : weekDaysMonFri(anchor)[0]), '10:00')} style={btnPrimary}>
            + Nueva reserva
          </button>
        </div>
      </div>

      {error && !modal && (
        <div style={{ marginBottom: 16, padding: 14, background: th.dangerSoft, border: '1px solid #fecaca', color: th.danger, borderRadius: th.radius, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Controles */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 16,
        padding: '14px 16px', background: th.cardBg, border: `1px solid ${th.border}`, borderRadius: th.radiusLg,
        boxShadow: th.shadow,
      }}
      >
        <button type="button" onClick={goToday} style={btnGhost}>Hoy</button>
        <button type="button" onClick={() => shift(-1)} style={btnIcon}>‹</button>
        <button type="button" onClick={() => shift(1)} style={btnIcon}>›</button>
        <strong style={{ fontSize: 15, textTransform: 'capitalize', minWidth: 200 }}>{titleDate}</strong>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[['day', 'Día'], ['week', 'Semana']].map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              style={{
                ...btnGhost,
                background: view === v ? th.text : th.pageBg,
                color: view === v ? '#fff' : th.text,
              }}
            >
              {label}
            </button>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: th.textMuted, cursor: 'pointer', marginLeft: 8 }}>
            <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} />
            Ver canceladas{cancelledCount ? ` (${cancelledCount})` : ''}
          </label>
        </div>
      </div>

      {/* Grid */}
      <div style={{ border: `1px solid ${th.border}`, borderRadius: th.radiusLg, overflow: 'hidden', background: th.cardBg, boxShadow: th.shadow }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `64px repeat(${range.days.length}, 1fr)`,
          borderBottom: `1px solid ${th.border}`,
          background: th.subtleBg,
        }}
        >
          <div />
          {range.days.map((d) => (
            <div
              key={toDateKey(d)}
              style={{
                padding: '12px 8px', textAlign: 'center', borderLeft: `1px solid ${th.border}`,
                fontSize: 12, fontWeight: 600,
              }}
            >
              <div style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: th.textMuted, fontSize: 10 }}>
                {d.toLocaleDateString('es-ES', { weekday: 'short' })}
              </div>
              <div style={{ fontSize: 18, fontFamily: th.fontDisplay, marginTop: 2 }}>{d.getDate()}</div>
              <div style={{
                marginTop: 6, display: 'inline-block', padding: '3px 10px', borderRadius: 999,
                background: '#e8dff5', color: '#5b21b6', fontSize: 10, letterSpacing: '0.06em',
              }}
              >
                {CLINIC.employee.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <p style={{ padding: 40, textAlign: 'center', color: th.textMuted }}>Cargando agenda…</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `64px repeat(${range.days.length}, 1fr)`, maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Columna horas */}
            <div>
              {slots.map((t) => (
                <div
                  key={t}
                  style={{
                    height: SLOT_H, borderBottom: `1px solid ${th.border}`,
                    fontSize: 11, color: th.textMuted, padding: '4px 6px',
                  }}
                >
                  {t}
                </div>
              ))}
            </div>

            {range.days.map((day) => {
              const key = toDateKey(day)
              const dayAppts = appts.filter((a) => toDateKey(new Date(a.starts_at)) === key)
              return (
                <div key={key} style={{ position: 'relative', borderLeft: `1px solid ${th.border}` }}>
                  {slots.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => openNew(key, t)}
                      title={`Nueva cita ${t}`}
                      style={{
                        display: 'block', width: '100%', height: SLOT_H, border: 'none',
                        borderBottom: `1px solid ${th.border}`, background: 'transparent', cursor: 'pointer', padding: 0,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fafafa' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    />
                  ))}
                  {dayAppts.map((a) => {
                    const start = new Date(a.starts_at)
                    const end = new Date(a.ends_at)
                    const openMin = CLINIC.openHour * 60 + CLINIC.openMinute
                    const startMin = start.getHours() * 60 + start.getMinutes()
                    const endMin = end.getHours() * 60 + end.getMinutes()
                    const top = ((startMin - openMin) / CLINIC.slotMinutes) * SLOT_H
                    const height = Math.max(((endMin - startMin) / CLINIC.slotMinutes) * SLOT_H - 4, 28)
                    const ch = channelMeta(a.channel)
                    const st = statusMeta(a.status)
                    const faded = a.status === 'cancelled' || a.status === 'completed'
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openEdit(a) }}
                        style={{
                          position: 'absolute', left: 4, right: 4, top: top + 2, height,
                          textAlign: 'left', border: `1px solid ${ch.color}55`,
                          background: faded ? '#f3f4f6' : `${ch.color}18`,
                          borderRadius: 12, padding: '8px 10px', cursor: 'pointer',
                          overflow: 'hidden', opacity: faded ? 0.55 : 1,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                          <strong style={{ fontSize: 12, color: th.text, lineHeight: 1.2 }}>{a.client_name}</strong>
                          <span title={ch.label} style={{ width: 8, height: 8, borderRadius: '50%', background: ch.color, flexShrink: 0, marginTop: 3 }} />
                        </div>
                        <div style={{ fontSize: 11, color: th.textMuted, marginTop: 2 }}>
                          {formatTime(start)}–{formatTime(end)}
                          {a.service_name ? ` · ${a.service_name}` : ''}
                        </div>
                        <div style={{ fontSize: 10, color: st.color, marginTop: 2 }}>{st.label} · {ch.label}</div>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p style={{ marginTop: 12, fontSize: 12, color: th.textMuted }}>
        Pulsa un hueco vacío para crear una cita. Colores = canal del lead (verde WhatsApp, azul teléfono…).
      </p>

      {hoursOpen && (
        <Modal title="Horarios del centro" onClose={() => setHoursOpen(false)}>
          <p style={{ color: th.textMuted, fontSize: 14, marginTop: 0 }}>{HOURS_LABEL.es}</p>
          <p style={{ fontSize: 13, marginBottom: 16 }}>Profesional: <strong>{CLINIC.employee}</strong></p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {HOURS_LABEL.detail.map((row) => (
              <li key={row.day} style={{
                display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                borderBottom: `1px solid ${th.border}`, fontSize: 14,
              }}
              >
                <span>{row.day}</span>
                <strong>{row.hours}</strong>
              </li>
            ))}
          </ul>
        </Modal>
      )}

      {modal && (
        <Modal title={modal.id ? 'Editar reserva' : 'Nueva reserva'} onClose={() => setModal(null)} wide>
          {error && (
            <div style={{ marginBottom: 12, padding: 10, background: '#fef2f2', color: '#991b1b', borderRadius: 4, fontSize: 13 }}>{error}</div>
          )}

          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: th.textMuted }}>Clienta *</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => { setModal({ ...modal, clientMode: 'search' }); setClientQuery('') }}
                  style={{ ...chipBtn, background: modal.clientMode !== 'new' ? th.text : '#fff', color: modal.clientMode !== 'new' ? '#fff' : th.text }}
                >
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={() => setModal({
                    ...modal, clientMode: 'new', client_id: null,
                    client_name: '', client_phone: '', client_email: '',
                  })}
                  style={{ ...chipBtn, background: modal.clientMode === 'new' ? th.text : '#fff', color: modal.clientMode === 'new' ? '#fff' : th.text }}
                >
                  Nueva
                </button>
              </div>
            </div>

            {modal.clientMode === 'existing' && modal.client_id ? (
              <div style={{
                padding: 14, background: th.subtleBg, borderRadius: 8, border: `1px solid ${th.border}`,
                display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start',
              }}
              >
                <div>
                  <strong style={{ fontSize: 15 }}>{modal.client_name}</strong>
                  <div style={{ fontSize: 12, color: th.textMuted, marginTop: 4 }}>
                    {modal.client_phone || 'Sin teléfono'}
                    {modal.client_email ? ` · ${modal.client_email}` : ''}
                  </div>
                </div>
                <button type="button" onClick={clearClient} style={{ ...chipBtn, color: '#dc2626' }}>Quitar</button>
              </div>
            ) : modal.clientMode === 'new' ? (
              <>
                <Field label="Nombre *">
                  <input value={modal.client_name} onChange={(e) => setModal({ ...modal, client_name: e.target.value })} style={inputStyle} placeholder="Nombre y apellidos" />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Teléfono">
                    <input value={modal.client_phone} onChange={(e) => setModal({ ...modal, client_phone: e.target.value })} style={inputStyle} />
                  </Field>
                  <Field label="Email">
                    <input type="email" value={modal.client_email} onChange={(e) => setModal({ ...modal, client_email: e.target.value })} style={inputStyle} />
                  </Field>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: 12, color: th.textMuted }}>
                  Se guardará en Clientas al crear la cita.
                </p>
              </>
            ) : (
              <div style={{ position: 'relative' }}>
                <input
                  value={clientQuery}
                  onChange={(e) => setClientQuery(e.target.value)}
                  style={inputStyle}
                  placeholder="Escribe nombre o teléfono para buscar…"
                  autoFocus
                />
                {searchingClients && (
                  <p style={{ fontSize: 12, color: th.textMuted, margin: '6px 0 0' }}>Buscando…</p>
                )}
                {clientResults.length > 0 && (
                  <ul style={{
                    listStyle: 'none', margin: '8px 0 0', padding: 0, border: `1px solid ${th.border}`,
                    borderRadius: 6, maxHeight: 200, overflow: 'auto',
                  }}
                  >
                    {clientResults.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => pickClient(c)}
                          style={{
                            width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none',
                            borderBottom: `1px solid ${th.border}`, background: '#fff', cursor: 'pointer',
                          }}
                        >
                          <strong style={{ fontSize: 14 }}>{c.name}</strong>
                          <div style={{ fontSize: 12, color: th.textMuted }}>
                            {c.phone || 'Sin teléfono'}
                            {c.stats?.visitCount != null ? ` · ${c.stats.visitCount} visitas` : ''}
                            {c.stats?.totalSpent != null ? ` · ${Number(c.stats.totalSpent).toFixed(0)}€` : ''}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {clientQuery.trim().length >= 2 && !searchingClients && clientResults.length === 0 && (
                  <p style={{ fontSize: 13, color: th.textMuted, margin: '8px 0 0' }}>
                    No hay resultados.{' '}
                    <button
                      type="button"
                      onClick={() => setModal({
                        ...modal, clientMode: 'new', client_id: null,
                        client_name: clientQuery.trim(), client_phone: '', client_email: '',
                      })}
                      style={{ background: 'none', border: 'none', color: th.text, textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: 13 }}
                    >
                      Crear «{clientQuery.trim()}» como nueva
                    </button>
                  </p>
                )}
              </div>
            )}
          </div>

          <Field label="Tratamiento / servicio">
            <select
              value={modal.service_slug}
              onChange={(e) => {
                const slug = e.target.value
                const svc = services.find((s) => s.slug === slug)
                const priceGuess = svc?.price ? String(svc.price).replace(/[^\d.,]/g, '').replace(',', '.') : ''
                setModal({
                  ...modal,
                  service_slug: slug,
                  service_name: svc?.name || '',
                  amount: modal.amount || (priceGuess && !Number.isNaN(Number(priceGuess)) ? priceGuess : modal.amount),
                })
              }}
              style={inputStyle}
            >
              <option value="">— Elegir tratamiento —</option>
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}{s.price ? ` (${s.price})` : ''}</option>
              ))}
            </select>
            {!modal.service_slug && (
              <input
                value={modal.service_name}
                onChange={(e) => setModal({ ...modal, service_name: e.target.value })}
                style={{ ...inputStyle, marginTop: 8 }}
                placeholder="O escribe el servicio a mano"
              />
            )}
          </Field>

          <Field label="Importe (€) — para el historial de gasto">
            <input
              type="number"
              min="0"
              step="0.01"
              value={modal.amount}
              onChange={(e) => setModal({ ...modal, amount: e.target.value })}
              style={inputStyle}
              placeholder="0"
            />
          </Field>

          <Field label="Empleada">
            <input value={CLINIC.employee} disabled style={{ ...inputStyle, background: th.subtleBg }} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 12 }}>
            <Field label="Fecha">
              <input
                type="date"
                value={modal.dateKey}
                onChange={(e) => setModal({ ...modal, dateKey: e.target.value })}
                style={inputStyle}
              />
            </Field>
            <Field label="Hora inicio">
              <select value={modal.startTime} onChange={(e) => setModal({ ...modal, startTime: e.target.value })} style={inputStyle}>
                {slots.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Hora fin">
              <select value={modal.endTime} onChange={(e) => setModal({ ...modal, endTime: e.target.value })} style={inputStyle}>
                {slots.concat([`${String(CLINIC.closeHour).padStart(2, '0')}:${String(CLINIC.closeMinute).padStart(2, '0')}`]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Estado">
              <select value={modal.status} onChange={(e) => setModal({ ...modal, status: e.target.value })} style={inputStyle}>
                {APPT_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Canal / origen del lead">
              <select value={modal.channel} onChange={(e) => setModal({ ...modal, channel: e.target.value })} style={inputStyle}>
                {LEAD_CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {LEAD_CHANNELS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setModal({ ...modal, channel: c.id })}
                style={{
                  padding: '6px 12px', borderRadius: 999, border: `1.5px solid ${modal.channel === c.id ? c.color : th.border}`,
                  background: modal.channel === c.id ? `${c.color}22` : th.pageBg,
                  color: th.text, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                {c.label}
              </button>
            ))}
          </div>

          <Field label="Notas">
            <textarea rows={3} value={modal.notes} onChange={(e) => setModal({ ...modal, notes: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Observaciones internas…" />
          </Field>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <button type="button" disabled={saving} onClick={saveModal} style={btnPrimary}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setModal(null)} style={btnGhost}>Cerrar</button>
            {modal.id && (
              <button type="button" disabled={saving} onClick={cancelAppt} style={{ ...btnGhost, color: '#dc2626', borderColor: '#fecaca', marginLeft: 'auto' }}>
                Cancelar cita
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 150,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        role="dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: th.radiusXl, width: '100%', maxWidth: wide ? 560 : 420,
          maxHeight: '90vh', overflow: 'auto', padding: 28, boxShadow: th.shadowLg,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontFamily: th.fontDisplay, fontWeight: 500, fontSize: '1.35rem' }}>{title}</h3>
          <button type="button" onClick={onClose} style={{ ...btnGhost, padding: '6px 10px' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={{ display: 'block', fontSize: 12, color: th.textMuted, marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  )
}

const inputStyle = { ...uiInput, borderRadius: th.radiusSm }
const btnPrimary = uiBtnPrimary
const btnGhost = uiBtnGhost
const btnIcon = {
  ...btnGhost, width: 40, height: 40, padding: 0, fontSize: 18, lineHeight: 1,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}
const chipBtn = {
  padding: '6px 12px', border: `1px solid ${th.borderStrong}`, borderRadius: th.radiusPill,
  cursor: 'pointer', fontSize: 11, background: '#fff', fontWeight: 600,
}
