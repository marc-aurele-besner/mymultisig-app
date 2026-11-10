import { useEffect, useState } from 'react'

// Wallet connection and the persisted Zustand stores only exist in the
// browser. Components that branch on them render their server-safe variant
// until this flips, so hydration matches the static HTML.
const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => {
    setHasMounted(true)
  }, [])
  return hasMounted
}

export default useHasMounted
