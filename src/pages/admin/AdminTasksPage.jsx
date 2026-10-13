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

export default function AdminTasksPage() {
  const { pwd } = useOutletContext()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [priority, setPriority] = useState('normal')
  const [filter, setFilter] = useState('open')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const q = filter === 'all' ? '' : `?status=${filter}`
      const res = await adminFetch(`/api/admin/tasks${q}`, pwd)
      if (res.ok) {
        const data = await res.json()
        setTasks(Array.isArray(data) ? data : [])
      } else {
        const err = await res.json().catch(() => ({}))
        setError(err.error || 'Ejecuta supabase-panel-extras.sql en Supabase')
      }
    } finally {
      setLoading(false)
    }
  }, [pwd, filter])

  useEffect(() => { load() }, [load])

  const add = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    const res = await adminFetch('/api/admin/tasks', pwd, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), due_date: due || null, priority }),
    })
    if (res.ok) {
      setTitle('')
      setDue('')
      setPriority('normal')
      await load()
    }
  }

  const toggle = async (task) => {
    await adminFetch('/api/admin/tasks', pwd, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, done: !task.done }),
    })
    await load()
  }

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar tarea?')) return
    await adminFetch(`/api/admin/tasks?id=${encodeURIComponent(id)}`, pwd, { method: 'DELETE' })
    await load()
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={uiPageTitle}>Tareas</h2>
        <p style={{ color: t.textMuted, margin: '6px 0 0', fontSize: 14 }}>
          Lista operativa del día a día de la clínica
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: 12, padding: 12, background: t.dangerSoft, color: t.danger, borderRadius: t.radius, fontSize: 13 }}>{error}</div>
      )}

      <form onSubmit={add} style={{ ...uiCard({ padding: 16 }), marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nueva tarea (pedir stock, llamar a…)"
          style={{ ...uiInput, flex: '1 1 240px' }}
        />
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} style={{ ...uiInput, width: 'auto' }} />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ ...uiInput, width: 'auto' }}>
          <option value="low">Baja</option>
          <option value="normal">Normal</option>
          <option value="high">Alta</option>
        </select>
        <button type="submit" style={uiBtnPrimary}>Añadir</button>
      </form>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[['open', 'Pendientes'], ['done', 'Hechas'], ['all', 'Todas']].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            style={{
              ...uiBtnGhost,
              background: filter === id ? t.text : '#fff',
              color: filter === id ? '#fff' : t.text,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: t.textMuted }}>Cargando…</p>
      ) : tasks.length === 0 ? (
        <p style={{ ...uiCard({ padding: 32, textAlign: 'center' }), color: t.textMuted }}>No hay tareas aquí</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map((task) => (
            <li key={task.id} style={{
              ...uiCard({ padding: '12px 16px' }),
              display: 'flex', alignItems: 'center', gap: 12,
              opacity: task.done ? 0.65 : 1,
            }}
            >
              <button
                type="button"
                onClick={() => toggle(task)}
                aria-label={task.done ? 'Marcar pendiente' : 'Marcar hecha'}
                style={{
                  width: 22, height: 22, borderRadius: 7,
                  border: `2px solid ${task.done ? t.success : t.borderStrong}`,
                  background: task.done ? t.success : '#fff',
                  cursor: 'pointer', flexShrink: 0, color: '#fff', fontSize: 12, fontWeight: 700,
                }}
              >
                {task.done ? '✓' : ''}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14.5, fontWeight: 600,
                  textDecoration: task.done ? 'line-through' : 'none',
                }}
                >
                  {task.title}
                </div>
                <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>
                  {task.due_date ? `Vence ${new Date(`${task.due_date}T12:00:00`).toLocaleDateString('es-ES')}` : 'Sin fecha'}
                  {' · '}
                  <span style={{
                    color: task.priority === 'high' ? t.danger : task.priority === 'low' ? t.textMuted : t.accentDark,
                    fontWeight: 650,
                  }}
                  >
                    {task.priority === 'high' ? 'Alta' : task.priority === 'low' ? 'Baja' : 'Normal'}
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => remove(task.id)} style={{ ...uiBtnGhost, color: t.danger, borderColor: '#fecaca' }}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
