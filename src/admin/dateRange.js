import { toDateKey, weekDaysMonFri } from './clinicHours'

export function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function endOfDay(d) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export function parseInputDate(value) {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getPresetRange(preset, customFrom, customTo) {
  const now = new Date()
  if (preset === 'today') {
    return { from: startOfDay(now), to: endOfDay(now), label: 'Hoy' }
  }
  if (preset === 'week') {
    const days = weekDaysMonFri(now)
    return { from: startOfDay(days[0]), to: endOfDay(days[4]), label: 'Esta semana' }
  }
  if (preset === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { from: startOfDay(from), to: endOfDay(to), label: 'Este mes' }
  }
  if (preset === 'last30') {
    const from = new Date(now)
    from.setDate(from.getDate() - 29)
    return { from: startOfDay(from), to: endOfDay(now), label: 'Últimos 30 días' }
  }
  // custom
  const from = parseInputDate(customFrom) || startOfDay(now)
  const to = parseInputDate(customTo) || endOfDay(now)
  return {
    from: startOfDay(from),
    to: endOfDay(to < from ? from : to),
    label: 'Personalizado',
  }
}

export function rangeToInputs(from, to) {
  return { from: toDateKey(from), to: toDateKey(to) }
}

export const DATE_PRESETS = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
  { id: 'last30', label: '30 días' },
  { id: 'custom', label: 'Personalizado' },
]
