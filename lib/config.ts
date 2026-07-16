// Valeurs par défaut si la DB n'est pas encore configurée
export const DEFAULT_SITES = [
  'Brécey',
  'Isigny',
  'Télétravail',
  'Autre',
]

export const DEFAULT_SERVICES = [
  'Informatique',
  'Ressources Humaines',
  'Comptabilité / Finance',
  'Commercial / Ventes',
  'Marketing',
  'Direction',
  'Logistique',
  'Production',
  'Qualité',
  'Autre',
]

let cachedConfig: Record<string, string[]> | null = null
let cacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getConfig(): Promise<Record<string, string[]>> {
  const now = Date.now()
  if (cachedConfig && now - cacheTime < CACHE_DURATION) {
    return cachedConfig
  }

  try {
    const res = await fetch('/api/admin/config', { cache: 'no-store' })
    if (!res.ok) throw new Error()
    const data = await res.json()
    cachedConfig = data
    cacheTime = now
    return data
  } catch {
    return {
      sites: DEFAULT_SITES,
      services: DEFAULT_SERVICES,
    }
  }
}

export function invalidateConfig() {
  cachedConfig = null
  cacheTime = 0
}
