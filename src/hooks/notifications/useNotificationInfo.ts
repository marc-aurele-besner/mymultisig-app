import { useToast } from '@chakra-ui/react'

const useNotificationInfo = (title?: string, description?: string) => {
  const toast = useToast()

  return () => {
    toast({
      title: title || 'Transaction sent',
      description: description || 'Your transaction has been sent.',
      status: 'info',
      position: 'top-right',
      isClosable: true
    })
  }
}

export default useNotificationInfo
