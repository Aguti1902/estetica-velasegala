import { adminFetch } from './useAdminAuth'

export async function uploadTreatmentImage(file, pwd) {
  const dataBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
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
  if (!res.ok || !data.url) {
    throw new Error(data.error || 'No se pudo subir la imagen')
  }
  return data.url
}
