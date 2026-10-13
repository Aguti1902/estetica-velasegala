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

const emptyForm = { name: '', sku: '', category: 'General', quantity: 0, min_quantity: 2, unit: 'ud', notes: '' }

export default function AdminInventoryPage() {
  const { pwd } = useOutletContext()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [lowOnly, setLowOnly] = useState(false)
  const [modal, setModal] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const q = new URLSearchParams()
      if (search.trim()) q.set('search', search.trim())
      if (lowOnly) q.set('low_stock', 'true')
      const res = await adminFetch(`/api/admin/inventory?${q}`, pwd)
      if (res.ok) {
        const data = await res.json()
        setItems(Array.isArray(data) ? data : [])
      } else {
        const err = await res.json().catch(() => ({}))
        setError(err.error || 'Ejecuta supabase-panel-extras.sql en Supabase')
      }
    } finally {
      setLoading(false)
    }
  }, [pwd, search, lowOnly])

  useEffect(() => {
    const tmr = setTimeout(load, 200)
    return () => clearTimeout(tmr)
  }, [load])

  const save = async () => {
    if (!modal?.name?.trim()) return
    const payload = {
      name: modal.name.trim(),
      sku: modal.sku,
      category: modal.category,
      quantity: Number(modal.quantity) || 0,
      min_quantity: Number(modal.min_quantity) || 0,
      unit: modal.unit,
      notes: modal.notes,
    }
    const res = await adminFetch('/api/admin/inventory', pwd, {
      method: modal.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modal.id ? { id: modal.id, ...payload } : payload),
    })
    if (res.ok) {
      setModal(null)
      await load()
    }
  }

  const adjust = async (item, delta) => {
    await adminFetch('/api/admin/inventory', pwd, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, quantity: Math.max(0, Number(item.quantity) + delta) }),
    })
    await load()
  }

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return
    await adminFetch(`/api/admin/inventory?id=${encodeURIComponent(id)}`, pwd, { method: 'DELETE' })
    await load()
  }

  const lowCount = items.filter((i) => Number(i.quantity) <= Number(i.min_quantity || 0)).length

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={uiPageTitle}>Inventario</h2>
          <p style={{ color: t.textMuted, margin: '6px 0 0', fontSize: 14 }}>
            Stock de productos y consumibles · {lowCount} con stock bajo
          </p>
        </div>
        <button type="button" onClick={() => setModal({ ...emptyForm })} style={uiBtnPrimary}>+ Producto</button>
      </div>

      {error && (
        <div style={{ marginBottom: 12, padding: 12, background: t.dangerSoft, color: t.danger, borderRadius: t.radius, fontSize: 13 }}>{error}</div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto…"
          style={{ ...uiInput, maxWidth: 320 }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: t.textMuted, cursor: 'pointer' }}>
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
          Solo stock bajo
        </label>
        <button type="button" onClick={load} style={uiBtnGhost}>Actualizar</button>
      </div>

      {loading ? (
        <p style={{ color: t.textMuted }}>Cargando…</p>
      ) : items.length === 0 ? (
        <p style={{ ...uiCard({ padding: 32, textAlign: 'center' }), color: t.textMuted }}>
          No hay productos. Añade cremas, agujas, tipboxes…
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {items.map((item) => {
            const low = Number(item.quantity) <= Number(item.min_quantity || 0)
            return (
              <div key={item.id} style={uiCard({ padding: 18, borderColor: low ? '#fcd34d' : t.border })}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <strong style={{ fontSize: 15 }}>{item.name}</strong>
                  {low && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: t.warning, background: t.warningSoft, padding: '3px 8px', borderRadius: 999 }}>
                      STOCK BAJO
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>
                  {item.category}{item.sku ? ` · ${item.sku}` : ''}
                </div>
                <div style={{ fontFamily: t.fontDisplay, fontSize: '1.8rem', fontWeight: 600, margin: '12px 0 4px' }}>
                  {Number(item.quantity)} <span style={{ fontSize: 14, color: t.textMuted }}>{item.unit}</span>
                </div>
                <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 12 }}>
                  Mínimo: {Number(item.min_quantity)} {item.unit}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <button type="button" onClick={() => adjust(item, -1)} style={uiBtnGhost}>−1</button>
                  <button type="button" onClick={() => adjust(item, 1)} style={uiBtnGhost}>+1</button>
                  <button type="button" onClick={() => setModal({ ...item })} style={uiBtnGhost}>Editar</button>
                  <button type="button" onClick={() => remove(item.id)} style={{ ...uiBtnGhost, color: t.danger, borderColor: '#fecaca' }}>Eliminar</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <div
          role="presentation"
          onClick={() => setModal(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 150,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <div
            role="dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: t.radiusXl, width: '100%', maxWidth: 440, padding: 24, boxShadow: t.shadowLg }}
          >
            <h3 style={{ margin: '0 0 16px', fontFamily: t.fontDisplay, fontWeight: 500 }}>
              {modal.id ? 'Editar producto' : 'Nuevo producto'}
            </h3>
            <label style={field}>
              Nombre *
              <input value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} style={uiInput} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label style={field}>
                Categoría
                <input value={modal.category} onChange={(e) => setModal({ ...modal, category: e.target.value })} style={uiInput} />
              </label>
              <label style={field}>
                SKU
                <input value={modal.sku || ''} onChange={(e) => setModal({ ...modal, sku: e.target.value })} style={uiInput} />
              </label>
              <label style={field}>
                Cantidad
                <input type="number" value={modal.quantity} onChange={(e) => setModal({ ...modal, quantity: e.target.value })} style={uiInput} />
              </label>
              <label style={field}>
                Mínimo
                <input type="number" value={modal.min_quantity} onChange={(e) => setModal({ ...modal, min_quantity: e.target.value })} style={uiInput} />
              </label>
              <label style={field}>
                Unidad
                <input value={modal.unit} onChange={(e) => setModal({ ...modal, unit: e.target.value })} style={uiInput} />
              </label>
            </div>
            <label style={field}>
              Notas
              <textarea rows={2} value={modal.notes || ''} onChange={(e) => setModal({ ...modal, notes: e.target.value })} style={{ ...uiInput, resize: 'vertical' }} />
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={save} style={uiBtnPrimary}>Guardar</button>
              <button type="button" onClick={() => setModal(null)} style={uiBtnGhost}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const field = { display: 'block', marginBottom: 10, fontSize: 12, color: t.textMuted, fontWeight: 600 }
