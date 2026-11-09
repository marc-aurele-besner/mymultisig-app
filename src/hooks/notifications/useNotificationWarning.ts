import { useCallback } from 'react'
import { toast } from 'sonner'

// Stable across renders so it is safe as a useEffect dependency.
const useNotificationWarning = (title?: string, description?: string) =>
  useCallback(
    (overrideDescription?: string) => {
      toast.warning(title ?? 'Warning', {
        description: overrideDescription ?? description ?? ''
      })
    },
    [title, description]
  )

export default useNotificationWarning
