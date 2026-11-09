import { create } from 'zustand'

interface ConnectModalState {
  open: boolean
  setOpen: (open: boolean) => void
}

// Open state of the wallet connect dialog. Not persisted. It is a store so
// any "Connect" button (top bar, prompts, checklist) can open the one dialog
// mounted in Layout.
const useConnectModal = create<ConnectModalState>()((set) => ({
  open: false,
  setOpen: (open) => set(() => ({ open }))
}))

export default useConnectModal
