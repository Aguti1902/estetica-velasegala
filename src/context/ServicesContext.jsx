import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { servicesData as baseServicesData } from '../data/services'
import { mergeAllServices } from '../utils/mergeServices'

const ServicesContext = createContext(null)

export function ServicesProvider({ children }) {
  const [overrides, setOverrides] = useState({ es: {}, ca: {} })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/service-overrides')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.es) setOverrides(data)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => { cancelled = true }
  }, [])

  const servicesData = useMemo(
    () => mergeAllServices(baseServicesData, overrides),
    [overrides],
  )

  return (
    <ServicesContext.Provider value={{ servicesData, overridesLoaded: loaded, refreshOverrides: () => {
      fetch('/api/service-overrides')
        .then((r) => r.json())
        .then((data) => { if (data?.es) setOverrides(data) })
        .catch(() => {})
    } }}>
      {children}
    </ServicesContext.Provider>
  )
}

export function useServices() {
  const ctx = useContext(ServicesContext)
  if (!ctx) {
    return { servicesData: baseServicesData, overridesLoaded: true, refreshOverrides: () => {} }
  }
  return ctx
}
