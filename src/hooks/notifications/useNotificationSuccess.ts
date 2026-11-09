import { useCallback } from 'react'
import { toast } from 'sonner'

// Stable across renders: callers list it as a useEffect dependency, and a new
// function per render re-fired the toast on every re-render.
const useNotificationSuccess = (title?: string, description?: string) =>
  useCallback(() => {
    toast.success(title ?? 'Transaction mined', {
      description: description ?? 'Your transaction has been mined.'
    })
  }, [title, description])

export default useNotificationSuccess
