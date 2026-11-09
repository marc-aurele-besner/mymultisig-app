import { useMemo } from 'react'
import { useNotificationInfo, useNotificationError, useNotificationSuccess } from './index'

const useNotification = (title?: string, description?: string) => {
  const notificationInfo = useNotificationInfo(title, description)
  const notificationError = useNotificationError(title, description)
  const notificationSuccess = useNotificationSuccess(title, description)

  return useMemo(
    () => ({ notificationInfo, notificationError, notificationSuccess }),
    [notificationInfo, notificationError, notificationSuccess]
  )
}

export default useNotification
