import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { servicesData as baseServicesData } from '../data/services'
import { mergeAllServices } from '../utils/mergeServices'
import { enrichServiceList } from '../data/serviceCatalog'

const ServicesContext = createContext(null)

export function ServicesProvider({ children }) {
  const [overrides, setOverrides] = useState({ es: {}, ca: {} })
  const [catalogConfig, setCatalogConfig] = useState({})
  const [loaded, setLoaded] = useState(false)

  const refreshOverrides = useCallback(() => {
    fetch('/api/service-overrides')
      .then((r) => r.json())
      .then((data) => { if (data?.es) setOverrides(data) })
      .catch(() => {})
  }, [])

  const refreshCatalog = useCallback(() => {
    fetch('/api/catalog-config')
      .then((r) => r.json())
      .then((data) => { if (data && typeof data === 'object') setCatalogConfig(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/service-overrides').then((r) => r.json()),
      fetch('/api/catalog-config').then((r) => r.json()),
    ])
      .then(([ov, cat]) => {
        if (cancelled) return
        if (ov?.es) setOverrides(ov)
        if (cat && typeof cat === 'object') setCatalogConfig(cat)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => { cancelled = true }
  }, [])

  const servicesData = useMemo(() => {
    const merged = mergeAllServices(baseServicesData, overrides)
    return {
      es: enrichServiceList(merged.es, 'es', catalogConfig),
      ca: enrichServiceList(merged.ca, 'ca', catalogConfig),
    }
  }, [overrides, catalogConfig])

  const refreshAll = useCallback(() => {
    refreshOverrides()
    refreshCatalog()
  }, [refreshOverrides, refreshCatalog])

  return (
    <ServicesContext.Provider value={{
      servicesData,
      catalogConfig,
      overridesLoaded: loaded,
      refreshOverrides: refreshAll,
      refreshCatalog,
    }}
    >
      {children}
    </ServicesContext.Provider>
  )
}

export function useServices() {
  const ctx = useContext(ServicesContext)
  if (!ctx) {
    return {
      servicesData: baseServicesData,
      catalogConfig: {},
      overridesLoaded: true,
      refreshOverrides: () => {},
      refreshCatalog: () => {},
    }
  }
  return ctx
}
