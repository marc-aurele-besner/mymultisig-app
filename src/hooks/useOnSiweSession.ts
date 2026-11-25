import { useEffect, useRef } from 'react'

import { SIWE_SESSION_EVENT } from '../utils/siwe'

// Runs `callback` whenever a SIWE session is established in this tab, so
// views that loaded request data before sign-in (redacted signatures) can
// refetch it.
const useOnSiweSession = (callback: () => void) => {
  const latest = useRef(callback)
  useEffect(() => {
    latest.current = callback
  }, [callback])

  useEffect(() => {
    const onSession = () => latest.current()
    window.addEventListener(SIWE_SESSION_EVENT, onSession)
    return () => window.removeEventListener(SIWE_SESSION_EVENT, onSession)
  }, [])
}

export default useOnSiweSession
