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
  { id: 'cancelled', label: 'Cancelada', color: '#dc2626' },
  { id: 'completed', label: 'Completada', color: '#6b7280' },
]

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
