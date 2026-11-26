import { useEffect, useState } from 'react'

import type { DeployCostEntry } from '../lib/deployCost/estimate'

let cached: { at: number; promise: Promise<DeployCostEntry[]> } | null = null

const fetchEntries = (): Promise<DeployCostEntry[]> => {
  if (cached == null || Date.now() - cached.at > 60_000) {
    const promise = fetch('/api/deploy-cost')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('unavailable'))))
      .then((body: { content: DeployCostEntry[] }) => body.content)
    promise.catch(() => {
      cached = null
    })
    cached = { at: Date.now(), promise }
  }
  return cached.promise
}

// Estimated USD cost of deploying a multisig on each mainnet. `entries` stays
// empty while loading or when the estimate is unavailable.
const useDeployCost = () => {
  const [entries, setEntries] = useState<DeployCostEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    let live = true
    fetchEntries()
      .then((e) => live && setEntries(e))
      .catch(() => undefined)
      .finally(() => live && setIsLoading(false))
    return () => {
      live = false
    }
  }, [])
  return { entries, isLoading }
}

export default useDeployCost
