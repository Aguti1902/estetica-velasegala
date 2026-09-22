import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { adminFetch } from '../../admin/useAdminAuth'
import { useServices } from '../../context/ServicesContext'
import { DEFAULT_SECTIONS, DEFAULT_CATEGORIES } from '../../data/serviceCatalog'
import { adminTheme as th } from '../../admin/adminTheme'

export default function AdminOrganizacionPage() {
  const { pwd } = useOutletContext()
  const { refreshCatalog } = useServices()
  const [sections, setSections] = useState({ ...DEFAULT_SECTIONS })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    const res = await adminFetch('/api/admin/catalog', pwd)
    if (res.ok) {
      const data = await res.json()
      setSections({ ...DEFAULT_SECTIONS, ...(data.sections || {}) })
    }
  }, [pwd])

  useEffect(() => { load() }, [load])

  const facialKeys = Object.keys(sections).filter((k) => sections[k].category === 'facial')

  const save = async () => {
    setSaving(true)
    try {
      const res = await adminFetch('/api/admin/catalog', pwd, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { sections } }),
      })
      if (res.ok) {
        setToast('Títulos guardados')
        refreshCatalog()
      } else setToast('Error al guardar')
    } finally {
      setSaving(false)
      setTimeout(() => setToast(''), 3000)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: `1px solid ${th.border}`, borderRadius: '4px',
    fontSize: '14px', boxSizing: 'border-box',
  }

  return (
    <div>
      {toast && (
        <div style={{ marginBottom: '16px', padding: '12px', background: th.subtleBg, border: `1px solid ${th.border}` }}>
          {toast}
        </div>
      )}
      <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '1.75rem', margin: '0 0 8px' }}>
        Organización del catálogo
      </h2>
      <p style={{ color: th.textMuted, marginBottom: '28px', maxWidth: '640px', lineHeight: 1.55 }}>
        Aquí puedes cambiar los títulos de las secciones que se ven en la web (como en la carta de servicios).
        Para mover un tratamiento de sección, ábrelo en <strong>Tratamientos</strong> y elige categoría y grupo.
      </p>

      <div style={{ background: th.cardBg, border: `1px solid ${th.border}`, borderRadius: '6px', padding: '24px', maxWidth: '720px' }}>
        <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, marginTop: 0 }}>
          Faciales — {DEFAULT_CATEGORIES.facial.es}
        </h3>
        {facialKeys.sort((a, b) => (sections[a].order ?? 0) - (sections[b].order ?? 0)).map((key) => (
          <div key={key} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: `1px solid ${th.border}` }}>
            <p style={{ fontSize: '11px', color: th.textMuted, margin: '0 0 10px', textTransform: 'uppercase' }}>{key}</p>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: th.textMuted }}>Título en español</span>
              <input
                type="text"
                value={sections[key].labelEs || ''}
                onChange={(e) => setSections((s) => ({ ...s, [key]: { ...s[key], labelEs: e.target.value } }))}
                style={{ ...inputStyle, marginTop: '4px' }}
              />
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: '13px', color: th.textMuted }}>Título en catalán</span>
              <input
                type="text"
                value={sections[key].labelCa || ''}
                onChange={(e) => setSections((s) => ({ ...s, [key]: { ...s[key], labelCa: e.target.value } }))}
                style={{ ...inputStyle, marginTop: '4px' }}
              />
            </label>
          </div>
        ))}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          style={{
            padding: '12px 22px', background: th.text, color: '#fff', border: 'none',
            borderRadius: '4px', cursor: 'pointer', fontWeight: 600,
          }}
        >
          {saving ? 'Guardando…' : 'Guardar títulos'}
        </button>
      </div>
    </div>
  )
}
