import { useCallback, useState } from 'react'

const STORAGE_KEY = 'estetica_admin_pwd'

export function getStoredAdminPassword() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function setStoredAdminPassword(pwd) {
  try {
    if (pwd) sessionStorage.setItem(STORAGE_KEY, pwd)
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
}

export function adminFetch(path, pwd, options = {}) {
  return fetch(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      'X-Admin-Password': pwd,
    },
  })
}

export function useAdminAuth() {
  const [pwd, setPwd] = useState(() => getStoredAdminPassword())
  const [authed, setAuthed] = useState(() => Boolean(getStoredAdminPassword()))
  const [pwdError, setPwdError] = useState(false)

  const verifyLogin = useCallback(async (password) => {
    const res = await adminFetch('/api/admin/contact?limit=1', password)
    if (res.status === 401) {
      setPwdError(true)
      setAuthed(false)
      setStoredAdminPassword('')
      return false
    }
    setPwd(password)
    setStoredAdminPassword(password)
    setAuthed(true)
    setPwdError(false)
    return true
  }, [])

  const logout = useCallback(() => {
    setPwd('')
    setAuthed(false)
    setStoredAdminPassword('')
  }, [])

  return { pwd, authed, pwdError, setPwdError, verifyLogin, logout, setAuthed }
}
