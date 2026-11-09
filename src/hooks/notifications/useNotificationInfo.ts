import { useCallback } from 'react'
import { toast } from 'sonner'

// Stable across renders: callers list it as a useEffect dependency, and a new
// function per render re-fired the toast on every re-render.
const useNotificationInfo = (title?: string, description?: string) =>
  useCallback(() => {
    toast.info(title ?? 'Transaction sent', {
      description: description ?? 'Your transaction has been sent.'
    })
  }, [title, description])

export default useNotificationInfo
