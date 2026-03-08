import { toast } from 'sonner'

const useNotificationInfo = (title?: string, description?: string) => {
  return () => {
    toast.info(title ?? 'Transaction sent', {
      description: description ?? 'Your transaction has been sent.'
    })
  }
}

export default useNotificationInfo
