import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { adminFetch } from '../../admin/useAdminAuth'
import { adminTheme as t } from '../../admin/adminTheme'

const STATUS_LABEL = { new: 'Nuevo', read: 'Leído', archived: 'Archivado' }

export default function AdminContactPage() {
  const { pwd } = useOutletContext()
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const q = filter === 'all' ? '' : `?status=${filter}`
      const res = await adminFetch(`/api/admin/contact${q}`, pwd)
      if (res.ok) setItems(await res.json())
    } finally {
      setLoading(false)
    }
  }, [pwd, filter])

  useEffect(() => { load() }, [load])

  const setStatus = async (id, status) => {
    const res = await adminFetch('/api/admin/contact', pwd, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))
      if (selected?.id === id) setSelected((s) => ({ ...s, status }))
    }
  }

  const unread = items.filter((m) => m.status === 'new').length

  const filterBtn = (active) => ({
    padding: '8px 14px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px',
    background: active ? t.text : t.pageBg,
    color: active ? '#fff' : t.textMuted,
    border: `1px solid ${t.border}`,
  })

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '1.75rem', margin: 0, color: t.text }}>
            Contacto
          </h2>
          <p style={{ color: t.textMuted, marginTop: '8px' }}>
            {unread > 0 ? `${unread} mensaje(s) sin leer` : 'Bandeja al día'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[['all', 'Todos'], ['new', 'Nuevos'], ['read', 'Leídos'], ['archived', 'Archivados']].map(([v, label]) => (
            <button key={v} type="button" onClick={() => setFilter(v)} style={filterBtn(filter === v)}>
              {label}
            </button>
          ))}
          <button type="button" onClick={load} style={{ ...filterBtn(false), padding: '8px 12px' }}>
            ↻
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: t.textMuted }}>Cargando…</p>
      ) : items.length === 0 ? (
        <p style={{ color: t.textMuted, padding: '32px', border: `1px solid ${t.border}`, textAlign: 'center', borderRadius: '6px' }}>
          No hay mensajes{filter !== 'all' ? ' con este filtro' : ''}.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.2fr)', gap: '16px' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '70vh', overflow: 'auto' }}>
            {items.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(m)
                    if (m.status === 'new') setStatus(m.id, 'read')
                  }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '14px 16px', cursor: 'pointer',
                    background: selected?.id === m.id ? t.subtleBg : t.pageBg,
                    border: `1px solid ${m.status === 'new' ? t.accent : t.border}`,
                    color: t.text, borderRadius: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <strong style={{ fontSize: '0.95rem' }}>{m.name}</strong>
                    <span style={{ fontSize: '10px', color: t.textMuted, textTransform: 'uppercase' }}>{STATUS_LABEL[m.status]}</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: t.textMuted }}>{m.email}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: t.textMuted }}>
                    {new Date(m.created_at).toLocaleString('es-ES')}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          <div style={{ background: t.cardBg, border: `1px solid ${t.border}`, padding: '24px', minHeight: '320px', borderRadius: '6px' }}>
            {!selected ? (
              <p style={{ color: t.textMuted, textAlign: 'center', marginTop: '80px' }}>Selecciona un mensaje</p>
            ) : (
              <>
                <h3 style={{ margin: '0 0 4px', fontFamily: 'Georgia, serif', fontWeight: 400, color: t.text }}>{selected.name}</h3>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  <a href={`mailto:${selected.email}`} style={{ color: t.text, fontWeight: 600 }}>{selected.email}</a>
                  {selected.phone && <span style={{ color: t.textMuted }}>{` · ${selected.phone}`}</span>}
                </p>
                <p style={{ fontSize: '12px', color: t.textMuted, margin: '12px 0 20px' }}>
                  {new Date(selected.created_at).toLocaleString('es-ES')}
                  {selected.source && ` · ${selected.source}`}
                </p>
                {selected.service && (
                  <p style={{ fontSize: '0.875rem', color: t.text }}><strong>Tratamiento:</strong> {selected.service}</p>
                )}
                {selected.clinic && (
                  <p style={{ fontSize: '0.875rem', color: t.text }}><strong>Clínica:</strong> {selected.clinic}</p>
                )}
                {selected.message && (
                  <div style={{
                    marginTop: '16px', padding: '16px', background: t.subtleBg, lineHeight: 1.6,
                    whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: t.text, borderRadius: '4px',
                  }}
                  >
                    {selected.message}
                  </div>
                )}
                <div style={{ marginTop: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selected.status !== 'read' && (
                    <button type="button" onClick={() => setStatus(selected.id, 'read')} style={actionBtn}>Marcar leído</button>
                  )}
                  {selected.status !== 'archived' && (
                    <button type="button" onClick={() => setStatus(selected.id, 'archived')} style={actionBtn}>Archivar</button>
                  )}
                  {selected.status !== 'new' && (
                    <button type="button" onClick={() => setStatus(selected.id, 'new')} style={actionBtn}>Marcar nuevo</button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const actionBtn = {
  padding: '8px 14px', background: t.pageBg, border: `1px solid ${t.borderStrong}`, color: t.text,
  cursor: 'pointer', fontSize: '12px', borderRadius: '4px',
}
