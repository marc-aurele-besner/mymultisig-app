import { toast } from 'sonner'

const useNotificationWarning = (title?: string, description?: string) => {
  return (overrideDescription?: string) => {
    toast.warning(title ?? 'Warning', {
      description: overrideDescription ?? description ?? ''
    })
  }
}

export default useNotificationWarning
