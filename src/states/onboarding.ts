import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface OnboardingState {
  // The user hid the getting-started checklist from the sidebar and inbox.
  dismissed: boolean
  // The user opened a notification settings page. There is no cheap way to
  // know whether a channel is fully set up across Slack, Discord, Telegram
  // and email, so the last checklist step is "looked at it".
  notificationsVisited: boolean
  setDismissed: (dismissed: boolean) => void
  markNotificationsVisited: () => void
}

const useOnboardingState = create<OnboardingState>()(
  persist(
    (set) => ({
      dismissed: false,
      notificationsVisited: false,
      setDismissed: (dismissed) => set(() => ({ dismissed })),
      markNotificationsVisited: () => set(() => ({ notificationsVisited: true }))
    }),
    { name: 'onboarding-storage', storage: createJSONStorage(() => localStorage) }
  )
)

export default useOnboardingState
