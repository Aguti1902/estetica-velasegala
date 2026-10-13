import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { adminFetch } from '../../admin/useAdminAuth'
import { adminTheme as th } from '../../admin/adminTheme'
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
    client_name: defaults.client_name || '',
    client_phone: defaults.client_phone || '',
    client_email: defaults.client_email || '',
    service_name: defaults.service_name || '',
    service_slug: defaults.service_slug || '',
    dateKey,
    startTime: start,
    endTime: defaults.endTime || addMinutes(combineDateAndTime(dateKey, start), 60).toTimeString().slice(0, 5),
    status: defaults.status || 'confirmed',
    channel: defaults.channel || 'whatsapp',
    notes: defaults.notes || '',
    employee: defaults.employee || CLINIC.employee,
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
    setModal(emptyForm({ dateKey, startTime }))
  }

  const openEdit = (appt) => {
    const start = new Date(appt.starts_at)
    const end = new Date(appt.ends_at)
    setError('')
    setModal(emptyForm({
      id: appt.id,
      client_name: appt.client_name,
      client_phone: appt.client_phone || '',
      client_email: appt.client_email || '',
      service_name: appt.service_name || '',
      service_slug: appt.service_slug || '',
      dateKey: toDateKey(start),
      startTime: formatTime(start),
      endTime: formatTime(end),
      status: appt.status,
      channel: appt.channel,
      notes: appt.notes || '',
      employee: appt.employee || CLINIC.employee,
    }))
  }

  const saveModal = async () => {
    if (!modal?.client_name?.trim()) {
      setError('Indica el nombre de la clienta')
      return
    }
    setSaving(true)
    setError('')
    try {
      const starts = combineDateAndTime(modal.dateKey, modal.startTime)
      const ends = combineDateAndTime(modal.dateKey, modal.endTime)
      const payload = {
        client_name: modal.client_name.trim(),
        client_phone: modal.client_phone,
        client_email: modal.client_email,
        service_name: modal.service_name,
        service_slug: modal.service_slug,
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
          border: `1px solid ${th.text}`, padding: '12px 18px', fontSize: 14, borderRadius: 6,
        }}
        >
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '1.75rem', margin: 0, color: th.text }}>
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
        <div style={{ marginBottom: 16, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 6, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Controles */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 16,
        padding: '12px 14px', background: th.subtleBg, border: `1px solid ${th.border}`, borderRadius: 8,
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
      <div style={{ border: `1px solid ${th.border}`, borderRadius: 8, overflow: 'hidden', background: th.pageBg }}>
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
              <div style={{ fontSize: 18, fontFamily: 'Georgia, serif', marginTop: 2 }}>{d.getDate()}</div>
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
                          borderRadius: 6, padding: '6px 8px', cursor: 'pointer',
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

          <Field label="Nombre de la clienta *">
            <input value={modal.client_name} onChange={(e) => setModal({ ...modal, client_name: e.target.value })} style={inputStyle} placeholder="Nombre y apellidos" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Teléfono">
              <input value={modal.client_phone} onChange={(e) => setModal({ ...modal, client_phone: e.target.value })} style={inputStyle} placeholder="600 000 000" />
            </Field>
            <Field label="Email">
              <input type="email" value={modal.client_email} onChange={(e) => setModal({ ...modal, client_email: e.target.value })} style={inputStyle} />
            </Field>
          </div>

          <Field label="Tratamiento / servicio">
            <select
              value={modal.service_slug}
              onChange={(e) => {
                const slug = e.target.value
                const svc = services.find((s) => s.slug === slug)
                setModal({
                  ...modal,
                  service_slug: slug,
                  service_name: svc?.name || '',
                })
              }}
              style={inputStyle}
            >
              <option value="">— Elegir tratamiento —</option>
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
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
          background: '#fff', borderRadius: 10, width: '100%', maxWidth: wide ? 560 : 420,
          maxHeight: '90vh', overflow: 'auto', padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '1.35rem' }}>{title}</h3>
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

const inputStyle = {
  width: '100%', padding: '10px 12px', border: `1px solid ${th.border}`, borderRadius: 6,
  fontSize: 14, boxSizing: 'border-box', background: '#fff', color: th.text,
}

const btnPrimary = {
  padding: '11px 18px', background: th.text, color: '#fff', border: 'none', borderRadius: 6,
  cursor: 'pointer', fontSize: 13, fontWeight: 600,
}
const btnGhost = {
  padding: '10px 14px', background: '#fff', border: `1px solid ${th.border}`, borderRadius: 6,
  cursor: 'pointer', fontSize: 13, color: th.text,
}
const btnIcon = {
  ...btnGhost, width: 36, padding: '8px 0', fontSize: 18, lineHeight: 1,
}
