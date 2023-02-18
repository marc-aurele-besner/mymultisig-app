import { useToast } from '@chakra-ui/react'

const useNotificationError = (title?: string, description?: string) => {
  const toast = useToast()

  return () => {
    toast({
      title: title || 'Error sending transaction',
      description: description || 'Your transaction had an error.',
      status: 'error',
      position: 'top-right',
      isClosable: true
    })
  }
}

export default useNotificationError
