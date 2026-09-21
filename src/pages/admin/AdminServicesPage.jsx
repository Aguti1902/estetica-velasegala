import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { servicesData as baseServicesData } from '../../data/services'
import { adminFetch } from '../../admin/useAdminAuth'
import { useServices } from '../../context/ServicesContext'

const EDITABLE_SCALAR = ['name', 'description', 'longDescription', 'duration', 'price', 'image']
const FIELD_LABELS = {
  name: 'Nombre',
  description: 'Descripción corta',
  longDescription: 'Descripción larga',
  duration: 'Duración',
  price: 'Precio',
  image: 'Imagen principal (URL)',
}

function pickEditable(base, draft) {
  const out = {}
  for (const key of [...EDITABLE_SCALAR, 'gallery', 'steps', 'benefits', 'faq']) {
    const v = draft[key] !== undefined ? draft[key] : base[key]
    if (v !== undefined) out[key] = v
  }
  return out
}

export default function AdminServicesPage() {
  const { pwd } = useOutletContext()
  const { refreshOverrides } = useServices()
  const baseList = baseServicesData.es

  const [locale, setLocale] = useState('es')
  const [slug, setSlug] = useState(baseList[0]?.slug || '')
  const [overrides, setOverrides] = useState({})
  const [draft, setDraft] = useState({})
  const [galleryText, setGalleryText] = useState('')
  const [jsonBlocks, setJsonBlocks] = useState({ steps: '', benefits: '', faq: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const loadOverrides = useCallback(async () => {
    const res = await adminFetch('/api/admin/services', pwd)
    if (res.ok) {
      const rows = await res.json()
      const map = {}
      for (const row of rows) {
        map[`${row.slug}:${row.locale}`] = row.data
      }
      setOverrides(map)
    }
  }, [pwd])

  useEffect(() => { loadOverrides() }, [loadOverrides])

  const baseService = useMemo(() => {
    const list = baseServicesData[locale] || baseServicesData.es
    return list.find((s) => s.slug === slug) || baseServicesData.es.find((s) => s.slug === slug)
  }, [locale, slug])

  useEffect(() => {
    if (!baseService) return
    const patch = overrides[`${slug}:${locale}`] || {}
    const merged = { ...baseService, ...patch }
    setDraft(pickEditable(baseService, merged))
    setGalleryText((merged.gallery || []).join('\n'))
    setJsonBlocks({
      steps: JSON.stringify(merged.steps || [], null, 2),
      benefits: JSON.stringify(merged.benefits || [], null, 2),
      faq: JSON.stringify(merged.faq || [], null, 2),
    })
  }, [baseService, slug, locale, overrides])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return baseList
    return baseList.filter(
      (s) => s.name.toLowerCase().includes(q) || s.slug.includes(q) || s.categoryLabel?.toLowerCase().includes(q),
    )
  }, [baseList, search])

  const handleSave = async () => {
    setSaving(true)
    try {
      let steps; let benefits; let faq
      try {
        steps = JSON.parse(jsonBlocks.steps)
        benefits = JSON.parse(jsonBlocks.benefits)
        faq = JSON.parse(jsonBlocks.faq)
      } catch {
        showToast('JSON inválido en pasos, beneficios o FAQ')
        return
      }
      const gallery = galleryText.split('\n').map((l) => l.trim()).filter(Boolean)
      const data = { ...draft, gallery, steps, benefits, faq }
      const res = await adminFetch('/api/admin/services', pwd, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, locale, data }),
      })
      if (res.ok) {
        showToast('Guardado — visible en la web en unos segundos')
        await loadOverrides()
        refreshOverrides()
      } else {
        showToast('Error al guardar')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleRevert = async () => {
    if (!window.confirm('¿Eliminar los cambios personalizados y volver al contenido original del código?')) return
    const res = await adminFetch(`/api/admin/services?slug=${encodeURIComponent(slug)}&locale=${locale}`, pwd, {
      method: 'DELETE',
    })
    if (res.ok || res.status === 204) {
      showToast('Restaurado al original')
      await loadOverrides()
      refreshOverrides()
    }
  }

  const handleImageUpload = async (e, targetField = 'image') => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const reader = new FileReader()
      const dataBase64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const res = await adminFetch('/api/admin/upload', pwd, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          dataBase64,
        }),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        setDraft((d) => ({ ...d, [targetField]: data.url }))
        showToast('Imagen subida')
      } else {
        showToast(data.error || 'Error al subir')
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', background: '#141414', border: '1px solid #444',
    color: '#eee', fontSize: '14px', boxSizing: 'border-box',
  }

  const hasOverride = Boolean(overrides[`${slug}:${locale}`])

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: '16px', right: '16px', background: '#2a2520', border: '1px solid #c9a882',
          padding: '12px 20px', zIndex: 100, fontSize: '14px',
        }}>
          {toast}
        </div>
      )}

      <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '1.75rem', marginBottom: '8px' }}>
        Tratamientos
      </h2>
      <p style={{ color: '#888', marginBottom: '24px', maxWidth: '640px', lineHeight: 1.5 }}>
        Edita textos e imágenes por idioma. Si no configuras Supabase Storage, puedes pegar URLs de imágenes ya alojadas.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 280px) 1fr', gap: '20px', alignItems: 'start' }}>
        <aside style={{ background: '#1e1e1e', border: '1px solid #333', padding: '16px', maxHeight: '75vh', overflow: 'auto' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar…"
            style={{ ...inputStyle, marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            {['es', 'ca'].map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocale(loc)}
                style={{
                  flex: 1, padding: '8px', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase',
                  background: locale === loc ? '#c9a882' : '#222', color: locale === loc ? '#141414' : '#aaa',
                  border: '1px solid #333',
                }}
              >
                {loc === 'es' ? 'Español' : 'Català'}
              </button>
            ))}
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {filtered.map((s) => (
              <li key={s.slug}>
                <button
                  type="button"
                  onClick={() => setSlug(s.slug)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 8px', cursor: 'pointer',
                    background: slug === s.slug ? '#2a2520' : 'transparent',
                    border: 'none', color: slug === s.slug ? '#c9a882' : '#ccc', fontSize: '13px',
                    borderBottom: '1px solid #2a2a2a',
                  }}
                >
                  {s.name}
                  {overrides[`${s.slug}:${locale}`] && (
                    <span style={{ marginLeft: '6px', fontSize: '9px', color: '#c9a882' }}>●</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div style={{ background: '#1e1e1e', border: '1px solid #333', padding: '24px' }}>
          {!baseService ? (
            <p style={{ color: '#666' }}>Selecciona un tratamiento</p>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>{baseService.categoryLabel} · {slug}</p>
                  {hasOverride && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#c9a882' }}>Contenido personalizado activo</p>}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={handleRevert} disabled={!hasOverride} style={btnSecondary}>
                    Restaurar original
                  </button>
                  <button type="button" onClick={handleSave} disabled={saving} style={btnPrimary}>
                    {saving ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </div>
              </div>

              {EDITABLE_SCALAR.map((field) => (
                <label key={field} style={{ display: 'block', marginBottom: '16px' }}>
                  <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#888', marginBottom: '6px' }}>
                    {FIELD_LABELS[field]}
                  </span>
                  {field === 'longDescription' ? (
                    <textarea
                      rows={5}
                      value={draft[field] || ''}
                      onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  ) : field === 'description' ? (
                    <textarea
                      rows={3}
                      value={draft[field] || ''}
                      onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={draft[field] || ''}
                      onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
                      style={inputStyle}
                    />
                  )}
                  {field === 'image' && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {draft.image && (
                        <img src={draft.image} alt="" style={{ width: '120px', height: '80px', objectFit: 'cover', border: '1px solid #444' }} />
                      )}
                      <label style={{ fontSize: '12px', cursor: uploading ? 'wait' : 'pointer', color: '#c9a882' }}>
                        {uploading ? 'Subiendo…' : 'Subir imagen'}
                        <input type="file" accept="image/*" hidden onChange={(ev) => handleImageUpload(ev, 'image')} />
                      </label>
                    </div>
                  )}
                </label>
              ))}

              <label style={{ display: 'block', marginBottom: '16px' }}>
                <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#888', marginBottom: '6px' }}>
                  Galería (una URL por línea)
                </span>
                <textarea rows={4} value={galleryText} onChange={(e) => setGalleryText(e.target.value)} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }} />
              </label>

              {['steps', 'benefits', 'faq'].map((key) => (
                <label key={key} style={{ display: 'block', marginBottom: '16px' }}>
                  <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#888', marginBottom: '6px' }}>
                    {key === 'steps' ? 'Pasos (JSON)' : key === 'benefits' ? 'Beneficios (JSON array)' : 'FAQ (JSON)'}
                  </span>
                  <textarea
                    rows={key === 'steps' || key === 'faq' ? 8 : 4}
                    value={jsonBlocks[key]}
                    onChange={(e) => setJsonBlocks((b) => ({ ...b, [key]: e.target.value }))}
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }}
                  />
                </label>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const btnPrimary = {
  padding: '10px 18px', background: '#c9a882', border: 'none', color: '#141414',
  cursor: 'pointer', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase',
}
const btnSecondary = {
  padding: '10px 18px', background: '#222', border: '1px solid #444', color: '#aaa', cursor: 'pointer', fontSize: '12px',
}
