import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  notificationsOpen: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleCommandPalette: () => void
  setCommandPaletteOpen: (open: boolean) => void
  toggleNotifications: () => void
  setNotificationsOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      notificationsOpen: false,

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      toggleNotifications: () => set((s) => ({ notificationsOpen: !s.notificationsOpen })),
      setNotificationsOpen: (open) => set({ notificationsOpen: open }),
    }),
    {
      name: 'irib-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
