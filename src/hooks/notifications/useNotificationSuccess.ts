import { toast } from 'sonner'

const useNotificationSuccess = (title?: string, description?: string) => {
  return () => {
    toast.success(title ?? 'Transaction mined', {
      description: description ?? 'Your transaction has been mined.'
    })
  }
}

export default useNotificationSuccess
