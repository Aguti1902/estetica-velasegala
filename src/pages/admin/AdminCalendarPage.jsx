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
  LEAD_CHANNELS,
  addMinutes,
  channelMeta,
  combineDateAndTime,
  formatTime,
  breaksForDate,
  defaultSchedule,
  gridBounds,
  isScheduledOpen,
  normalizeSchedule,
  parseDateKey,
  parseServiceDurationMinutes,
  parseServicePrice,
  scheduleSummary,
  slotsBetween,
  statusMeta,
  timeToMinutes,
  toDateKey,
  weekDaysForSchedule,
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
    clientMode: defaults.client_id ? 'existing' : 'search',
  }
}

function minutesFromOpen(date, gridStart) {
  return date.getHours() * 60 + date.getMinutes() - gridStart
}

export default function AdminCalendarPage() {
  const { pwd } = useOutletContext()
  const { servicesData } = useServices()
  const services = servicesData.es || []

  const [view, setView] = useState('day')
  const [schedule, setSchedule] = useState(() => defaultSchedule())
  const [anchor, setAnchor] = useState(() => new Date())
  const [appts, setAppts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCancelled, setShowCancelled] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')
  const [modal, setModal] = useState(null)
  const [hoursOpen, setHoursOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [clientQuery, setClientQuery] = useState('')
  const [clientResults, setClientResults] = useState([])
  const [searchingClients, setSearchingClients] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const [draggingId, setDraggingId] = useState(null)
  const [dragOver, setDragOver] = useState(null) // { dateKey, time }
  const [moving, setMoving] = useState(false)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const range = useMemo(() => {
    if (view === 'week') {
      const days = weekDaysForSchedule(anchor, schedule)
      const from = new Date(days[0]); from.setHours(0, 0, 0, 0)
      const to = new Date(days[days.length - 1]); to.setHours(23, 59, 59, 999)
      return { from, to, days }
    }
    const from = new Date(anchor); from.setHours(0, 0, 0, 0)
    const to = new Date(anchor); to.setHours(23, 59, 59, 999)
    return { from, to, days: [from] }
  }, [view, anchor, schedule])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams({
        from: range.from.toISOString(),
        to: new Date(range.to.getTime() + 1).toISOString(),
        include_cancelled: (showCancelled || statusFilter === 'cancelled' || statusFilter === 'all') ? 'true' : 'false',
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
  }, [pwd, range.from, range.to, showCancelled, statusFilter])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    let cancelled = false
    adminFetch('/api/admin/schedule', pwd).then(async (res) => {
      if (!cancelled && res.ok) setSchedule(normalizeSchedule(await res.json()))
    }).catch(() => {})
    return () => { cancelled = true }
  }, [pwd])

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

  const bounds = useMemo(() => gridBounds(schedule), [schedule])
  const slots = useMemo(() => slotsBetween(bounds.start, bounds.end, bounds.slot), [bounds])
  const closeTime = `${String(Math.floor(bounds.end / 60)).padStart(2, '0')}:${String(bounds.end % 60).padStart(2, '0')}`

  const goToday = () => setAnchor(new Date())

  const shift = (dir) => {
    const d = new Date(anchor)
    d.setDate(d.getDate() + (view === 'week' ? dir * 7 : dir))
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

  const applyService = (slug) => {
    const svc = services.find((s) => s.slug === slug)
    if (!svc) {
      setModal((m) => ({ ...m, service_slug: '', service_name: m.service_name }))
      return
    }
    const price = parseServicePrice(svc.price)
    const mins = parseServiceDurationMinutes(svc.duration, 60)
    setModal((m) => {
      const start = combineDateAndTime(m.dateKey, m.startTime)
      const end = addMinutes(start, mins)
      const endStr = formatTime(end)
      const closeMin = bounds.end
      const endMin = end.getHours() * 60 + end.getMinutes()
      return {
        ...m,
        service_slug: slug,
        service_name: svc.name || '',
        amount: price !== '' ? price : m.amount,
        endTime: endMin > closeMin ? closeTime : endStr,
      }
    })
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

  const setApptStatus = async (appt, status) => {
    const labels = {
      completed: 'marcada como completada',
      no_show: 'marcada como no asistida',
      cancelled: 'cancelada',
      confirmed: 'confirmada de nuevo',
      pending: 'marcada como pendiente',
    }
    if (status === 'cancelled' && !window.confirm('¿Cancelar esta cita?')) return
    setSaving(true)
    try {
      const res = await adminFetch('/api/admin/appointments', pwd, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appt.id, status }),
      })
      if (res.ok) {
        if (modal?.id === appt.id) setModal(null)
        showToast(`Cita ${labels[status] || 'actualizada'}`)
        await load()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || 'No se pudo actualizar el estado')
      }
    } finally {
      setSaving(false)
    }
  }

  const moveAppointment = async (appt, dateKey, startTime) => {
    const start = combineDateAndTime(dateKey, startTime)
    const duration = Math.max(
      bounds.slot,
      (new Date(appt.ends_at) - new Date(appt.starts_at)) / 60000,
    )
    let end = addMinutes(start, duration)
    const close = combineDateAndTime(dateKey, closeTime)
    if (end > close) end = close
    if (end <= start) {
      showToast('No cabe en el horario de cierre')
      return
    }
    setMoving(true)
    // Optimistic
    setAppts((prev) => prev.map((a) => (
      a.id === appt.id
        ? { ...a, starts_at: start.toISOString(), ends_at: end.toISOString() }
        : a
    )))
    try {
      const res = await adminFetch('/api/admin/appointments', pwd, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appt.id,
          starts_at: start.toISOString(),
          ends_at: end.toISOString(),
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || 'No se pudo mover la cita')
        await load()
      } else {
        showToast(`Movida a ${dateKey} ${startTime}`)
      }
    } finally {
      setMoving(false)
      setDraggingId(null)
      setDragOver(null)
    }
  }

  const titleDate = view === 'week'
    ? (() => {
      const days = range.days
      const a = days[0]; const b = days[days.length - 1]
      return `${a.getDate()}–${b.getDate()} ${b.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
    })()
    : anchor.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const cancelledCount = appts.filter((a) => a.status === 'cancelled').length
  const todayKey = toDateKey(now)
  const openMin = bounds.start
  const closeMin = bounds.end
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const nowTop = ((nowMin - openMin) / bounds.slot) * SLOT_H
  const showNowLine = nowMin >= openMin && nowMin <= closeMin

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 200, background: '#fff',
          border: `1px solid ${th.border}`, padding: '10px 16px', fontSize: 13, borderRadius: th.radiusPill,
          boxShadow: th.shadowMd,
        }}
        >
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={uiPageTitle}>Calendario de reservas</h2>
          <p style={{ color: th.textMuted, margin: '6px 0 0', fontSize: 13.5 }}>
            {schedule.employee} · horario configurable
            {' · '}Arrastra citas para moverlas
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" onClick={() => setHoursOpen(true)} style={btnGhost}>Horario</button>
          <button
            type="button"
            onClick={() => openNew(toDateKey(anchor), slots[0] || '10:00')}
            style={btnPrimary}
          >
            + Nueva reserva
          </button>
        </div>
      </div>

      {error && !modal && (
        <div style={{ marginBottom: 12, padding: 12, background: th.dangerSoft, border: '1px solid #fecaca', color: th.danger, borderRadius: th.radius, fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 10,
        padding: '10px 12px', background: th.cardBg, border: `1px solid ${th.border}`, borderRadius: th.radiusLg,
        boxShadow: th.shadow,
      }}
      >
        <button type="button" onClick={goToday} style={btnGhost}>Hoy</button>
        <button type="button" onClick={() => shift(-1)} style={btnIcon}>‹</button>
        <button type="button" onClick={() => shift(1)} style={btnIcon}>›</button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: th.textMuted }}>
          Ir a
          <input
            type="date"
            value={toDateKey(anchor)}
            onChange={(e) => {
              if (!e.target.value) return
              const d = parseDateKey(e.target.value)
              setAnchor(d)
            }}
            style={{ ...inputStyle, width: 'auto', padding: '6px 10px', fontSize: 12.5 }}
          />
        </label>
        <strong style={{ fontSize: 14, textTransform: 'capitalize', minWidth: 160 }}>{titleDate}</strong>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {[['day', 'Día'], ['week', 'Semana']].map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              style={{
                ...btnGhost,
                background: view === v ? th.text : '#fff',
                color: view === v ? '#fff' : th.text,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12,
        padding: '10px 12px', background: th.subtleBg, border: `1px solid ${th.border}`, borderRadius: th.radiusLg,
      }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: th.textMuted }}>
          Filtros
        </span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: th.textMuted }}>
          Estado
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...inputStyle, width: 'auto', padding: '6px 10px', fontSize: 12.5 }}
          >
            <option value="all">Todos</option>
            {APPT_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: th.textMuted }}>
          Canal
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            style={{ ...inputStyle, width: 'auto', padding: '6px 10px', fontSize: 12.5 }}
          >
            <option value="all">Todos</option>
            {LEAD_CHANNELS.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: th.textMuted, cursor: 'pointer', marginLeft: 'auto' }}>
          <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} />
          Incluir canceladas{cancelledCount ? ` (${cancelledCount})` : ''}
        </label>
      </div>

      <div style={{ border: `1px solid ${th.border}`, borderRadius: th.radiusLg, overflow: 'hidden', background: th.cardBg, boxShadow: th.shadow }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `56px repeat(${range.days.length}, 1fr)`,
          borderBottom: `1px solid ${th.border}`,
          background: th.subtleBg,
        }}
        >
          <div />
          {range.days.map((d) => (
            <div
              key={toDateKey(d)}
              style={{
                padding: '10px 6px', textAlign: 'center', borderLeft: `1px solid ${th.border}`,
                fontSize: 12, fontWeight: 600,
                background: toDateKey(d) === todayKey ? th.accentSoft : 'transparent',
              }}
            >
              <div style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: th.textMuted, fontSize: 10 }}>
                {d.toLocaleDateString('es-ES', { weekday: 'short' })}
              </div>
              <div style={{ fontSize: 17, fontFamily: th.fontDisplay, marginTop: 2 }}>{d.getDate()}</div>
              <div style={{
                marginTop: 4, display: 'inline-block', padding: '2px 8px', borderRadius: 999,
                background: th.accentSoft, color: th.accentDark, fontSize: 9, letterSpacing: '0.06em', fontWeight: 700,
              }}
              >
                {(schedule.employee || 'Natalia').toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <p style={{ padding: 40, textAlign: 'center', color: th.textMuted }}>Cargando agenda…</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `56px repeat(${range.days.length}, 1fr)`, maxHeight: '70vh', overflowY: 'auto' }}>
            <div>
              {slots.map((t) => (
                <div
                  key={t}
                  style={{
                    height: SLOT_H, borderBottom: `1px solid ${th.border}`,
                    fontSize: 11, color: th.textMuted, padding: '4px 4px',
                  }}
                >
                  {t}
                </div>
              ))}
            </div>

            {range.days.map((day) => {
              const key = toDateKey(day)
              const dayAppts = appts.filter((a) => {
                if (toDateKey(new Date(a.starts_at)) !== key) return false
                if (!showCancelled && a.status === 'cancelled' && statusFilter !== 'cancelled') return false
                if (statusFilter !== 'all' && a.status !== statusFilter) return false
                if (channelFilter !== 'all' && a.channel !== channelFilter) return false
                return true
              })
              const isToday = key === todayKey
              const dayCfg = schedule.days[day.getDay()] || { open: false, start: '09:00', end: '20:30' }
              const dayBreaks = breaksForDate(schedule, day)
              const dayStart = timeToMinutes(dayCfg.start)
              const dayEnd = timeToMinutes(dayCfg.end)
              return (
                <div
                  key={key}
                  style={{ position: 'relative', borderLeft: `1px solid ${th.border}` }}
                  onDragOver={(e) => {
                    if (!draggingId) return
                    e.preventDefault()
                  }}
                >
                  {slots.map((t) => {
                    const isOver = dragOver?.dateKey === key && dragOver?.time === t
                    const slotMin = timeToMinutes(t)
                    const blocked = !dayCfg.open || slotMin < dayStart || slotMin >= dayEnd
                      || dayBreaks.some((b) => slotMin >= timeToMinutes(b.start) && slotMin < timeToMinutes(b.end))
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { if (!draggingId && !blocked) openNew(key, t) }}
                        title={blocked ? 'Fuera de horario o descanso' : `Nueva cita ${t}`}
                        onDragOver={(e) => {
                          if (!draggingId) return
                          e.preventDefault()
                          e.dataTransfer.dropEffect = 'move'
                          setDragOver({ dateKey: key, time: t })
                        }}
                        onDragLeave={() => {
                          setDragOver((cur) => (cur?.dateKey === key && cur?.time === t ? null : cur))
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          const id = e.dataTransfer.getData('text/appt-id') || draggingId
                          const appt = appts.find((a) => a.id === id)
                          setDragOver(null)
                          setDraggingId(null)
                          if (appt) moveAppointment(appt, key, t)
                        }}
                        style={{
                          display: 'block', width: '100%', height: SLOT_H, border: 'none',
                          borderBottom: `1px solid ${th.border}`,
                          background: blocked ? 'repeating-linear-gradient(135deg, #f6f3ef, #f6f3ef 6px, #efeae4 6px, #efeae4 12px)' : isOver ? th.accentSoft : 'transparent',
                          cursor: blocked ? 'not-allowed' : 'pointer', padding: 0,
                        }}
                      />
                    )
                  })}

                  {dayCfg.open && dayBreaks.map((b) => {
                    const top = ((timeToMinutes(b.start) - openMin) / bounds.slot) * SLOT_H
                    const height = Math.max(((timeToMinutes(b.end) - timeToMinutes(b.start)) / bounds.slot) * SLOT_H - 2, 20)
                    return (
                      <div
                        key={b.id}
                        style={{
                          position: 'absolute', left: 4, right: 4, top: top + 1, height,
                          borderRadius: 10,
                          background: 'rgba(120,113,108,0.14)',
                          border: '1px dashed #a8a29e',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: '#57534e',
                          pointerEvents: 'none', zIndex: 3,
                        }}
                      >
                        {b.label}
                      </div>
                    )
                  })}

                  {isToday && showNowLine && (
                    <div
                      aria-hidden
                      style={{
                        position: 'absolute', left: 0, right: 0, top: nowTop,
                        zIndex: 5, pointerEvents: 'none',
                      }}
                    >
                      <div style={{
                        position: 'absolute', left: -5, top: -5,
                        width: 10, height: 10, borderRadius: '50%', background: '#ef4444',
                        boxShadow: '0 0 0 3px rgba(239,68,68,0.2)',
                      }}
                      />
                      <div style={{ height: 2, background: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.45)' }} />
                      <span style={{
                        position: 'absolute', right: 4, top: -14,
                        fontSize: 10, fontWeight: 700, color: '#ef4444',
                        background: '#fff', padding: '1px 6px', borderRadius: 999,
                      }}
                      >
                        {formatTime(now)}
                      </span>
                    </div>
                  )}

                  {dayAppts.map((a) => {
                    const start = new Date(a.starts_at)
                    const end = new Date(a.ends_at)
                    const top = (minutesFromOpen(start, openMin) / bounds.slot) * SLOT_H
                    const height = Math.max(((end - start) / 60000 / bounds.slot) * SLOT_H - 4, 36)
                    const ch = channelMeta(a.channel)
                    const st = statusMeta(a.status)
                    const faded = a.status === 'cancelled' || a.status === 'completed' || a.status === 'no_show'
                    const showLabels = height >= 96
                    const canAct = a.status !== 'cancelled'
                    const isDragging = draggingId === a.id

                    return (
                      <div
                        key={a.id}
                        draggable={canAct && !moving}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/appt-id', a.id)
                          e.dataTransfer.effectAllowed = 'move'
                          setDraggingId(a.id)
                        }}
                        onDragEnd={() => {
                          setDraggingId(null)
                          setDragOver(null)
                        }}
                        style={{
                          position: 'absolute', left: 3, right: 3, top: top + 2, height,
                          textAlign: 'left', border: `1.5px solid ${isDragging ? th.accent : `${ch.color}66`}`,
                          background: faded ? '#f3f4f6' : `${ch.color}1a`,
                          borderRadius: 12, padding: '6px 8px',
                          overflow: 'hidden', opacity: isDragging ? 0.45 : faded ? 0.7 : 1,
                          zIndex: isDragging ? 6 : 2,
                          cursor: canAct ? 'grab' : 'default',
                          display: 'flex', flexDirection: 'column', gap: 4,
                          boxShadow: isDragging ? th.shadowMd : 'none',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => openEdit(a)}
                          style={{
                            background: 'none', border: 'none', padding: 0, margin: 0,
                            textAlign: 'left', cursor: 'pointer', color: 'inherit', flex: 1, minHeight: 0,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                            <strong style={{ fontSize: 12, color: th.text, lineHeight: 1.2 }}>{a.client_name}</strong>
                            <span title={ch.label} style={{ width: 8, height: 8, borderRadius: '50%', background: ch.color, flexShrink: 0, marginTop: 3 }} />
                          </div>
                          <div style={{ fontSize: 10.5, color: th.textMuted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {formatTime(start)}–{formatTime(end)}
                            {a.service_name ? ` · ${a.service_name}` : ''}
                            {a.amount ? ` · ${Number(a.amount).toFixed(0)}€` : ''}
                          </div>
                          <div style={{ fontSize: 10, color: st.color, marginTop: 1, fontWeight: 650 }}>{st.label}</div>
                        </button>

                        {canAct && (
                          <div
                            style={{
                              display: 'flex', gap: 3, flexWrap: 'wrap',
                              marginTop: 'auto',
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            {a.status !== 'completed' && (
                              <ActionChip
                                title="Completada"
                                label={showLabels ? 'Completada' : '✓'}
                                color="#0f766e"
                                disabled={saving || moving}
                                onClick={() => setApptStatus(a, 'completed')}
                              />
                            )}
                            {a.status !== 'no_show' && (
                              <ActionChip
                                title="No ha asistido"
                                label={showLabels ? 'No vino' : '∅'}
                                color="#b45309"
                                disabled={saving || moving}
                                onClick={() => setApptStatus(a, 'no_show')}
                              />
                            )}
                            <ActionChip
                              title="Cancelar"
                              label={showLabels ? 'Cancelar' : '✕'}
                              color="#dc2626"
                              disabled={saving || moving}
                              onClick={() => setApptStatus(a, 'cancelled')}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p style={{ marginTop: 10, fontSize: 12, color: th.textMuted }}>
        Pulsa un hueco para crear · Arrastra una cita para moverla · La línea roja marca la hora actual
      </p>

      {hoursOpen && (
        <Modal title="Horario de Natalia" onClose={() => setHoursOpen(false)}>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px' }}>
            {scheduleSummary(schedule).map((row) => (
              <li key={row.id} style={{
                display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0',
                borderBottom: `1px solid ${th.border}`, fontSize: 14,
              }}
              >
                <span>{row.label}</span>
                <span style={{ textAlign: 'right' }}>
                  <strong>{row.hours}</strong>
                  {row.breaks.length > 0 && (
                    <div style={{ fontSize: 12, color: th.textMuted, fontWeight: 500 }}>{row.breaks.join(' · ')}</div>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <a href="/admin/horario" style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-block' }}>
            Editar horario y descansos
          </a>
        </Modal>
      )}

      {modal && (
        <Modal title={modal.id ? 'Editar reserva' : 'Nueva reserva'} onClose={() => setModal(null)} wide>
          {error && (
            <div style={{ marginBottom: 12, padding: 10, background: '#fef2f2', color: '#991b1b', borderRadius: 8, fontSize: 13 }}>{error}</div>
          )}

          {modal.id && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16,
              padding: 12, background: th.subtleBg, borderRadius: th.radius, border: `1px solid ${th.border}`,
            }}
            >
              <span style={{ width: '100%', fontSize: 11, fontWeight: 700, color: th.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
                Acciones rápidas
              </span>
              <button type="button" disabled={saving} onClick={() => setApptStatus(modal, 'completed')} style={{ ...btnGhost, color: '#0f766e', borderColor: '#99f6e4' }}>
                ✓ Completada
              </button>
              <button type="button" disabled={saving} onClick={() => setApptStatus(modal, 'no_show')} style={{ ...btnGhost, color: '#b45309', borderColor: '#fcd34d' }}>
                ∅ No ha asistido
              </button>
              <button type="button" disabled={saving} onClick={() => setApptStatus(modal, 'confirmed')} style={btnGhost}>
                Confirmar
              </button>
              <button type="button" disabled={saving} onClick={() => setApptStatus(modal, 'cancelled')} style={{ ...btnGhost, color: '#dc2626', borderColor: '#fecaca' }}>
                Cancelar cita
              </button>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
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
                padding: 12, background: th.subtleBg, borderRadius: th.radius, border: `1px solid ${th.border}`,
                display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start',
              }}
              >
                <div>
                  <strong style={{ fontSize: 14 }}>{modal.client_name}</strong>
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
                    borderRadius: th.radius, maxHeight: 200, overflow: 'auto',
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
              onChange={(e) => applyService(e.target.value)}
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
            <p style={{ margin: '6px 0 0', fontSize: 11.5, color: th.textMuted }}>
              Al elegir un tratamiento se rellenan precio y duración automáticamente.
            </p>
          </Field>

          <Field label="Importe (€)">
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
            <input value={schedule.employee || CLINIC.employee} disabled style={{ ...inputStyle, background: th.subtleBg }} />
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
                {slots.concat([closeTime]).map((t) => (
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
            <Field label="Canal / origen">
              <select value={modal.channel} onChange={(e) => setModal({ ...modal, channel: e.target.value })} style={inputStyle}>
                {LEAD_CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {LEAD_CHANNELS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setModal({ ...modal, channel: c.id })}
                style={{
                  padding: '5px 10px', borderRadius: 999, border: `1.5px solid ${modal.channel === c.id ? c.color : th.border}`,
                  background: modal.channel === c.id ? `${c.color}22` : '#fff',
                  color: th.text, fontSize: 11.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.color }} />
                {c.label}
              </button>
            ))}
          </div>

          <Field label="Notas">
            <textarea rows={3} value={modal.notes} onChange={(e) => setModal({ ...modal, notes: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Observaciones internas…" />
          </Field>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            <button type="button" disabled={saving} onClick={saveModal} style={btnPrimary}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <button type="button" onClick={() => setModal(null)} style={btnGhost}>Cerrar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function ActionChip({ label, title, color, onClick, disabled }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      style={{
        padding: '2px 7px',
        fontSize: 10,
        fontWeight: 700,
        borderRadius: 999,
        border: `1px solid ${color}55`,
        background: '#fff',
        color,
        cursor: disabled ? 'wait' : 'pointer',
        lineHeight: 1.3,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
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
          maxHeight: '90vh', overflow: 'auto', padding: 24, boxShadow: th.shadowLg,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontFamily: th.fontDisplay, fontWeight: 500, fontSize: '1.25rem' }}>{title}</h3>
          <button type="button" onClick={onClose} style={{ ...btnGhost, padding: '4px 10px' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ display: 'block', fontSize: 12, color: th.textMuted, marginBottom: 5, fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  )
}

const inputStyle = { ...uiInput, borderRadius: th.radiusSm, padding: '10px 12px' }
const btnPrimary = uiBtnPrimary
const btnGhost = uiBtnGhost
const btnIcon = {
  ...btnGhost, width: 32, height: 32, padding: 0, fontSize: 16, lineHeight: 1,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}
const chipBtn = {
  padding: '4px 10px', border: `1px solid ${th.borderStrong}`, borderRadius: th.radiusPill,
  cursor: 'pointer', fontSize: 11, background: '#fff', fontWeight: 600,
}
