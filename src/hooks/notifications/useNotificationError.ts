import { toast } from 'sonner'

const useNotificationError = (title?: string, description?: string) => {
  return () => {
    toast.error(title ?? 'Error sending transaction', {
      description: description ?? 'Your transaction had an error.'
    })
  }
}

export default useNotificationError
