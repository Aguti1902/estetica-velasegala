/** Catálogo: categorías principales y secciones (faciales: base / específicos) */

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

/** Solo las 3 higienes van en base; el resto de faciales → específicos */
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
  'lhygene-parfaite': 'facial-specific',
  'hydra-defense': 'facial-specific',
  'wow-the-treatment': 'facial-specific',
  'elixir-repair': 'facial-specific',
  'eternal-lifting': 'facial-specific',
  'indiba-facial': 'facial-specific',
  'indiba-periocular': 'facial-specific',
  kobido: 'facial-specific',
  'massatge-craneofacial': 'facial-specific',
}

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
  'lhygene-parfaite': 20,
  'hydra-defense': 21,
  'wow-the-treatment': 22,
  'elixir-repair': 23,
  'eternal-lifting': 24,
  'indiba-facial': 25,
  'indiba-periocular': 26,
  kobido: 27,
  'massatge-craneofacial': 28,
}

function normalizeSection(section, category) {
  // Migración: el antiguo tercer grupo pasa a específicos
  if (section === 'facial-complementarios') return 'facial-specific'
  if (section && DEFAULT_SECTIONS[section]) return section
  if (category === 'facial') return 'facial-specific'
  return section || `${category}-general`
}

export function sectionLabel(sectionKey, locale, catalogConfig) {
  const sections = { ...DEFAULT_SECTIONS, ...(catalogConfig?.sections || {}) }
  const key = normalizeSection(sectionKey, sections[sectionKey]?.category)
  const sec = sections[key]
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
  const rawSection = service.section || SLUG_SECTION[service.slug]
  const section = normalizeSection(rawSection, service.category)
  const sections = { ...DEFAULT_SECTIONS, ...(catalogConfig?.sections || {}) }
  const secDef = sections[section] || {}
  const catLabels = { ...DEFAULT_CATEGORIES, ...(catalogConfig?.categories || {}) }
  const catDef = catLabels[service.category]

  return {
    ...service,
    section,
    sectionLabel: service.sectionLabel
      || (locale === 'ca' ? secDef.labelCa : secDef.labelEs)
      || section,
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
    .filter(([key, def]) => def.category === category && key !== 'facial-complementarios')
    .sort((a, b) => (a[1].order ?? 0) - (b[1].order ?? 0))
    .map(([key, def]) => ({ key, ...def }))
}
