import { useCallback, useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { adminFetch } from '../../admin/useAdminAuth'
import {
  adminTheme as th,
  uiBtnPrimary as btnPrimary,
  uiBtnGhost as btnGhost,
  uiInput as inputStyle,
  uiPageTitle,
  uiCard,
} from '../../admin/adminTheme'
import { channelMeta, formatTime } from '../../admin/clinicHours'

export default function AdminClientsPage() {
  const { pwd } = useOutletContext()
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  const showToast = (m) => {
    setToast(m)
    setTimeout(() => setToast(''), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const q = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
      const res = await adminFetch(`/api/admin/clients${q}`, pwd)
      if (res.ok) {
        const data = await res.json()
        setClients(Array.isArray(data) ? data.filter((c) => c.status !== 'archived') : [])
      } else {
        const err = await res.json().catch(() => ({}))
        setError(err.error || 'No se pudieron cargar las clientas. ¿Ejecutaste supabase-clients.sql?')
      }
    } finally {
      setLoading(false)
    }
  }, [pwd, search])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  const openDetail = async (client) => {
    setSelected(client)
    const res = await adminFetch(`/api/admin/clients?id=${client.id}`, pwd)
    if (res.ok) setDetail(await res.json())
  }

  const saveClient = async () => {
    if (!modal?.name?.trim()) return
    const payload = {
      name: modal.name.trim(),
      phone: modal.phone || '',
      email: modal.email || '',
      notes: modal.notes || '',
    }
    const res = await adminFetch('/api/admin/clients', pwd, {
      method: modal.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modal.id ? { id: modal.id, ...payload } : payload),
    })
    if (res.ok) {
      setModal(null)
      showToast(modal.id ? 'Clienta actualizada' : 'Clienta creada')
      await load()
      if (modal.id && selected?.id === modal.id) openDetail({ id: modal.id })
    }
  }

  const archive = async (id) => {
    if (!window.confirm('¿Archivar esta clienta?')) return
    await adminFetch(`/api/admin/clients?id=${encodeURIComponent(id)}`, pwd, { method: 'DELETE' })
    setSelected(null)
    setDetail(null)
    showToast('Clienta archivada')
    await load()
  }

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 100, background: '#fff',
          border: `1px solid ${th.border}`, padding: '14px 20px', borderRadius: th.radiusPill, fontSize: 14,
          boxShadow: th.shadowMd,
        }}
        >
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={uiPageTitle}>Clientas</h2>
          <p style={{ color: th.textMuted, margin: '8px 0 0', fontSize: 14 }}>
            Historial, gasto y frecuencia de visitas
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ name: '', phone: '', email: '', notes: '' })}
          style={btnPrimary}
        >
          + Nueva clienta
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: 14, background: th.dangerSoft, border: `1px solid #fecaca`, color: th.danger, borderRadius: th.radius, fontSize: 13 }}>
          {error}
        </div>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre, teléfono o email…"
        style={{ ...inputStyle, marginBottom: 20, maxWidth: 420 }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: selected ? 'minmax(280px, 1fr) minmax(340px, 1.3fr)' : '1fr', gap: 16 }}>
        <div>
          {loading ? (
            <p style={{ color: th.textMuted }}>Cargando…</p>
          ) : clients.length === 0 ? (
            <p style={{ color: th.textMuted, padding: 32, ...uiCard({ textAlign: 'center' }) }}>
              No hay clientas todavía. Crea una o añade una cita en Agenda.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {clients.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openDetail(c)}
                  style={{
                    textAlign: 'left', padding: 20, background: selected?.id === c.id ? th.subtleBg : '#fff',
                    border: `1px solid ${selected?.id === c.id ? th.accent : th.border}`, borderRadius: th.radiusLg,
                    cursor: 'pointer', boxShadow: selected?.id === c.id ? th.shadowMd : th.shadow,
                  }}
                >
                  <strong style={{ fontSize: 15, display: 'block', marginBottom: 6 }}>{c.name}</strong>
                  <div style={{ fontSize: 12, color: th.textMuted, lineHeight: 1.5 }}>
                    {c.phone || 'Sin teléfono'}
                    {c.email ? ` · ${c.email}` : ''}
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 11 }}>
                    <Badge>{c.stats?.visitCount || 0} visitas</Badge>
                    <Badge accent>{Number(c.stats?.totalSpent || 0).toFixed(0)}€</Badge>
                    <Badge soft>{c.stats?.frequencyLabel || '—'}</Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected && detail && (
          <aside style={{ ...uiCard({ padding: 24 }), alignSelf: 'start', position: 'sticky', top: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontFamily: th.fontDisplay, fontWeight: 500, fontSize: '1.4rem' }}>{detail.name}</h3>
              <button type="button" onClick={() => { setSelected(null); setDetail(null) }} style={btnGhost}>✕</button>
            </div>
            <p style={{ margin: '0 0 4px', fontSize: 14 }}>{detail.phone || 'Sin teléfono'}</p>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: th.textMuted }}>{detail.email || 'Sin email'}</p>
            {detail.notes && (
              <p style={{ fontSize: 13, background: th.subtleBg, padding: 14, borderRadius: th.radius, marginBottom: 16 }}>{detail.notes}</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <Stat label="Gastado" value={`${Number(detail.stats?.totalSpent || 0).toFixed(2)}€`} />
              <Stat label="Visitas" value={detail.stats?.visitCount || 0} />
              <Stat label="Frecuencia" value={detail.stats?.frequencyLabel || '—'} />
              <Stat
                label="Última visita"
                value={detail.stats?.lastVisit
                  ? new Date(detail.stats.lastVisit).toLocaleDateString('es-ES')
                  : '—'}
              />
            </div>

            <h4 style={{ margin: '0 0 10px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: th.textMuted }}>
              Tratamientos
            </h4>
            {detail.treatments?.length ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                {detail.treatments.map((t) => (
                  <li key={t.name} style={{
                    display: 'flex', justifyContent: 'space-between', gap: 8, padding: '8px 0',
                    borderBottom: `1px solid ${th.border}`, fontSize: 13,
                  }}
                  >
                    <span>{t.name} <span style={{ color: th.textMuted }}>×{t.count}</span></span>
                    <strong>{Number(t.spent).toFixed(0)}€</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: 13, color: th.textMuted, marginBottom: 20 }}>Sin tratamientos registrados aún</p>
            )}

            <h4 style={{ margin: '0 0 10px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: th.textMuted }}>
              Historial de citas
            </h4>
            <div style={{ maxHeight: 240, overflow: 'auto', marginBottom: 16 }}>
              {(detail.appointments || []).slice(0, 30).map((a) => {
                const ch = channelMeta(a.channel)
                return (
                  <div key={a.id} style={{ padding: '10px 0', borderBottom: `1px solid ${th.border}`, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <strong>{a.service_name || 'Cita'}</strong>
                      <span>{Number(a.amount || 0).toFixed(0)}€</span>
                    </div>
                    <div style={{ color: th.textMuted, fontSize: 12, marginTop: 2 }}>
                      {new Date(a.starts_at).toLocaleDateString('es-ES')} {formatTime(new Date(a.starts_at))}
                      {' · '}{a.status}
                      {' · '}
                      <span style={{ color: ch.color }}>{ch.label}</span>
                    </div>
                  </div>
                )
              })}
              {!detail.appointments?.length && (
                <p style={{ fontSize: 13, color: th.textMuted }}>Sin citas</p>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                type="button"
                onClick={() => setModal({
                  id: detail.id, name: detail.name, phone: detail.phone || '',
                  email: detail.email || '', notes: detail.notes || '',
                })}
                style={btnGhost}
              >
                Editar
              </button>
              <Link to="/admin/calendario" style={{ ...btnGhost, textDecoration: 'none', display: 'inline-block' }}>
                Ir a agenda
              </Link>
              <button type="button" onClick={() => archive(detail.id)} style={{ ...btnGhost, color: '#dc2626', borderColor: '#fecaca' }}>
                Archivar
              </button>
            </div>
          </aside>
        )}
      </div>

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
            style={{ background: '#fff', borderRadius: th.radiusXl, width: '100%', maxWidth: 440, padding: 28, boxShadow: th.shadowLg }}
          >
            <h3 style={{ margin: '0 0 20px', fontFamily: th.fontDisplay, fontWeight: 500 }}>
              {modal.id ? 'Editar clienta' : 'Nueva clienta'}
            </h3>
            <label style={fieldLabel}>
              Nombre *
              <input value={modal.name} onChange={(e) => setModal({ ...modal, name: e.target.value })} style={inputStyle} />
            </label>
            <label style={fieldLabel}>
              Teléfono
              <input value={modal.phone} onChange={(e) => setModal({ ...modal, phone: e.target.value })} style={inputStyle} />
            </label>
            <label style={fieldLabel}>
              Email
              <input value={modal.email} onChange={(e) => setModal({ ...modal, email: e.target.value })} style={inputStyle} />
            </label>
            <label style={fieldLabel}>
              Notas
              <textarea rows={3} value={modal.notes} onChange={(e) => setModal({ ...modal, notes: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
            </label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" onClick={saveClient} style={btnPrimary}>Guardar</button>
              <button type="button" onClick={() => setModal(null)} style={btnGhost}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ background: th.subtleBg, borderRadius: th.radius, padding: 14, border: `1px solid ${th.border}` }}>
      <div style={{ fontSize: 11, color: th.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 650 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  )
}

function Badge({ children, accent, soft }) {
  return (
    <span style={{
      padding: '4px 10px', borderRadius: th.radiusPill, fontSize: 11, fontWeight: 650,
      background: accent ? th.text : soft ? th.subtleBg : th.accentSoft,
      color: accent ? '#fff' : soft ? th.textMuted : th.accentDark,
    }}
    >
      {children}
    </span>
  )
}

const fieldLabel = { display: 'block', marginBottom: 12, fontSize: 12, color: th.textMuted, fontWeight: 600 }
