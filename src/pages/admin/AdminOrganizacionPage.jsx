import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { adminFetch } from '../../admin/useAdminAuth'
import { useServices } from '../../context/ServicesContext'
import { DEFAULT_SECTIONS, DEFAULT_CATEGORIES } from '../../data/serviceCatalog'
import {
  adminTheme as th,
  uiPageTitle,
  uiCard,
  uiInput,
  uiBtnPrimary,
} from '../../admin/adminTheme'

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

  return (
    <div>
      {toast && (
        <div style={{
          marginBottom: 16,
          padding: '14px 18px',
          background: th.successSoft,
          border: `1px solid ${th.border}`,
          borderRadius: th.radiusPill,
          color: th.success,
          fontWeight: 600,
          fontSize: 13.5,
        }}
        >
          {toast}
        </div>
      )}
      <h2 style={{ ...uiPageTitle, marginBottom: 8 }}>
        Organización del catálogo
      </h2>
      <p style={{ color: th.textMuted, marginBottom: 28, lineHeight: 1.55, maxWidth: 'none' }}>
        Aquí puedes cambiar los títulos de las dos secciones faciales (Tratamientos base y Tratamientos específicos).
        Para mover un tratamiento de un grupo a otro, ábrelo en <strong>Tratamientos</strong> y elige el grupo.
      </p>

      <div style={uiCard({ padding: 28, width: '100%' })}>
        <h3 style={{ fontFamily: th.fontDisplay, fontWeight: 500, marginTop: 0, fontSize: '1.25rem' }}>
          Faciales — {DEFAULT_CATEGORIES.facial.es}
        </h3>
        {facialKeys.sort((a, b) => (sections[a].order ?? 0) - (sections[b].order ?? 0)).map((key) => (
          <div key={key} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${th.border}` }}>
            <p style={{ fontSize: 11, color: th.textMuted, margin: '0 0 10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>{key}</p>
            <label style={{ display: 'block', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: th.textMuted, fontWeight: 600 }}>Título en español</span>
              <input
                type="text"
                value={sections[key].labelEs || ''}
                onChange={(e) => setSections((s) => ({ ...s, [key]: { ...s[key], labelEs: e.target.value } }))}
                style={{ ...uiInput, marginTop: 6 }}
              />
            </label>
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: 13, color: th.textMuted, fontWeight: 600 }}>Título en catalán</span>
              <input
                type="text"
                value={sections[key].labelCa || ''}
                onChange={(e) => setSections((s) => ({ ...s, [key]: { ...s[key], labelCa: e.target.value } }))}
                style={{ ...uiInput, marginTop: 6 }}
              />
            </label>
          </div>
        ))}
        <button type="button" onClick={save} disabled={saving} style={{ ...uiBtnPrimary, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Guardando…' : 'Guardar títulos'}
        </button>
      </div>
    </div>
  )
}
