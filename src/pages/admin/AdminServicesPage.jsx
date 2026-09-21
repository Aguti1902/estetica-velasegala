import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { servicesData as baseServicesData } from '../../data/services'
import { adminFetch } from '../../admin/useAdminAuth'
import { useServices } from '../../context/ServicesContext'
import { uploadTreatmentImage } from '../../admin/uploadTreatmentImage'

function mergeDraft(base, patch) {
  return {
    name: patch.name ?? base.name,
    description: patch.description ?? base.description,
    longDescription: patch.longDescription ?? base.longDescription,
    duration: patch.duration ?? base.duration,
    price: patch.price ?? base.price,
    image: patch.image ?? base.image,
    gallery: patch.gallery?.length ? patch.gallery : (base.gallery || []),
    steps: patch.steps?.length ? patch.steps : (base.steps || []),
    benefits: patch.benefits?.length ? patch.benefits : (base.benefits || []),
    faq: patch.faq?.length ? patch.faq : (base.faq || []),
  }
}

export default function AdminServicesPage() {
  const { pwd } = useOutletContext()
  const { refreshOverrides } = useServices()
  const baseList = baseServicesData.es

  const [locale, setLocale] = useState('es')
  const [slug, setSlug] = useState(baseList[0]?.slug || '')
  const [overrides, setOverrides] = useState({})
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  const loadOverrides = useCallback(async () => {
    const res = await adminFetch('/api/admin/services', pwd)
    if (res.ok) {
      const rows = await res.json()
      const map = {}
      for (const row of rows) map[`${row.slug}:${row.locale}`] = row.data
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
    setDraft(mergeDraft(baseService, patch))
  }, [baseService, slug, locale, overrides])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return baseList
    return baseList.filter(
      (s) => s.name.toLowerCase().includes(q) || s.categoryLabel?.toLowerCase().includes(q),
    )
  }, [baseList, search])

  const handleSave = async () => {
    if (!draft) return
    setSaving(true)
    try {
      const data = {
        name: draft.name,
        description: draft.description,
        longDescription: draft.longDescription,
        duration: draft.duration,
        price: draft.price,
        image: draft.image,
        gallery: draft.gallery || [],
        steps: (draft.steps || []).filter((s) => s.title?.trim() || s.desc?.trim()),
        benefits: (draft.benefits || []).map((b) => b.trim()).filter(Boolean),
        faq: (draft.faq || []).filter((f) => f.q?.trim() || f.a?.trim()),
      }
      const res = await adminFetch('/api/admin/services', pwd, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, locale, data }),
      })
      if (res.ok) {
        showToast('Cambios guardados. Ya se ven en la web.')
        await loadOverrides()
        refreshOverrides()
      } else showToast('No se pudo guardar. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const handleRevert = async () => {
    if (!window.confirm('¿Quitar tus cambios y dejar el texto e imágenes como estaban al inicio?')) return
    const res = await adminFetch(`/api/admin/services?slug=${encodeURIComponent(slug)}&locale=${locale}`, pwd, {
      method: 'DELETE',
    })
    if (res.ok || res.status === 204) {
      showToast('Contenido inicial restaurado')
      await loadOverrides()
      refreshOverrides()
    }
  }

  const uploadFile = async (file, onUrl) => {
    setUploading(true)
    try {
      const url = await uploadTreatmentImage(file, pwd)
      onUrl(url)
      showToast('Foto subida correctamente')
    } catch (e) {
      showToast(e.message || 'Error al subir la foto')
    } finally {
      setUploading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: '#141414', border: '1px solid #444',
    color: '#eee', fontSize: '15px', boxSizing: 'border-box', borderRadius: '4px',
  }

  const hasOverride = Boolean(overrides[`${slug}:${locale}`])

  if (!draft) return null

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: '16px', right: '16px', background: '#2a2520', border: '1px solid #c9a882',
          padding: '12px 20px', zIndex: 100, fontSize: '14px', maxWidth: '320px',
        }}
        >
          {toast}
        </div>
      )}

      <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '1.75rem', margin: '0 0 8px' }}>
        Tratamientos
      </h2>
      <p style={{ color: '#888', marginBottom: '24px', lineHeight: 1.5 }}>
        Elige un tratamiento, edita los textos y sube las fotos. No hace falta saber de informática: solo rellena los campos y pulsa guardar.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 260px) 1fr', gap: '20px', alignItems: 'start' }}>
        <aside style={{ background: '#1e1e1e', border: '1px solid #333', borderRadius: '6px', padding: '16px', maxHeight: 'calc(100vh - 160px)', overflow: 'auto' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tratamiento…"
            style={{ ...inputStyle, marginBottom: '12px', fontSize: '14px' }}
          />
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            {['es', 'ca'].map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocale(loc)}
                style={{
                  flex: 1, padding: '10px 8px', cursor: 'pointer', fontSize: '12px',
                  background: locale === loc ? '#c9a882' : '#222', color: locale === loc ? '#141414' : '#aaa',
                  border: '1px solid #333', borderRadius: '4px', fontWeight: locale === loc ? 600 : 400,
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
                    width: '100%', textAlign: 'left', padding: '11px 10px', cursor: 'pointer',
                    background: slug === s.slug ? '#2a2520' : 'transparent',
                    border: 'none', color: slug === s.slug ? '#c9a882' : '#ccc', fontSize: '14px',
                    borderBottom: '1px solid #2a2a2a', borderRadius: slug === s.slug ? '4px' : 0,
                  }}
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div style={{ background: '#1e1e1e', border: '1px solid #333', borderRadius: '6px', padding: '28px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px', marginBottom: '28px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: '#c9a882' }}>{baseService?.categoryLabel}</p>
              {hasOverride && (
                <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#888' }}>Tienes cambios guardados en la web</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button type="button" onClick={handleRevert} disabled={!hasOverride} style={btnSecondary}>
                Deshacer mis cambios
              </button>
              <button type="button" onClick={handleSave} disabled={saving || uploading} style={btnPrimary}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>

          <Section title="Información básica">
            <Field label="Nombre del tratamiento">
              <input type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={inputStyle} />
            </Field>
            <Field label="Texto corto (aparece en listados)">
              <textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>
            <Field label="Descripción completa (página del tratamiento)">
              <textarea rows={6} value={draft.longDescription} onChange={(e) => setDraft({ ...draft, longDescription: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Duración (ej. 60 min)">
                <input type="text" value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} style={inputStyle} />
              </Field>
              <Field label="Precio (ej. Desde 35€)">
                <input type="text" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} style={inputStyle} />
              </Field>
            </div>
          </Section>

          <Section title="Foto de portada">
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#888', lineHeight: 1.5 }}>
              Es la imagen grande de arriba en la ficha del tratamiento.
            </p>
            <PhotoBlock
              src={draft.image}
              uploading={uploading}
              onUpload={(file) => uploadFile(file, (url) => setDraft({ ...draft, image: url }))}
              onRemove={() => setDraft({ ...draft, image: '' })}
              changeLabel="Cambiar foto de portada"
            />
          </Section>

          <Section title="Fotos del tratamiento">
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#888', lineHeight: 1.5 }}>
              Galería que se ve más abajo en la página (puedes añadir varias).
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {(draft.gallery || []).map((url, i) => (
                <PhotoBlock
                  key={`${url}-${i}`}
                  src={url}
                  compact
                  uploading={uploading}
                  onRemove={() => setDraft({ ...draft, gallery: draft.gallery.filter((_, j) => j !== i) })}
                />
              ))}
              <AddPhotoButton
                uploading={uploading}
                label="+ Añadir foto"
                onPick={(file) => uploadFile(file, (url) => setDraft({ ...draft, gallery: [...(draft.gallery || []), url] }))}
              />
            </div>
          </Section>

          <Section title="Pasos del tratamiento">
            {(draft.steps || []).map((step, i) => (
              <div key={i} style={{ marginBottom: '16px', padding: '16px', background: '#141414', borderRadius: '4px', border: '1px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#888' }}>Paso {i + 1}</span>
                  <button type="button" style={btnTextDanger} onClick={() => setDraft({ ...draft, steps: draft.steps.filter((_, j) => j !== i) })}>
                    Quitar
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Título del paso"
                  value={step.title || ''}
                  onChange={(e) => {
                    const steps = [...draft.steps]
                    steps[i] = { ...steps[i], title: e.target.value }
                    setDraft({ ...draft, steps })
                  }}
                  style={{ ...inputStyle, marginBottom: '8px' }}
                />
                <textarea
                  rows={2}
                  placeholder="Qué se hace en este paso"
                  value={step.desc || ''}
                  onChange={(e) => {
                    const steps = [...draft.steps]
                    steps[i] = { ...steps[i], desc: e.target.value }
                    setDraft({ ...draft, steps })
                  }}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            ))}
            <button
              type="button"
              style={btnSecondary}
              onClick={() => setDraft({ ...draft, steps: [...(draft.steps || []), { title: '', desc: '' }] })}
            >
              + Añadir paso
            </button>
          </Section>

          <Section title="Beneficios">
            {(draft.benefits || []).map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={b}
                  placeholder="Ej. Piel más luminosa"
                  onChange={(e) => {
                    const benefits = [...draft.benefits]
                    benefits[i] = e.target.value
                    setDraft({ ...draft, benefits })
                  }}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button type="button" style={btnTextDanger} onClick={() => setDraft({ ...draft, benefits: draft.benefits.filter((_, j) => j !== i) })}>
                  Quitar
                </button>
              </div>
            ))}
            <button
              type="button"
              style={btnSecondary}
              onClick={() => setDraft({ ...draft, benefits: [...(draft.benefits || []), ''] })}
            >
              + Añadir beneficio
            </button>
          </Section>

          <Section title="Preguntas frecuentes">
            {(draft.faq || []).map((item, i) => (
              <div key={i} style={{ marginBottom: '16px', padding: '16px', background: '#141414', borderRadius: '4px', border: '1px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                  <button type="button" style={btnTextDanger} onClick={() => setDraft({ ...draft, faq: draft.faq.filter((_, j) => j !== i) })}>
                    Quitar
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Pregunta"
                  value={item.q || ''}
                  onChange={(e) => {
                    const faq = [...draft.faq]
                    faq[i] = { ...faq[i], q: e.target.value }
                    setDraft({ ...draft, faq })
                  }}
                  style={{ ...inputStyle, marginBottom: '8px' }}
                />
                <textarea
                  rows={2}
                  placeholder="Respuesta"
                  value={item.a || ''}
                  onChange={(e) => {
                    const faq = [...draft.faq]
                    faq[i] = { ...faq[i], a: e.target.value }
                    setDraft({ ...draft, faq })
                  }}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            ))}
            <button
              type="button"
              style={btnSecondary}
              onClick={() => setDraft({ ...draft, faq: [...(draft.faq || []), { q: '', a: '' }] })}
            >
              + Añadir pregunta
            </button>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: '36px', paddingBottom: '28px', borderBottom: '1px solid #2a2a2a' }}>
      <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '1.2rem', margin: '0 0 16px', color: '#eee' }}>
        {title}
      </h3>
      {children}
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: '18px' }}>
      <span style={{ display: 'block', fontSize: '13px', color: '#aaa', marginBottom: '8px' }}>{label}</span>
      {children}
    </label>
  )
}

function PhotoBlock({ src, compact, uploading, onUpload, onRemove, changeLabel }) {
  const w = compact ? 140 : '100%'
  const h = compact ? 100 : 200
  return (
    <div style={{ width: compact ? 140 : '100%', maxWidth: compact ? 140 : 360 }}>
      {src ? (
        <div style={{ position: 'relative' }}>
          <img src={src} alt="" style={{ width: w, height: h, objectFit: 'cover', borderRadius: '4px', border: '1px solid #444', display: 'block' }} />
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {onUpload && (
              <label style={{ ...btnSmall, cursor: uploading ? 'wait' : 'pointer' }}>
                {uploading ? 'Subiendo…' : (changeLabel || 'Cambiar')}
                <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={uploading} onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
              </label>
            )}
            {onRemove && (
              <button type="button" style={btnTextDanger} onClick={onRemove}>Quitar foto</button>
            )}
          </div>
        </div>
      ) : onUpload ? (
        <AddPhotoButton uploading={uploading} label="Subir foto" onPick={onUpload} />
      ) : null}
    </div>
  )
}

function AddPhotoButton({ label, uploading, onPick }) {
  return (
    <label
      style={{
        width: 140, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px dashed #444', borderRadius: '4px', color: '#c9a882', fontSize: '13px',
        cursor: uploading ? 'wait' : 'pointer', textAlign: 'center', padding: '8px',
      }}
    >
      {uploading ? 'Subiendo…' : label}
      <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={uploading} onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])} />
    </label>
  )
}

const btnPrimary = {
  padding: '12px 22px', background: '#c9a882', border: 'none', color: '#141414',
  cursor: 'pointer', fontSize: '13px', fontWeight: 600, borderRadius: '4px',
}
const btnSecondary = {
  padding: '10px 18px', background: '#222', border: '1px solid #444', color: '#ccc',
  cursor: 'pointer', fontSize: '13px', borderRadius: '4px',
}
const btnSmall = {
  padding: '8px 12px', background: '#222', border: '1px solid #555', color: '#c9a882',
  fontSize: '12px', borderRadius: '4px', display: 'inline-block',
}
const btnTextDanger = {
  padding: '6px 10px', background: 'transparent', border: 'none', color: '#c77',
  cursor: 'pointer', fontSize: '12px',
}
