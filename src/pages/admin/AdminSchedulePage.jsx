import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { adminFetch } from '../../admin/useAdminAuth'
import {
  adminTheme as t,
  uiCard,
  uiPageTitle,
  uiBtnPrimary,
  uiBtnGhost,
  uiInput,
} from '../../admin/adminTheme'
import { WEEKDAYS, defaultSchedule, normalizeSchedule } from '../../admin/clinicHours'

function newBreak() {
  return {
    id: `b-${Date.now()}`,
    label: 'Descanso',
    days: [1, 2, 3, 4, 5],
    start: '14:00',
    end: '15:00',
  }
}

export default function AdminSchedulePage() {
  const { pwd } = useOutletContext()
  const [schedule, setSchedule] = useState(() => defaultSchedule())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminFetch('/api/admin/schedule', pwd)
      if (res.ok) setSchedule(normalizeSchedule(await res.json()))
      else setError('No se pudo cargar el horario')
    } finally {
      setLoading(false)
    }
  }, [pwd])

  useEffect(() => { load() }, [load])

  const setDay = (id, patch) => {
    setSchedule((s) => ({
      ...s,
      days: { ...s.days, [id]: { ...s.days[id], ...patch } },
    }))
  }

  const setBreak = (id, patch) => {
    setSchedule((s) => ({
      ...s,
      breaks: s.breaks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }))
  }

  const toggleBreakDay = (id, day) => {
    setSchedule((s) => ({
      ...s,
      breaks: s.breaks.map((b) => {
        if (b.id !== id) return b
        const has = b.days.includes(day)
        return { ...b, days: has ? b.days.filter((d) => d !== day) : [...b.days, day] }
      }),
    }))
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await adminFetch('/api/admin/schedule', pwd, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule }),
      })
      if (res.ok) {
        setToast('Horario guardado')
        setTimeout(() => setToast(''), 2500)
      } else {
        const err = await res.json().catch(() => ({}))
        setError(err.error || 'No se pudo guardar')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 18, alignItems: 'flex-end' }}>
        <div>
          <p style={kicker}>Natalia</p>
          <h2 style={uiPageTitle}>Horario y descansos</h2>
          <p style={{ color: t.textMuted, margin: '6px 0 0', fontSize: 14 }}>
            Define los días de apertura y los huecos en los que no se pueden reservar citas.
          </p>
        </div>
        <button type="button" onClick={save} disabled={saving || loading} style={uiBtnPrimary}>
          {saving ? 'Guardando…' : 'Guardar horario'}
        </button>
      </div>

      {toast && <p style={toastStyle}>{toast}</p>}
      {error && <p style={errorStyle}>{error}</p>}

      <section style={{ ...uiCard({ padding: 8 }), marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px 8px' }}>
          <h3 style={h3}>Semana</h3>
          <p style={sub}>Activa cada día y marca la hora de entrada y de salida.</p>
        </div>
        {loading ? (
          <p style={{ padding: 20, color: t.textMuted }}>Cargando…</p>
        ) : (
          WEEKDAYS.map((w) => {
            const d = schedule.days[w.id]
            return (
              <div key={w.id} style={dayRow}>
                <button
                  type="button"
                  onClick={() => setDay(w.id, { open: !d.open })}
                  style={{
                    ...uiBtnGhost,
                    minWidth: 92,
                    background: d.open ? t.text : '#fff',
                    color: d.open ? '#fff' : t.textMuted,
                  }}
                >
                  {d.open ? 'Abierto' : 'Cerrado'}
                </button>
                <strong style={{ width: 110, fontSize: 15 }}>{w.label}</strong>
                <label style={timeLabel}>
                  Desde
                  <input type="time" value={d.start} disabled={!d.open} onChange={(e) => setDay(w.id, { start: e.target.value })} style={timeInput} />
                </label>
                <label style={timeLabel}>
                  Hasta
                  <input type="time" value={d.end} disabled={!d.open} onChange={(e) => setDay(w.id, { end: e.target.value })} style={timeInput} />
                </label>
              </div>
            )
          })
        )}
      </section>

      <section style={uiCard({ padding: 20 })}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          <div>
            <h3 style={h3}>Descansos</h3>
            <p style={sub}>Comida, pausas u otros bloqueos. Se pintan en la agenda y no admiten citas nuevas.</p>
          </div>
          <button type="button" onClick={() => setSchedule((s) => ({ ...s, breaks: [...s.breaks, newBreak()] }))} style={uiBtnGhost}>
            + Descanso
          </button>
        </div>

        {schedule.breaks.length === 0 && (
          <p style={{ color: t.textMuted, fontSize: 14 }}>Sin descansos. Añade uno si Natalia para a comer u otra pausa.</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {schedule.breaks.map((b) => (
            <div key={b.id} style={{ padding: 16, borderRadius: t.radiusLg, background: t.subtleBg, border: `1px solid ${t.border}` }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <input
                  value={b.label}
                  onChange={(e) => setBreak(b.id, { label: e.target.value })}
                  style={{ ...uiInput, maxWidth: 220 }}
                  placeholder="Nombre"
                />
                <label style={timeLabel}>
                  Desde
                  <input type="time" value={b.start} onChange={(e) => setBreak(b.id, { start: e.target.value })} style={timeInput} />
                </label>
                <label style={timeLabel}>
                  Hasta
                  <input type="time" value={b.end} onChange={(e) => setBreak(b.id, { end: e.target.value })} style={timeInput} />
                </label>
                <button
                  type="button"
                  onClick={() => setSchedule((s) => ({ ...s, breaks: s.breaks.filter((x) => x.id !== b.id) }))}
                  style={{ ...uiBtnGhost, marginLeft: 'auto', color: t.danger, borderColor: '#fecaca' }}
                >
                  Quitar
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {WEEKDAYS.map((w) => {
                  const on = b.days.includes(w.id)
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => toggleBreakDay(b.id, w.id)}
                      style={{
                        ...uiBtnGhost,
                        background: on ? t.accentSoft : '#fff',
                        borderColor: on ? t.accent : t.borderStrong,
                        color: on ? t.accentDark : t.textMuted,
                      }}
                    >
                      {w.short}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const kicker = {
  margin: '0 0 6px',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: t.accentDark,
}
const h3 = { margin: 0, fontFamily: t.fontDisplay, fontWeight: 500, fontSize: '1.25rem' }
const sub = { margin: '4px 0 0', color: t.textMuted, fontSize: 13 }
const dayRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  alignItems: 'center',
  padding: '14px 18px',
  borderTop: `1px solid ${t.border}`,
}
const timeLabel = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: t.textMuted, fontWeight: 650 }
const timeInput = { ...uiInput, width: 'auto', padding: '8px 10px' }
const toastStyle = {
  margin: '0 0 12px',
  padding: '10px 14px',
  borderRadius: t.radiusPill,
  background: t.successSoft,
  color: t.success,
  fontWeight: 650,
  fontSize: 13,
}
const errorStyle = {
  margin: '0 0 12px',
  padding: '10px 14px',
  borderRadius: t.radius,
  background: t.dangerSoft,
  color: t.danger,
  fontSize: 13,
}
