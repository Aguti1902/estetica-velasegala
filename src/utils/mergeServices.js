function deepMergeService(base, patch) {
  if (!patch || typeof patch !== 'object') return base;
  const out = { ...base };
  for (const key of Object.keys(patch)) {
    const val = patch[key];
    if (val === null || val === undefined || val === '') continue;
    if (Array.isArray(val) && val.length === 0) continue;
    out[key] = val;
  }
  return out;
}

export function mergeServicesForLocale(baseList, overridesBySlug = {}) {
  return baseList.map((svc) => deepMergeService(svc, overridesBySlug[svc.slug]));
}

export function mergeAllServices(baseData, overrides) {
  return {
    es: mergeServicesForLocale(baseData.es, overrides?.es || {}),
    ca: mergeServicesForLocale(baseData.ca, overrides?.ca || {}),
  };
}
