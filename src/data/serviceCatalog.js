/** Catálogo: categorías principales y secciones (p. ej. faciales base / específicos) */

export const DEFAULT_CATEGORIES = {
  facial: { es: 'Faciales', ca: 'Facials' },
  corporal: { es: 'Corporal', ca: 'Corporal' },
  medics: { es: 'Médico-estético', ca: 'Mèdic-estètic' },
  laser: { es: 'Láser', ca: 'Làser' },
}

export const DEFAULT_SECTIONS = {
  'facial-base': {
    category: 'facial',
    order: 1,
    labelEs: 'Tratamientos base',
    labelCa: 'Tractaments base',
  },
  'facial-specific': {
    category: 'facial',
    order: 2,
    labelEs: 'Tratamientos específicos',
    labelCa: 'Tractaments específics',
  },
  'facial-complementarios': {
    category: 'facial',
    order: 3,
    labelEs: 'Otros tratamientos faciales',
    labelCa: 'Altres tractaments facials',
  },
  'corporal-general': {
    category: 'corporal',
    order: 1,
    labelEs: 'Tratamientos corporales',
    labelCa: 'Tractaments corporals',
  },
  'medics-general': {
    category: 'medics',
    order: 1,
    labelEs: 'Medicina estética',
    labelCa: 'Medicina estètica',
  },
  'laser-general': {
    category: 'laser',
    order: 1,
    labelEs: 'Láser e IPL',
    labelCa: 'Làser i IPL',
  },
}

/** Slug → sección por defecto (editable en panel vía override) */
export const SLUG_SECTION = {
  'higiene-facial': 'facial-base',
  'higiene-facial-expert-dermaclear': 'facial-base',
  'higiene-facial-integral-indiba': 'facial-base',
  'age-element': 'facial-specific',
  'hydra-treatment': 'facial-specific',
  'sensitive-skin-solution': 'facial-specific',
  'oily-skin-solution': 'facial-specific',
  mesopeel: 'facial-specific',
  'skinretein-xpert-pack': 'facial-specific',
  'gold-collagen-experience-360': 'facial-specific',
  'lhygene-parfaite': 'facial-complementarios',
  'hydra-defense': 'facial-complementarios',
  'wow-the-treatment': 'facial-complementarios',
  'elixir-repair': 'facial-complementarios',
  'eternal-lifting': 'facial-complementarios',
  'indiba-facial': 'facial-complementarios',
  'indiba-periocular': 'facial-complementarios',
  kobido: 'facial-complementarios',
  'massatge-craneofacial': 'facial-complementarios',
}

/** Orden dentro de la carta (faciales) */
export const SLUG_SORT = {
  'higiene-facial': 1,
  'higiene-facial-expert-dermaclear': 2,
  'higiene-facial-integral-indiba': 3,
  'age-element': 10,
  'hydra-treatment': 11,
  'sensitive-skin-solution': 12,
  'oily-skin-solution': 13,
  mesopeel: 14,
  'skinretein-xpert-pack': 15,
  'gold-collagen-experience-360': 16,
}

export function sectionLabel(sectionKey, locale, catalogConfig) {
  const sections = { ...DEFAULT_SECTIONS, ...(catalogConfig?.sections || {}) }
  const sec = sections[sectionKey]
  if (!sec) return sectionKey
  return locale === 'ca' ? (sec.labelCa || sec.labelEs) : sec.labelEs
}

export function categoryLabel(categoryKey, locale, catalogConfig) {
  const cats = { ...DEFAULT_CATEGORIES, ...(catalogConfig?.categories || {}) }
  const c = cats[categoryKey]
  if (!c) return categoryKey
  return typeof c === 'string' ? c : (locale === 'ca' ? c.ca : c.es)
}

export function enrichService(service, locale, catalogConfig) {
  const section = service.section || SLUG_SECTION[service.slug] || `${service.category}-general`
  const sections = { ...DEFAULT_SECTIONS, ...(catalogConfig?.sections || {}) }
  const secDef = sections[section] || {}
  const catLabels = { ...DEFAULT_CATEGORIES, ...(catalogConfig?.categories || {}) }
  const catDef = catLabels[service.category]

  return {
    ...service,
    section,
    sectionLabel: service.sectionLabel || (locale === 'ca' ? secDef.labelCa : secDef.labelEs) || section,
    categoryLabel: service.categoryLabel || (typeof catDef === 'object'
      ? (locale === 'ca' ? catDef.ca : catDef.es)
      : catDef) || service.category,
    sortOrder: service.sortOrder ?? SLUG_SORT[service.slug] ?? 500,
  }
}

export function enrichServiceList(list, locale, catalogConfig) {
  return list.map((s) => enrichService(s, locale, catalogConfig))
}

export function groupBySection(services, locale, catalogConfig) {
  const sections = { ...DEFAULT_SECTIONS, ...(catalogConfig?.sections || {}) }
  const groups = new Map()

  for (const svc of services) {
    const enriched = enrichService(svc, locale, catalogConfig)
    const key = enriched.section
    if (!groups.has(key)) {
      groups.set(key, {
        section: key,
        label: enriched.sectionLabel,
        order: sections[key]?.order ?? 99,
        items: [],
      })
    }
    groups.get(key).items.push(enriched)
  }

  for (const g of groups.values()) {
    g.items.sort((a, b) => (a.sortOrder ?? 500) - (b.sortOrder ?? 500) || a.name.localeCompare(b.name))
  }

  return [...groups.values()].sort((a, b) => a.order - b.order)
}

export function sectionsForCategory(category, catalogConfig) {
  const sections = { ...DEFAULT_SECTIONS, ...(catalogConfig?.sections || {}) }
  return Object.entries(sections)
    .filter(([, def]) => def.category === category)
    .sort((a, b) => (a[1].order ?? 0) - (b[1].order ?? 0))
    .map(([key, def]) => ({ key, ...def }))
}
