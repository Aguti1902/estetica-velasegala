/** Horario del centro — Estetica Segala (Viladecans) */
export const CLINIC = {
  employee: 'Natalia',
  timezone: 'Europe/Madrid',
  /** 0=domingo … 6=sábado — solo L–V */
  openDays: [1, 2, 3, 4, 5],
  openHour: 9,
  openMinute: 0,
  closeHour: 20,
  closeMinute: 30,
  slotMinutes: 30,
}

export const LEAD_CHANNELS = [
  { id: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
  { id: 'phone', label: 'Teléfono', color: '#3b82f6' },
  { id: 'web', label: 'Web / formulario', color: '#0d0d0d' },
  { id: 'instagram', label: 'Instagram', color: '#E1306C' },
  { id: 'walkin', label: 'Presencial', color: '#c9a882' },
  { id: 'other', label: 'Otro', color: '#9ca3af' },
]

export const APPT_STATUSES = [
  { id: 'confirmed', label: 'Confirmada', color: '#16a34a' },
  { id: 'pending', label: 'Pendiente', color: '#d97706' },
  { id: 'completed', label: 'Completada', color: '#0f766e' },
  { id: 'no_show', label: 'No ha asistido', color: '#b45309' },
  { id: 'cancelled', label: 'Cancelada', color: '#dc2626' },
]

/** Extrae euros numéricos de un precio tipo "90€" o "Consultar" */
export function parseServicePrice(price) {
  if (price == null || price === '') return ''
  const m = String(price).match(/(\d+[.,]?\d*)/)
  if (!m) return ''
  return m[1].replace(',', '.')
}

/** Minutos de duración desde "60 min" / "75 min" */
export function parseServiceDurationMinutes(duration, fallback = 60) {
  const m = String(duration || '').match(/(\d+)/)
  return m ? Number(m[1]) : fallback
}

export function channelMeta(id) {
  return LEAD_CHANNELS.find((c) => c.id === id) || LEAD_CHANNELS[LEAD_CHANNELS.length - 1]
}

export function statusMeta(id) {
  return APPT_STATUSES.find((s) => s.id === id) || APPT_STATUSES[0]
}

export function isOpenDay(date) {
  return CLINIC.openDays.includes(date.getDay())
}

export function pad2(n) {
  return String(n).padStart(2, '0')
}

export function toDateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatTime(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

/** Lista de slots HH:MM desde apertura hasta cierre (sin incluir el cierre como inicio) */
export function daySlots() {
  const slots = []
  let h = CLINIC.openHour
  let m = CLINIC.openMinute
  const end = CLINIC.closeHour * 60 + CLINIC.closeMinute
  while (h * 60 + m < end) {
    slots.push(`${pad2(h)}:${pad2(m)}`)
    m += CLINIC.slotMinutes
    if (m >= 60) {
      h += Math.floor(m / 60)
      m %= 60
    }
  }
  return slots
}

export function combineDateAndTime(dateKey, timeHHMM) {
  const [hh, mm] = timeHHMM.split(':').map(Number)
  const d = parseDateKey(dateKey)
  d.setHours(hh, mm, 0, 0)
  return d
}

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000)
}

export function mondayOf(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

export function weekDaysMonFri(anchor) {
  const mon = mondayOf(anchor)
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d
  })
}

export const WEEKDAYS = [
  { id: 1, short: 'Lun', label: 'Lunes' },
  { id: 2, short: 'Mar', label: 'Martes' },
  { id: 3, short: 'Mié', label: 'Miércoles' },
  { id: 4, short: 'Jue', label: 'Jueves' },
  { id: 5, short: 'Vie', label: 'Viernes' },
  { id: 6, short: 'Sáb', label: 'Sábado' },
  { id: 0, short: 'Dom', label: 'Domingo' },
]

export function defaultSchedule() {
  const day = (open) => ({ open, start: '09:00', end: open ? '20:30' : '14:00' })
  return {
    employee: CLINIC.employee,
    slotMinutes: CLINIC.slotMinutes,
    days: {
      1: day(true),
      2: day(true),
      3: day(true),
      4: day(true),
      5: day(true),
      6: day(false),
      0: day(false),
    },
    breaks: [
      { id: 'comida', label: 'Comida', days: [1, 2, 3, 4, 5], start: '14:00', end: '15:00' },
    ],
  }
}

export function timeToMinutes(hhmm) {
  const [h, m] = String(hhmm || '00:00').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function minutesToTime(total) {
  const m = Math.max(0, total)
  return `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`
}

export function normalizeSchedule(raw) {
  const base = defaultSchedule()
  if (!raw || typeof raw !== 'object') return base
  const days = { ...base.days }
  for (const key of Object.keys(base.days)) {
    const incoming = raw.days?.[key] || raw.days?.[Number(key)]
    if (incoming) {
      days[key] = {
        open: Boolean(incoming.open),
        start: incoming.start || days[key].start,
        end: incoming.end || days[key].end,
      }
    }
  }
  const breaks = Array.isArray(raw.breaks)
    ? raw.breaks
      .filter((b) => b && b.start && b.end)
      .map((b, i) => ({
        id: b.id || `break-${i}`,
        label: String(b.label || 'Descanso').trim() || 'Descanso',
        days: Array.isArray(b.days) ? b.days.map(Number) : [1, 2, 3, 4, 5],
        start: b.start,
        end: b.end,
      }))
    : base.breaks
  return {
    employee: raw.employee || base.employee,
    slotMinutes: Number(raw.slotMinutes) || base.slotMinutes,
    days,
    breaks,
  }
}

export function isScheduledOpen(schedule, date) {
  return Boolean(normalizeSchedule(schedule).days[date.getDay()]?.open)
}

export function gridBounds(schedule) {
  const s = normalizeSchedule(schedule)
  const open = Object.values(s.days).filter((d) => d.open)
  const start = open.length ? Math.min(...open.map((d) => timeToMinutes(d.start))) : 9 * 60
  const end = open.length ? Math.max(...open.map((d) => timeToMinutes(d.end))) : 20 * 60 + 30
  return { start, end, slot: s.slotMinutes || 30 }
}

export function slotsBetween(startMin, endMin, step = 30) {
  const slots = []
  for (let m = startMin; m < endMin; m += step) slots.push(minutesToTime(m))
  return slots
}

export function breaksForDate(schedule, date) {
  const s = normalizeSchedule(schedule)
  const dow = date.getDay()
  return s.breaks.filter((b) => b.days.includes(dow))
}

export function weekDaysForSchedule(anchor, schedule) {
  const s = normalizeSchedule(schedule)
  const mon = mondayOf(anchor)
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    if (s.days[d.getDay()]?.open) days.push(d)
  }
  return days.length ? days : weekDaysMonFri(anchor)
}

export function scheduleSummary(schedule) {
  const s = normalizeSchedule(schedule)
  return WEEKDAYS.map((w) => {
    const d = s.days[w.id]
    const breaks = s.breaks.filter((b) => b.days.includes(w.id))
    return {
      ...w,
      open: d.open,
      hours: d.open ? `${d.start} – ${d.end}` : 'Cerrado',
      breaks: breaks.map((b) => `${b.label} ${b.start}–${b.end}`),
    }
  })
}

export const HOURS_LABEL = {
  es: 'Lunes a viernes: 9:00 – 20:30 · Sábados y domingos: cerrado',
  detail: [
    { day: 'Lunes', hours: '9:00 – 20:30' },
    { day: 'Martes', hours: '9:00 – 20:30' },
    { day: 'Miércoles', hours: '9:00 – 20:30' },
    { day: 'Jueves', hours: '9:00 – 20:30' },
    { day: 'Viernes', hours: '9:00 – 20:30' },
    { day: 'Sábado', hours: 'Cerrado' },
    { day: 'Domingo', hours: 'Cerrado' },
  ],
}
