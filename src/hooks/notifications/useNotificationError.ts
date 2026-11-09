import { useCallback } from 'react'
import { toast } from 'sonner'

// Stable across renders: callers list it as a useEffect dependency, and a new
// function per render re-fired the toast on every re-render.
const useNotificationError = (title?: string, description?: string) =>
  useCallback(() => {
    toast.error(title ?? 'Error sending transaction', {
      description: description ?? 'Your transaction had an error.'
    })
  }, [title, description])

export default useNotificationError
