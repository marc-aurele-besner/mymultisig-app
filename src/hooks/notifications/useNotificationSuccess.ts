import { useToast } from '@chakra-ui/react'

const useNotificationSuccess = (title?: string, description?: string) => {
  const toast = useToast()

  return () => {
    toast({
      title: title || 'Transaction mined',
      description: description || 'Your transaction has been mined.',
      status: 'success',
      position: 'top-right',
      isClosable: true
    })
  }
}

export default useNotificationSuccess
